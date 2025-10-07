import { Request, Response } from 'express';
import db from '../config/database';
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// Unlock journal (verify PIN or biometric)
export const unlockJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { pin } = req.body;

    if (!pin) {
      res.status(400).json({ error: 'PIN required' });
      return;
    }

    const securityResult = await db.query(
      'SELECT * FROM journal_security WHERE user_id = $1',
      [userId]
    );

    if (securityResult.rows.length === 0) {
      res.status(404).json({ error: 'Journal security not set up' });
      return;
    }

    const security = securityResult.rows[0];

    // Check if locked
    if (security.locked_until && new Date(security.locked_until) > new Date()) {
      res.status(423).json({ error: 'Journal is locked. Try again later.' });
      return;
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, security.pin_hash);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = security.failed_attempts + 1;
      let lockedUntil = null;

      if (failedAttempts >= 3) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }

      await db.query(
        'UPDATE journal_security SET failed_attempts = $1, locked_until = $2 WHERE user_id = $3',
        [failedAttempts, lockedUntil, userId]
      );

      res.status(401).json({ 
        error: 'Invalid PIN',
        attemptsRemaining: Math.max(0, 3 - failedAttempts)
      });
      return;
    }

    // Reset failed attempts
    await db.query(
      'UPDATE journal_security SET failed_attempts = 0, locked_until = NULL WHERE user_id = $1',
      [userId]
    );

    // Generate temporary journal access token (15 minutes)
    const jwt = require('jsonwebtoken');
    const journalToken = jwt.sign(
      { userId, scope: 'journal' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    res.json({ 
      accessToken: journalToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
  } catch (error) {
    console.error('Unlock journal error:', error);
    res.status(500).json({ error: 'Failed to unlock journal' });
  }
};

// Set up journal security
export const setupJournalSecurity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { pin, authMethod } = req.body;

    if (!pin) {
      res.status(400).json({ error: 'PIN required' });
      return;
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await db.query(
      `INSERT INTO journal_security (user_id, auth_method, pin_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET
        auth_method = EXCLUDED.auth_method,
        pin_hash = EXCLUDED.pin_hash,
        updated_at = CURRENT_TIMESTAMP`,
      [userId, authMethod || 'pin', pinHash]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Setup journal security error:', error);
    res.status(500).json({ error: 'Failed to set up journal security' });
  }
};

// Get journal entries (list only, encrypted content not returned)
export const getJournalEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT entry_id, entry_date, prompt_used, word_count, created_at
      FROM journal_entries
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (startDate) {
      query += ` AND entry_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND entry_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' ORDER BY entry_date DESC';

    const result = await db.query(query, params);
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Failed to get journal entries' });
  }
};

// Get single journal entry (decrypted)
export const getJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { entryId } = req.params;

    const result = await db.query(
      'SELECT * FROM journal_entries WHERE entry_id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const entry = result.rows[0];

    // Decrypt content
    const decryptedContent = CryptoJS.AES.decrypt(
      entry.encrypted_content,
      process.env.ENCRYPTION_KEY as string
    ).toString(CryptoJS.enc.Utf8);

    res.json({
      entry: {
        entryId: entry.entry_id,
        entryDate: entry.entry_date,
        content: decryptedContent,
        promptUsed: entry.prompt_used,
        wordCount: entry.word_count,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ error: 'Failed to get journal entry' });
  }
};

// Create journal entry
export const createJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { content, promptUsed, entryDate } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content required' });
      return;
    }

    // Encrypt content
    const encryptedContent = CryptoJS.AES.encrypt(
      content,
      process.env.ENCRYPTION_KEY as string
    ).toString();

    const wordCount = content.split(/\s+/).length;

    const result = await db.query(
      `INSERT INTO journal_entries (
        user_id, entry_date, encrypted_content, encryption_key_id,
        prompt_used, word_count
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING entry_id, entry_date, prompt_used, word_count, created_at`,
      [userId, entryDate || new Date(), encryptedContent, 'default', promptUsed, wordCount]
    );

    res.status(201).json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
};

// Update journal entry
export const updateJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { entryId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content required' });
      return;
    }

    // Encrypt content
    const encryptedContent = CryptoJS.AES.encrypt(
      content,
      process.env.ENCRYPTION_KEY as string
    ).toString();

    const wordCount = content.split(/\s+/).length;

    const result = await db.query(
      `UPDATE journal_entries SET
        encrypted_content = $1,
        word_count = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE entry_id = $3 AND user_id = $4
      RETURNING entry_id, entry_date, prompt_used, word_count, updated_at`,
      [encryptedContent, wordCount, entryId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
};

// Delete journal entry
export const deleteJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { entryId } = req.params;

    const result = await db.query(
      'DELETE FROM journal_entries WHERE entry_id = $1 AND user_id = $2 RETURNING entry_id',
      [entryId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
};

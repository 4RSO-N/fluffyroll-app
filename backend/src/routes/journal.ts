import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';

const router = Router();

// Setup journal security
router.post('/security', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pin, authMethod } = req.body;

    const hashedPin = await bcrypt.hash(pin, 10);

    const security = await prisma.journalSecurity.upsert({
      where: { userId: req.userId! },
      update: { pin: hashedPin, authMethod },
      create: {
        userId: req.userId!,
        pin: hashedPin,
        authMethod,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Setup security error:', error);
    res.status(500).json({ error: 'Failed to setup security' });
  }
});

// Unlock journal
router.post('/unlock', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;

    const security = await prisma.journalSecurity.findUnique({
      where: { userId: req.userId! },
    });

    if (!security) {
      return res.status(404).json({ error: 'Security not setup' });
    }

    const valid = await bcrypt.compare(pin, security.pin);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Unlock error:', error);
    res.status(500).json({ error: 'Failed to unlock' });
  }
});

// Get all entries
router.get('/entries', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to get entries' });
  }
});

// Get single entry
router.get('/entries/:entryId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== req.userId) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Failed to get entry' });
  }
});

// Create entry
router.post('/entries', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content, promptUsed } = req.body;

    const entry = await prisma.journalEntry.create({
      data: {
        userId: req.userId!,
        content,
        promptUsed,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update entry
router.put('/entries/:entryId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    const { content } = req.body;

    const entry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: { content },
    });

    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry
router.delete('/entries/:entryId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;

    await prisma.journalEntry.delete({
      where: { id: entryId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;

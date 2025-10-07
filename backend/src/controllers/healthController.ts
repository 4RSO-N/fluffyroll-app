import { Request, Response } from 'express';
import db from '../config/database';

// Get health timeline
export const getHealthTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, types } = req.query;

    let query = `
      SELECT ht.*,
        CASE ht.entry_type
          WHEN 'symptom' THEN json_build_object('symptom', s.*)
          WHEN 'mood' THEN json_build_object('mood', m.*)
          WHEN 'medication' THEN json_build_object('medication', med.*)
          WHEN 'supplement' THEN json_build_object('supplement', sup.*)
        END as data
      FROM health_timeline ht
      LEFT JOIN symptoms s ON ht.entry_id = s.timeline_entry_id
      LEFT JOIN moods m ON ht.entry_id = m.timeline_entry_id
      LEFT JOIN medications med ON ht.entry_id = med.timeline_entry_id
      LEFT JOIN supplements sup ON ht.entry_id = sup.timeline_entry_id
      WHERE ht.user_id = $1
    `;
    const params: any[] = [userId];

    if (startDate) {
      query += ` AND ht.entry_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND ht.entry_date <= $${params.length + 1}`;
      params.push(endDate);
    }
    if (types) {
      const typeArray = (types as string).split(',');
      query += ` AND ht.entry_type = ANY($${params.length + 1})`;
      params.push(typeArray);
    }

    query += ' ORDER BY ht.entry_date DESC';

    const result = await db.query(query, params);
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get health timeline error:', error);
    res.status(500).json({ error: 'Failed to get health timeline' });
  }
};

// Log symptom
export const logSymptom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { symptomName, severity, bodyPart, notes, entryDate, tags } = req.body;

    if (!symptomName) {
      res.status(400).json({ error: 'Symptom name required' });
      return;
    }

    // Create timeline entry
    const timelineResult = await db.query(
      `INSERT INTO health_timeline (user_id, entry_type, entry_date)
      VALUES ($1, 'symptom', $2)
      RETURNING *`,
      [userId, entryDate || new Date()]
    );

    const entryId = timelineResult.rows[0].entry_id;

    // Create symptom
    const symptomResult = await db.query(
      `INSERT INTO symptoms (
        timeline_entry_id, symptom_name, severity, body_part, notes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [entryId, symptomName, severity, bodyPart, notes, tags || []]
    );

    res.status(201).json({ 
      symptom: symptomResult.rows[0],
      timelineEntry: timelineResult.rows[0]
    });
  } catch (error) {
    console.error('Log symptom error:', error);
    res.status(500).json({ error: 'Failed to log symptom' });
  }
};

// Log mood
export const logMood = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { moodRating, moodDescriptor, energyLevel, notes, entryDate } = req.body;

    if (!moodRating) {
      res.status(400).json({ error: 'Mood rating required' });
      return;
    }

    const timelineResult = await db.query(
      `INSERT INTO health_timeline (user_id, entry_type, entry_date)
      VALUES ($1, 'mood', $2)
      RETURNING *`,
      [userId, entryDate || new Date()]
    );

    const entryId = timelineResult.rows[0].entry_id;

    const moodResult = await db.query(
      `INSERT INTO moods (
        timeline_entry_id, mood_rating, mood_descriptor, energy_level, notes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [entryId, moodRating, moodDescriptor, energyLevel, notes]
    );

    res.status(201).json({ 
      mood: moodResult.rows[0],
      timelineEntry: timelineResult.rows[0]
    });
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
};

// Log medication
export const logMedication = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { medicationName, dosage, takenAt, wasTaken, notes } = req.body;

    if (!medicationName) {
      res.status(400).json({ error: 'Medication name required' });
      return;
    }

    const timelineResult = await db.query(
      `INSERT INTO health_timeline (user_id, entry_type, entry_date)
      VALUES ($1, 'medication', $2)
      RETURNING *`,
      [userId, takenAt || new Date()]
    );

    const entryId = timelineResult.rows[0].entry_id;

    const medResult = await db.query(
      `INSERT INTO medications (
        timeline_entry_id, medication_name, dosage, taken_at, was_taken, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [entryId, medicationName, dosage, takenAt || new Date(), wasTaken !== false, notes]
    );

    res.status(201).json({ 
      medication: medResult.rows[0],
      timelineEntry: timelineResult.rows[0]
    });
  } catch (error) {
    console.error('Log medication error:', error);
    res.status(500).json({ error: 'Failed to log medication' });
  }
};

// Log supplement
export const logSupplement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { supplementName, dosage, takenAt, wasTaken } = req.body;

    if (!supplementName) {
      res.status(400).json({ error: 'Supplement name required' });
      return;
    }

    const timelineResult = await db.query(
      `INSERT INTO health_timeline (user_id, entry_type, entry_date)
      VALUES ($1, 'supplement', $2)
      RETURNING *`,
      [userId, takenAt || new Date()]
    );

    const entryId = timelineResult.rows[0].entry_id;

    const supResult = await db.query(
      `INSERT INTO supplements (
        timeline_entry_id, supplement_name, dosage, taken_at, was_taken
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [entryId, supplementName, dosage, takenAt || new Date(), wasTaken !== false]
    );

    res.status(201).json({ 
      supplement: supResult.rows[0],
      timelineEntry: timelineResult.rows[0]
    });
  } catch (error) {
    console.error('Log supplement error:', error);
    res.status(500).json({ error: 'Failed to log supplement' });
  }
};

// Delete timeline entry
export const deleteTimelineEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { entryId } = req.params;

    const result = await db.query(
      'DELETE FROM health_timeline WHERE entry_id = $1 AND user_id = $2 RETURNING entry_id',
      [entryId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete timeline entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

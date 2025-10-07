import { Request, Response } from 'express';
import db from '../config/database';

// Get cycle overview
export const getCycleOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Get last period
    const lastPeriodResult = await db.query(
      `SELECT * FROM cycle_periods 
      WHERE user_id = $1 AND is_confirmed = true
      ORDER BY start_date DESC LIMIT 1`,
      [userId]
    );

    // Get predictions
    const predictionResult = await db.query(
      `SELECT * FROM cycle_predictions 
      WHERE user_id = $1
      ORDER BY generated_at DESC LIMIT 1`,
      [userId]
    );

    const lastPeriod = lastPeriodResult.rows[0];
    const prediction = predictionResult.rows[0];

    let currentPhase = 'unknown';
    let currentDay = 0;

    if (lastPeriod) {
      const today = new Date();
      const startDate = new Date(lastPeriod.start_date);
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      currentDay = daysSinceStart + 1;
      
      if (daysSinceStart <= 5) {
        currentPhase = 'menstrual';
      } else if (daysSinceStart <= 13) {
        currentPhase = 'follicular';
      } else if (daysSinceStart <= 16) {
        currentPhase = 'ovulation';
      } else {
        currentPhase = 'luteal';
      }
    }

    res.json({
      currentPhase,
      currentDay,
      cycleLength: lastPeriod?.cycle_length_days || 28,
      lastPeriod,
      nextPredicted: prediction
    });
  } catch (error) {
    console.error('Get cycle overview error:', error);
    res.status(500).json({ error: 'Failed to get cycle overview' });
  }
};

// Get cycle calendar
export const getCycleCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    // Get periods
    const periodsResult = await db.query(
      `SELECT * FROM cycle_periods 
      WHERE user_id = $1 
      AND start_date >= $2 
      AND start_date <= $3
      ORDER BY start_date`,
      [userId, startDate || '2020-01-01', endDate || '2030-12-31']
    );

    // Get predictions
    const predictionsResult = await db.query(
      `SELECT * FROM cycle_predictions 
      WHERE user_id = $1
      AND predicted_period_start >= $2
      AND predicted_period_start <= $3
      ORDER BY predicted_period_start`,
      [userId, startDate || '2020-01-01', endDate || '2030-12-31']
    );

    // Get daily logs
    const logsResult = await db.query(
      `SELECT * FROM cycle_daily_logs 
      WHERE user_id = $1
      AND log_date >= $2
      AND log_date <= $3
      ORDER BY log_date`,
      [userId, startDate || '2020-01-01', endDate || '2030-12-31']
    );

    res.json({
      periods: periodsResult.rows,
      predictions: predictionsResult.rows,
      dailyLogs: logsResult.rows
    });
  } catch (error) {
    console.error('Get cycle calendar error:', error);
    res.status(500).json({ error: 'Failed to get cycle calendar' });
  }
};

// Log period
export const logPeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.body;

    if (!startDate) {
      res.status(400).json({ error: 'Start date required' });
      return;
    }

    let cycleLength = null;
    
    // Calculate cycle length if there's a previous period
    const prevPeriodResult = await db.query(
      `SELECT start_date FROM cycle_periods 
      WHERE user_id = $1 AND start_date < $2
      ORDER BY start_date DESC LIMIT 1`,
      [userId, startDate]
    );

    if (prevPeriodResult.rows.length > 0) {
      const prevStart = new Date(prevPeriodResult.rows[0].start_date);
      const currentStart = new Date(startDate);
      cycleLength = Math.floor((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
    }

    const result = await db.query(
      `INSERT INTO cycle_periods (user_id, start_date, end_date, cycle_length_days, is_confirmed)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *`,
      [userId, startDate, endDate, cycleLength]
    );

      // Generate predictions based on this data
    if (cycleLength && userId) {
      await generatePredictions(userId, startDate, cycleLength);
    }


    res.status(201).json({ period: result.rows[0] });
  } catch (error) {
    console.error('Log period error:', error);
    res.status(500).json({ error: 'Failed to log period' });
  }
};

// Update period
export const updatePeriod = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { periodId } = req.params;
    const { endDate, isConfirmed } = req.body;

    const result = await db.query(
      `UPDATE cycle_periods SET
        end_date = COALESCE($1, end_date),
        is_confirmed = COALESCE($2, is_confirmed)
      WHERE period_id = $3 AND user_id = $4
      RETURNING *`,
      [endDate, isConfirmed, periodId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Period not found' });
      return;
    }

    res.json({ period: result.rows[0] });
  } catch (error) {
    console.error('Update period error:', error);
    res.status(500).json({ error: 'Failed to update period' });
  }
};

// Log daily cycle data
export const logDailyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { logDate, flowLevel, symptoms, mood, sexualActivity, notes } = req.body;

    const date = logDate || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `INSERT INTO cycle_daily_logs (
        user_id, log_date, flow_level, symptoms, mood, sexual_activity, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, log_date) DO UPDATE SET
        flow_level = EXCLUDED.flow_level,
        symptoms = EXCLUDED.symptoms,
        mood = EXCLUDED.mood,
        sexual_activity = EXCLUDED.sexual_activity,
        notes = EXCLUDED.notes
      RETURNING *`,
      [userId, date, flowLevel, symptoms || [], mood, sexualActivity || false, notes]
    );

    res.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Log daily data error:', error);
    res.status(500).json({ error: 'Failed to log daily data' });
  }
};

// Get daily log
export const getDailyLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date } = req.params;

    const result = await db.query(
      'SELECT * FROM cycle_daily_logs WHERE user_id = $1 AND log_date = $2',
      [userId, date]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }

    res.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Get daily log error:', error);
    res.status(500).json({ error: 'Failed to get daily log' });
  }
};

// Log ovulation test
export const logOvulationTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { testDate, result, notes } = req.body;

    if (!testDate || !result) {
      res.status(400).json({ error: 'Test date and result required' });
      return;
    }

    const testResult = await db.query(
      `INSERT INTO ovulation_tests (user_id, test_date, result, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, testDate, result, notes]
    );

    res.status(201).json({ test: testResult.rows[0] });
  } catch (error) {
    console.error('Log ovulation test error:', error);
    res.status(500).json({ error: 'Failed to log ovulation test' });
  }
};

// Get cycle insights
export const getCycleInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Calculate average cycle length
    const cycleLengthResult = await db.query(
      `SELECT AVG(cycle_length_days) as avg_length, 
       STDDEV(cycle_length_days) as variability
      FROM cycle_periods 
      WHERE user_id = $1 AND cycle_length_days IS NOT NULL`,
      [userId]
    );

    // Get common symptoms
    const symptomsResult = await db.query(
      `SELECT UNNEST(symptoms) as symptom, COUNT(*) as count
      FROM cycle_daily_logs
      WHERE user_id = $1 AND symptoms IS NOT NULL
      GROUP BY symptom
      ORDER BY count DESC
      LIMIT 10`,
      [userId]
    );

    res.json({
      averageCycleLength: parseFloat(cycleLengthResult.rows[0]?.avg_length) || null,
      cycleLengthVariability: parseFloat(cycleLengthResult.rows[0]?.variability) || null,
      commonSymptoms: symptomsResult.rows
    });
  } catch (error) {
    console.error('Get cycle insights error:', error);
    res.status(500).json({ error: 'Failed to get cycle insights' });
  }
};

// Helper function to generate predictions
async function generatePredictions(userId: string, lastPeriodStart: string, cycleLength: number): Promise<void> {
  try {
    const nextPeriodStart = new Date(lastPeriodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + cycleLength);

    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 5);

    const ovulationStart = new Date(nextPeriodStart);
    ovulationStart.setDate(ovulationStart.getDate() - 14);

    const ovulationEnd = new Date(ovulationStart);
    ovulationEnd.setDate(ovulationEnd.getDate() + 2);

    await db.query(
      `INSERT INTO cycle_predictions (
        user_id, predicted_period_start, predicted_period_end,
        predicted_ovulation_start, predicted_ovulation_end, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, 0.85)`,
      [userId, nextPeriodStart, nextPeriodEnd, ovulationStart, ovulationEnd]
    );
  } catch (error) {
    console.error('Generate predictions error:', error);
  }
}

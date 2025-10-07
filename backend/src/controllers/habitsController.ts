import { Request, Response } from 'express';
import db from '../config/database';

// Get all habits with completions
export const getHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const habitsResult = await db.query(
      `SELECT h.*, 
        COALESCE(hs.current_streak, 0) as current_streak,
        COALESCE(hs.longest_streak, 0) as longest_streak
      FROM habits h
      LEFT JOIN habit_streaks hs ON h.habit_id = hs.habit_id
      WHERE h.user_id = $1
      ORDER BY h.order_position, h.created_at`,
      [userId]
    );

    // Get today's completions
    const today = new Date().toISOString().split('T')[0];
    const completionsResult = await db.query(
      `SELECT habit_id, completion_date 
      FROM habit_completions 
      WHERE habit_id = ANY($1) AND completion_date = $2`,
      [habitsResult.rows.map(h => h.habit_id), today]
    );

    const completions = completionsResult.rows.reduce((acc, c) => {
      acc[c.habit_id] = true;
      return acc;
    }, {} as Record<string, boolean>);

    res.json({
      habits: habitsResult.rows,
      completions,
      date: today
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to get habits' });
  }
};

// Create habit
export const createHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      habitName,
      description,
      frequency,
      targetDaysPerWeek,
      colorHex,
      iconName
    } = req.body;

    if (!habitName) {
      res.status(400).json({ error: 'Habit name required' });
      return;
    }

    const result = await db.query(
      `INSERT INTO habits (
        user_id, habit_name, description, frequency,
        target_days_per_week, color_hex, icon_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [userId, habitName, description, frequency || 'daily',
       targetDaysPerWeek || 7, colorHex || '#005B6A', iconName]
    );

    // Create initial streak record
    await db.query(
      'INSERT INTO habit_streaks (habit_id) VALUES ($1)',
      [result.rows[0].habit_id]
    );

    res.status(201).json({ habit: result.rows[0] });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
};

// Update habit
export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { habitId } = req.params;
    const { habitName, description, isActive, orderPosition } = req.body;

    const result = await db.query(
      `UPDATE habits SET
        habit_name = COALESCE($1, habit_name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        order_position = COALESCE($4, order_position)
      WHERE habit_id = $5 AND user_id = $6
      RETURNING *`,
      [habitName, description, isActive, orderPosition, habitId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.json({ habit: result.rows[0] });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
};

// Delete habit
export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { habitId } = req.params;

    const result = await db.query(
      'DELETE FROM habits WHERE habit_id = $1 AND user_id = $2 RETURNING habit_id',
      [habitId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
};

// Complete habit
export const completeHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { habitId } = req.params;
    const { completionDate, notes } = req.body;

    const date = completionDate || new Date().toISOString().split('T')[0];

    // Verify habit belongs to user
    const habitCheck = await db.query(
      'SELECT habit_id FROM habits WHERE habit_id = $1 AND user_id = $2',
      [habitId, userId]
    );

    if (habitCheck.rows.length === 0) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    // Insert completion
    const completionResult = await db.query(
      `INSERT INTO habit_completions (habit_id, completion_date, notes)
      VALUES ($1, $2, $3)
      ON CONFLICT (habit_id, completion_date) DO NOTHING
      RETURNING *`,
      [habitId, date, notes]
    );

    // Update streak
    await updateStreak(habitId);

    // Check for achievements
    const streakResult = await db.query(
      'SELECT current_streak FROM habit_streaks WHERE habit_id = $1',
      [habitId]
    );

    const currentStreak = streakResult.rows[0]?.current_streak || 0;
    let achievementEarned = null;

    // Award achievements for milestones
    if (currentStreak === 7 && userId) {
      achievementEarned = await awardAchievement(userId, 'first_week', 'First Week Complete', '7-day streak achieved!');
    } else if (currentStreak === 30 && userId) {
      achievementEarned = await awardAchievement(userId, 'month_streak', 'Month Strong', '30-day streak achieved!');
    }


    res.status(201).json({
      completion: completionResult.rows[0],
      streak: streakResult.rows[0],
      achievementEarned
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
};

// Uncomplete habit (delete completion)
export const uncompleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { habitId, date } = req.params;

    // Verify habit belongs to user
    const habitCheck = await db.query(
      'SELECT habit_id FROM habits WHERE habit_id = $1 AND user_id = $2',
      [habitId, userId]
    );

    if (habitCheck.rows.length === 0) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    await db.query(
      'DELETE FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
      [habitId, date]
    );

    // Update streak
    await updateStreak(habitId);

    const streakResult = await db.query(
      'SELECT * FROM habit_streaks WHERE habit_id = $1',
      [habitId]
    );

    res.json({ success: true, streak: streakResult.rows[0] });
  } catch (error) {
    console.error('Uncomplete habit error:', error);
    res.status(500).json({ error: 'Failed to uncomplete habit' });
  }
};

// Get achievements
export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await db.query(
      `SELECT * FROM user_achievements 
      WHERE user_id = $1 
      ORDER BY earned_at DESC`,
      [userId]
    );

    const unviewedCount = result.rows.filter(a => !a.is_viewed).length;

    res.json({
      achievements: result.rows,
      unviewedCount
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
};

// Helper function to update streak
async function updateStreak(habitId: string): Promise<void> {
  const completionsResult = await db.query(
    `SELECT completion_date FROM habit_completions 
    WHERE habit_id = $1 
    ORDER BY completion_date DESC`,
    [habitId]
  );

  const completions = completionsResult.rows.map(r => new Date(r.completion_date));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (completions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if completed today or yesterday for current streak
    const lastCompletion = completions[0];
    lastCompletion.setHours(0, 0, 0, 0);

    if (lastCompletion.getTime() === today.getTime() || 
        lastCompletion.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      
      for (let i = 1; i < completions.length; i++) {
        const current = new Date(completions[i]);
        current.setHours(0, 0, 0, 0);
        const previous = new Date(completions[i - 1]);
        previous.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < completions.length; i++) {
      const current = new Date(completions[i]);
      current.setHours(0, 0, 0, 0);
      const previous = new Date(completions[i - 1]);
      previous.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  }

  await db.query(
    `UPDATE habit_streaks SET
      current_streak = $1,
      longest_streak = GREATEST(longest_streak, $2),
      last_completion_date = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE habit_id = $4`,
    [currentStreak, longestStreak, completions[0] || null, habitId]
  );
}

// Helper function to award achievement
async function awardAchievement(
  userId: string,
  achievementType: string,
  achievementName: string,
  description: string
): Promise<any> {
  try {
    const existing = await db.query(
      'SELECT achievement_id FROM user_achievements WHERE user_id = $1 AND achievement_type = $2',
      [userId, achievementType]
    );

    if (existing.rows.length > 0) {
      return null; // Already earned
    }

    const result = await db.query(
      `INSERT INTO user_achievements (
        user_id, achievement_type, achievement_name, achievement_description
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, achievementType, achievementName, description]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Award achievement error:', error);
    return null;
  }
}

import { Request, Response } from 'express';
import db from '../config/database';

// Get fitness profile
export const getFitnessProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await db.query(
      'SELECT * FROM fitness_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Fitness profile not found' });
      return;
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get fitness profile error:', error);
    res.status(500).json({ error: 'Failed to get fitness profile' });
  }
};

// Create or update fitness profile
export const upsertFitnessProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      currentWeightKg,
      targetWeightKg,
      heightCm,
      dailyCalorieGoal,
      dailyProteinG,
      dailyCarbsG,
      dailyFatG,
      dailyWaterGlasses,
      activityLevel
    } = req.body;

    const result = await db.query(
      `INSERT INTO fitness_profiles (
        user_id, current_weight_kg, target_weight_kg, height_cm,
        daily_calorie_goal, daily_protein_g, daily_carbs_g, daily_fat_g,
        daily_water_glasses, activity_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        current_weight_kg = EXCLUDED.current_weight_kg,
        target_weight_kg = EXCLUDED.target_weight_kg,
        height_cm = EXCLUDED.height_cm,
        daily_calorie_goal = EXCLUDED.daily_calorie_goal,
        daily_protein_g = EXCLUDED.daily_protein_g,
        daily_carbs_g = EXCLUDED.daily_carbs_g,
        daily_fat_g = EXCLUDED.daily_fat_g,
        daily_water_glasses = EXCLUDED.daily_water_glasses,
        activity_level = EXCLUDED.activity_level,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [userId, currentWeightKg, targetWeightKg, heightCm, dailyCalorieGoal,
       dailyProteinG, dailyCarbsG, dailyFatG, dailyWaterGlasses, activityLevel]
    );

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Upsert fitness profile error:', error);
    res.status(500).json({ error: 'Failed to save fitness profile' });
  }
};

// Get fitness dashboard (today's summary)
export const getFitnessDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];

    // Get profile with goals
    const profileResult = await db.query(
      'SELECT * FROM fitness_profiles WHERE user_id = $1',
      [userId]
    );

    // Get meals for the day
    const mealsResult = await db.query(
      `SELECT m.*, 
        COALESCE(SUM(mi.calories), 0) as total_calories,
        COALESCE(SUM(mi.protein_g), 0) as total_protein,
        COALESCE(SUM(mi.carbs_g), 0) as total_carbs,
        COALESCE(SUM(mi.fat_g), 0) as total_fat
      FROM meals m
      LEFT JOIN meal_items mi ON m.meal_id = mi.meal_id
      WHERE m.user_id = $1 AND DATE(m.consumed_at) = $2
      GROUP BY m.meal_id`,
      [userId, date]
    );

    // Get workouts for the day
    const workoutsResult = await db.query(
      `SELECT * FROM workouts 
      WHERE user_id = $1 AND DATE(started_at) = $2
      ORDER BY started_at DESC`,
      [userId, date]
    );

    // Get water intake
    const waterResult = await db.query(
      `SELECT COALESCE(SUM(glasses), 0) as total_glasses
      FROM water_logs
      WHERE user_id = $1 AND log_date = $2`,
      [userId, date]
    );

    // Calculate totals
    const totalCaloriesConsumed = mealsResult.rows.reduce((sum, meal) => 
      sum + (parseInt(meal.total_calories) || 0), 0
    );
    const totalCaloriesBurned = workoutsResult.rows.reduce((sum, workout) => 
      sum + (workout.total_calories_burned || 0), 0
    );

    const profile = profileResult.rows[0] || {};

    res.json({
      date,
      caloriesConsumed: totalCaloriesConsumed,
      caloriesGoal: profile.daily_calorie_goal || 2000,
      caloriesBurned: totalCaloriesBurned,
      macros: {
        protein: mealsResult.rows.reduce((sum, m) => sum + (parseFloat(m.total_protein) || 0), 0),
        proteinGoal: profile.daily_protein_g || 150,
        carbs: mealsResult.rows.reduce((sum, m) => sum + (parseFloat(m.total_carbs) || 0), 0),
        carbsGoal: profile.daily_carbs_g || 200,
        fat: mealsResult.rows.reduce((sum, m) => sum + (parseFloat(m.total_fat) || 0), 0),
        fatGoal: profile.daily_fat_g || 65
      },
      waterIntake: parseInt(waterResult.rows[0].total_glasses) || 0,
      waterGoal: profile.daily_water_glasses || 8,
      mealsCount: mealsResult.rows.length,
      workoutsCompleted: workoutsResult.rows.length
    });
  } catch (error) {
    console.error('Get fitness dashboard error:', error);
    res.status(500).json({ error: 'Failed to get fitness dashboard' });
  }
};

// Create meal
export const createMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { mealType, mealName, consumedAt, items } = req.body;

    if (!mealType || !items || items.length === 0) {
      res.status(400).json({ error: 'Meal type and items required' });
      return;
    }

    // Calculate totals
    const totals = items.reduce((acc: any, item: any) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein_g || 0),
      carbs: acc.carbs + (item.carbs_g || 0),
      fat: acc.fat + (item.fat_g || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Insert meal
    const mealResult = await db.query(
      `INSERT INTO meals (
        user_id, meal_type, meal_name, consumed_at,
        total_calories, total_protein_g, total_carbs_g, total_fat_g
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [userId, mealType, mealName, consumedAt || new Date(),
       totals.calories, totals.protein, totals.carbs, totals.fat]
    );

    const mealId = mealResult.rows[0].meal_id;

    // Insert meal items
    for (const item of items) {
      await db.query(
        `INSERT INTO meal_items (
          meal_id, food_name, serving_size, serving_quantity,
          calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
          food_database_id, barcode, is_custom
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [mealId, item.foodName, item.servingSize, item.servingQuantity || 1,
         item.calories, item.protein_g, item.carbs_g, item.fat_g,
         item.fiber_g, item.sugar_g, item.sodium_mg,
         item.foodDatabaseId, item.barcode, item.isCustom || false]
      );
    }

    res.status(201).json({ meal: mealResult.rows[0] });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
};

// Get meals
export const getMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT m.*, 
        json_agg(mi.*) as items
      FROM meals m
      LEFT JOIN meal_items mi ON m.meal_id = mi.meal_id
      WHERE m.user_id = $1
    `;
    const params: any[] = [userId];

    if (startDate) {
      query += ` AND m.consumed_at >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND m.consumed_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' GROUP BY m.meal_id ORDER BY m.consumed_at DESC';

    const result = await db.query(query, params);
    res.json({ meals: result.rows });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
};

// Delete meal
export const deleteMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { mealId } = req.params;

    const result = await db.query(
      'DELETE FROM meals WHERE meal_id = $1 AND user_id = $2 RETURNING meal_id',
      [mealId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

// Log water
export const logWater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { glasses, loggedAt } = req.body;

    const result = await db.query(
      `INSERT INTO water_logs (user_id, glasses, logged_at, log_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, glasses || 1, loggedAt || new Date(), 
       (loggedAt ? new Date(loggedAt) : new Date()).toISOString().split('T')[0]]
    );

    res.status(201).json({ log: result.rows[0] });
  } catch (error) {
    console.error('Log water error:', error);
    res.status(500).json({ error: 'Failed to log water' });
  }
};

// Create workout
export const createWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { workoutName, workoutType, startedAt, completedAt, exercises } = req.body;

    if (!startedAt) {
      res.status(400).json({ error: 'Start time required' });
      return;
    }

    const workoutResult = await db.query(
      `INSERT INTO workouts (
        user_id, workout_name, workout_type, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, workoutName, workoutType, startedAt, completedAt]
    );

    const workoutId = workoutResult.rows[0].workout_id;

    // Insert exercises if provided
    if (exercises && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await db.query(
          `INSERT INTO workout_exercises (
            workout_id, exercise_id, exercise_order, sets, reps, weight_kg,
            duration_seconds, distance_km, calories_burned, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [workoutId, ex.exerciseId, i, ex.sets, ex.reps, ex.weightKg,
           ex.durationSeconds, ex.distanceKm, ex.caloriesBurned, ex.notes]
        );
      }
    }

    res.status(201).json({ workout: workoutResult.rows[0] });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

// Get workouts
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM workouts WHERE user_id = $1';
    const params: any[] = [userId];

    if (startDate) {
      query += ` AND started_at >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND started_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ' ORDER BY started_at DESC';

    const result = await db.query(query, params);
    res.json({ workouts: result.rows });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
};

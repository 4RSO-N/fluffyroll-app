import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get fitness profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.fitnessProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Create/Update fitness profile
router.post('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.fitnessProfile.upsert({
      where: { userId: req.userId! },
      update: req.body,
      create: {
        userId: req.userId!,
        ...req.body,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Update fitness profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.fitnessProfile.update({
      where: { userId: req.userId! },
      data: req.body,
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get dashboard
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create fitness profile
    let profile = await prisma.fitnessProfile.findUnique({
      where: { userId: req.userId! },
    });

    // If no profile exists, create default one
    if (!profile) {
      profile = await prisma.fitnessProfile.create({
        data: {
          userId: req.userId!,
          currentWeightKg: 70,
          targetWeightKg: 70,
          heightCm: 170,
          dailyCalorieGoal: 2000,
          dailyProteinG: 150,
          dailyCarbsG: 200,
          dailyFatG: 65,
          dailyWaterGlasses: 8,
          activityLevel: 'moderate',
        },
      });
    }

    // Get today's meals
    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId!,
        consumedAt: {
          gte: today,
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate totals from meals
    const totals = meals.reduce(
      (acc: any, meal: any) => {
        meal.items.forEach((item: any) => {
          acc.calories += item.calories || 0;
          acc.protein += item.protein_g || 0;
          acc.carbs += item.carbs_g || 0;
          acc.fat += item.fat_g || 0;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Get water intake
    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId: req.userId!,
        loggedAt: {
          gte: today,
        },
      },
    });

    const waterIntake = waterLogs.reduce((sum: number, log: any) => sum + log.glasses, 0);

    // Get workouts
    const workouts = await prisma.workout.findMany({
      where: {
        userId: req.userId!,
        performedAt: {
          gte: today,
        },
      },
    });

    res.json({
      caloriesConsumed: Math.round(totals.calories),
      caloriesGoal: profile.dailyCalorieGoal,
      proteinConsumed: Math.round(totals.protein),
      proteinGoal: profile.dailyProteinG,
      carbsConsumed: Math.round(totals.carbs),
      carbsGoal: profile.dailyCarbsG,
      fatConsumed: Math.round(totals.fat),
      fatGoal: profile.dailyFatG,
      waterIntake,
      waterGoal: profile.dailyWaterGlasses,
      workoutsCompleted: workouts.length,
      mealsCount: meals.length,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Create meal
router.post('/meals', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mealType, mealName, consumedAt, items } = req.body;

    const meal = await prisma.meal.create({
      data: {
        userId: req.userId!,
        mealType,
        mealName,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });

    res.json(meal);
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

// Get meals
router.get('/meals', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId!,
        ...(startDate && endDate
          ? {
              consumedAt: {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
              },
            }
          : {}),
      },
      include: {
        items: true,
      },
      orderBy: {
        consumedAt: 'desc',
      },
    });

    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
});

// Log water
router.post('/water', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { glasses } = req.body;

    const waterLog = await prisma.waterLog.create({
      data: {
        userId: req.userId!,
        glasses,
        loggedAt: new Date(),
      },
    });

    res.json(waterLog);
  } catch (error) {
    console.error('Log water error:', error);
    res.status(500).json({ error: 'Failed to log water' });
  }
});

// Create workout
router.post('/workouts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { workoutType, durationMinutes, caloriesBurned, notes, performedAt } = req.body;

    const workout = await prisma.workout.create({
      data: {
        userId: req.userId!,
        workoutType,
        durationMinutes,
        caloriesBurned,
        notes,
        performedAt: performedAt ? new Date(performedAt) : new Date(),
      },
    });

    res.json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// Get workouts
router.get('/workouts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const workouts = await prisma.workout.findMany({
      where: {
        userId: req.userId!,
        ...(startDate && endDate
          ? {
              performedAt: {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
              },
            }
          : {}),
      },
      orderBy: {
        performedAt: 'desc',
      },
    });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

export default router;

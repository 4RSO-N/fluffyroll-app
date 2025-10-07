import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get all habits
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId! },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to get habits' });
  }
});

// Create habit
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, icon, color, frequency, goal } = req.body;

    const habit = await prisma.habit.create({
      data: {
        userId: req.userId!,
        name,
        description,
        category,
        icon,
        color,
        frequency: frequency || 'daily',
        goal: goal || 1,
      },
    });

    res.json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Complete habit
router.post('/:habitId/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { habitId } = req.params;
    const { completionDate } = req.body;

    const date = completionDate ? new Date(completionDate) : new Date();
    date.setHours(0, 0, 0, 0);

    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        date,
      },
    });

    res.json(completion);
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ error: 'Failed to complete habit' });
  }
});

// Uncomplete habit
router.delete('/:habitId/completions/:date', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { habitId, date } = req.params;

    await prisma.habitCompletion.deleteMany({
      where: {
        habitId,
        date: new Date(date),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Uncomplete habit error:', error);
    res.status(500).json({ error: 'Failed to uncomplete habit' });
  }
});

// Get achievements
router.get('/achievements', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId! },
      include: {
        completions: true,
      },
    });

    const achievements = habits.map((habit) => {
      const completions = habit.completions.length;
      let streak = 0;
      const sortedCompletions = habit.completions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      for (let i = 0; i < sortedCompletions.length; i++) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completionDate = new Date(sortedCompletions[i].date);
        completionDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        totalCompletions: completions,
        currentStreak: streak,
        longestStreak: streak,
      };
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Update habit
router.put('/:habitId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { habitId } = req.params;

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: req.body,
    });

    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Delete habit
router.delete('/:habitId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { habitId } = req.params;

    await prisma.habit.delete({
      where: { id: habitId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

export default router;

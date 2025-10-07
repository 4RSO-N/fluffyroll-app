import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get cycle profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.cycleProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get cycle profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update cycle profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.cycleProfile.upsert({
      where: { userId: req.userId! },
      update: req.body,
      create: {
        userId: req.userId!,
        ...req.body,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error('Update cycle profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Log period
router.post('/periods', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, flow, symptoms, notes } = req.body;

    const period = await prisma.period.create({
      data: {
        userId: req.userId!,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        flow,
        symptoms,
        notes,
      },
    });

    res.json(period);
  } catch (error) {
    console.error('Log period error:', error);
    res.status(500).json({ error: 'Failed to log period' });
  }
});

// Get periods
router.get('/periods', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const periods = await prisma.period.findMany({
      where: { userId: req.userId! },
      orderBy: { startDate: 'desc' },
    });

    res.json(periods);
  } catch (error) {
    console.error('Get periods error:', error);
    res.status(500).json({ error: 'Failed to get periods' });
  }
});

// Get predictions
router.get('/predictions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.cycleProfile.findUnique({
      where: { userId: req.userId! },
    });

    const periods = await prisma.period.findMany({
      where: { userId: req.userId! },
      orderBy: { startDate: 'desc' },
      take: 3,
    });

    if (!profile || periods.length === 0) {
      return res.json({
        nextPeriodDate: null,
        nextOvulationDate: null,
        fertilityWindow: null,
      });
    }

    // Simple prediction based on average cycle length
    const lastPeriod = periods[0];
    const nextPeriodDate = new Date(lastPeriod.startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + profile.averageCycleLength);

    const nextOvulationDate = new Date(nextPeriodDate);
    nextOvulationDate.setDate(nextOvulationDate.getDate() - 14);

    const fertilityStart = new Date(nextOvulationDate);
    fertilityStart.setDate(fertilityStart.getDate() - 5);

    const fertilityEnd = new Date(nextOvulationDate);
    fertilityEnd.setDate(fertilityEnd.getDate() + 1);

    res.json({
      nextPeriodDate,
      nextOvulationDate,
      fertilityWindow: {
        start: fertilityStart,
        end: fertilityEnd,
      },
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Failed to get predictions' });
  }
});

export default router;

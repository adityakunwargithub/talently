import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

// Test endpoint
analyticsRouter.get('/test', async (req, res) => {
  res.json({ message: 'Analytics endpoint working', userId: (req as any).userId });
});

// Pipeline funnel: count applications by stage
analyticsRouter.get('/pipeline-funnel', async (req, res) => {
  try {
    const userId = (req as any).userId;
    console.log('Fetching pipeline funnel for user:', userId);

    const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

    const funnel = await Promise.all(
      stages.map(async (stage) => {
        try {
          const count = await prisma.application.count({
            where: {
              status: stage as any,
              job: { createdById: userId },
            },
          });
          console.log(`Stage ${stage}: ${count}`);
          return { stage, count };
        } catch (e) {
          console.error(`Error counting ${stage}:`, e);
          return { stage, count: 0 };
        }
      })
    );

    console.log('Funnel data:', funnel);
    res.json(funnel);
  } catch (error) {
    console.error('Error fetching pipeline funnel:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline funnel', details: String(error) });
  }
});

// Workload summary: pending actions, recent activity, time-to-hire
analyticsRouter.get('/workload-summary', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const [pendingApplications, recentApplicationsCount, hiredApplications, activeJobs] = await Promise.all([
      // Pending applications in screening stage
      prisma.application.count({
        where: {
          status: 'SCREENING',
          job: { createdById: userId },
        },
      }),
      // Recent applications (last 7 days)
      prisma.application.count({
        where: {
          job: { createdById: userId },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Applications that were hired (to calculate time-to-hire)
      prisma.application.findMany({
        where: {
          status: 'HIRED',
          job: { createdById: userId },
        },
        select: { createdAt: true, updatedAt: true },
      }),
      // Active jobs count
      prisma.job.count({
        where: {
          createdById: userId,
          status: 'PUBLISHED',
        },
      }),
    ]);

    const timeToHireValues = hiredApplications
      .map((app) => (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      .filter((v) => !isNaN(v) && v > 0);

    const avgTimeToHire =
      timeToHireValues.length > 0 ? Math.round(timeToHireValues.reduce((a, b) => a + b, 0) / timeToHireValues.length) : 0;

    res.json({
      pendingScreening: pendingApplications,
      recentApplications: recentApplicationsCount,
      averageTimeToHire: avgTimeToHire,
      activeJobs,
    });
  } catch (error) {
    console.error('Error fetching workload summary:', error);
    res.status(500).json({ error: 'Failed to fetch workload summary' });
  }
});

// Source quality: application count by stage
analyticsRouter.get('/source-quality', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

    const sourceData = await Promise.all(
      stages.map(async (stage) => {
        const count = await prisma.application.count({
          where: {
            status: stage as any,
            job: { createdById: userId },
          },
        });
        return { source: stage, count };
      })
    );

    res.json(sourceData);
  } catch (error) {
    console.error('Error fetching source quality:', error);
    res.status(500).json({ error: 'Failed to fetch source quality' });
  }
});

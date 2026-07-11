import { Router } from 'express';

import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { scoreApplication } from '../services/ai-screening';

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', async (req, res) => {
  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
  const applications = await prisma.application.findMany({
    where: jobId ? { jobId } : undefined,
    include: { job: true, candidate: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

applicationsRouter.get('/:id', async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: true, candidate: true, notes: true },
  });
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json(application);
});

applicationsRouter.put('/:id/status', async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
    include: { job: true, candidate: true },
  });
  res.json(application);
});

applicationsRouter.post('/:id/screen', async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: true, candidate: true },
  });
  if (!application) return res.status(404).json({ error: 'Application not found' });

  const result = scoreApplication(application.job.requirements, application.candidate.resumeText ?? '');
  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { score: result.score },
    include: { job: true, candidate: true },
  });
  res.json({ ...updated, matchedKeywords: result.matchedKeywords, requiredKeywords: result.requiredKeywords });
});

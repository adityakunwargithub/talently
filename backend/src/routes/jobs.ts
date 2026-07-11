import { Router } from 'express';

import { prisma } from '../db';
import { AuthedRequest, requireAuth } from '../middleware/auth';

export const jobsRouter = Router();

jobsRouter.use(requireAuth);

jobsRouter.get('/', async (_req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(jobs);
});

jobsRouter.get('/:id', async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

jobsRouter.post('/', async (req: AuthedRequest, res) => {
  const { title, description, requirements, location, department, employmentType, status } = req.body ?? {};
  if (!title || !description || !requirements || !location || !department || !employmentType) {
    return res.status(400).json({ error: 'title, description, requirements, location, department and employmentType are required' });
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      requirements,
      location,
      department,
      employmentType,
      status: status ?? 'DRAFT',
      createdById: req.userId!,
    },
  });
  res.status(201).json(job);
});

jobsRouter.put('/:id', async (req, res) => {
  const job = await prisma.job.update({ where: { id: req.params.id }, data: req.body ?? {} });
  res.json(job);
});

jobsRouter.delete('/:id', async (req, res) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

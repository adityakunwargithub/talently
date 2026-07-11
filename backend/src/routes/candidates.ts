import { Router } from 'express';

import { prisma } from '../db';
import { AuthedRequest, requireAuth } from '../middleware/auth';

export const candidatesRouter = Router();

candidatesRouter.use(requireAuth);

candidatesRouter.get('/', async (_req, res) => {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { applications: true },
  });
  res.json(candidates);
});

candidatesRouter.get('/:id', async (req, res) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id: req.params.id },
    include: { applications: { include: { job: true, notes: true } } },
  });
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

candidatesRouter.post('/:id/notes', async (req: AuthedRequest, res) => {
  const { applicationId, text } = req.body ?? {};
  if (!applicationId || !text) {
    return res.status(400).json({ error: 'applicationId and text are required' });
  }

  const note = await prisma.note.create({
    data: { applicationId, text, authorId: req.userId! },
  });
  res.status(201).json(note);
});

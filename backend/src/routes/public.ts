import { Router } from 'express';
import multer from 'multer';

import { prisma } from '../db';
import { scoreApplication } from '../services/ai-screening';
import { extractResumeText } from '../services/resume-parser';

export const publicRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

publicRouter.post('/parse-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'resume file is required' });
  }

  try {
    const text = await extractResumeText(req.file);
    res.json({ text });
  } catch {
    res.status(422).json({ error: 'Could not parse this file' });
  }
});

publicRouter.get('/jobs', async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
});

publicRouter.get('/jobs/:id', async (req, res) => {
  const job = await prisma.job.findFirst({
    where: { id: req.params.id, status: 'PUBLISHED' },
  });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

publicRouter.post('/jobs/:id/apply', async (req, res) => {
  const job = await prisma.job.findFirst({ where: { id: req.params.id, status: 'PUBLISHED' } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { name, email, phone, resumeUrl, resumeText } = req.body ?? {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const candidate = await prisma.candidate.create({
    data: { name, email, phone, resumeUrl, resumeText },
  });

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidate.id,
      score: scoreApplication(job.requirements, resumeText ?? '').score,
    },
  });

  res.status(201).json(application);
});

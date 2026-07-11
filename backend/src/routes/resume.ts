import { Router } from 'express';

import { prisma } from '../db';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { buildResumeDocx, buildResumePdf, type ResumeFields } from '../services/document-export';

export const resumeRouter = Router();

resumeRouter.use(requireAuth);

resumeRouter.post('/generate', async (req: AuthedRequest, res) => {
  const { fields, plainText, format } = req.body ?? {};

  if (!fields || typeof fields !== 'object') {
    return res.status(400).json({ error: 'fields is required' });
  }
  if (format !== 'docx' && format !== 'pdf') {
    return res.status(400).json({ error: 'format must be "docx" or "pdf"' });
  }

  const resumeFields: ResumeFields = {
    name: fields.name ?? '',
    email: fields.email ?? '',
    phone: fields.phone ?? '',
    summary: fields.summary ?? '',
    skills: fields.skills ?? '',
    experience: fields.experience ?? '',
    education: fields.education ?? '',
  };

  if (req.role === 'CANDIDATE' && typeof plainText === 'string' && req.userId) {
    await prisma.candidate.update({ where: { id: req.userId }, data: { resumeText: plainText } }).catch(() => {});
  }

  if (format === 'docx') {
    const buffer = await buildResumeDocx(resumeFields);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
    return res.send(buffer);
  }

  const buffer = await buildResumePdf(resumeFields);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
  res.send(buffer);
});

import { Router } from 'express';

import { prisma } from '../db';
import { requireAdmin } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

type AdminUserRow = {
  id: string;
  type: 'RECRUITER' | 'ADMIN' | 'CANDIDATE';
  name: string;
  identifier: string;
  createdAt: string;
};

adminRouter.get('/users', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));

  const [users, candidates] = await Promise.all([prisma.user.findMany(), prisma.candidate.findMany()]);

  let rows: AdminUserRow[] = [
    ...users.map((u) => ({
      id: u.id,
      type: u.role,
      name: u.name,
      identifier: u.username ?? u.email ?? '',
      createdAt: u.createdAt.toISOString(),
    })),
    ...candidates.map((c) => ({
      id: c.id,
      type: 'CANDIDATE' as const,
      name: c.name,
      identifier: c.username ?? c.email,
      createdAt: c.createdAt.toISOString(),
    })),
  ];

  if (search) {
    rows = rows.filter((row) => row.name.toLowerCase().includes(search) || row.identifier.toLowerCase().includes(search));
  }

  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  res.json({ rows: pageRows, total, page, pageSize });
});

adminRouter.put('/users/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { name, email, username, phone } = req.body ?? {};

  try {
    if (type === 'CANDIDATE') {
      const candidate = await prisma.candidate.update({ where: { id }, data: { name, email, phone, username } });
      return res.json({
        id: candidate.id,
        type: 'CANDIDATE',
        name: candidate.name,
        identifier: candidate.username ?? candidate.email,
        createdAt: candidate.createdAt.toISOString(),
      });
    }

    const user = await prisma.user.update({ where: { id }, data: { name, email, username } });
    res.json({
      id: user.id,
      type: user.role,
      name: user.name,
      identifier: user.username ?? user.email ?? '',
      createdAt: user.createdAt.toISOString(),
    });
  } catch {
    res.status(409).json({ error: 'Could not save changes — that email or username may already be in use.' });
  }
});

adminRouter.delete('/users/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === 'CANDIDATE') {
      await prisma.candidate.delete({ where: { id } });
    } else {
      await prisma.user.delete({ where: { id } });
    }
    res.status(204).send();
  } catch {
    res.status(409).json({ error: 'Could not delete — this record has related jobs, applications, or notes attached.' });
  }
});

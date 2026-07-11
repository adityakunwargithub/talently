import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export const authRouter = Router();

function issueToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

function toPublicUser(user: { id: string; email: string | null; username: string | null; name: string; role: string }) {
  return { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role };
}

authRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });

  res.status(201).json({ token: issueToken(user.id, user.role), user: toPublicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { identifier, email, password } = req.body ?? {};
  const lookup = identifier ?? email;
  if (!lookup || !password) {
    return res.status(400).json({ error: 'username/email and password are required' });
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: lookup }, { username: lookup }], role: 'RECRUITER' },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  res.json({ token: issueToken(user.id, user.role), user: toPublicUser(user) });
});

authRouter.post('/admin-login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== 'ADMIN' || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }

  res.json({ token: issueToken(user.id, user.role), user: toPublicUser(user) });
});

function toPublicCandidate(candidate: { id: string; email: string; username: string | null; name: string }) {
  return { id: candidate.id, email: candidate.email, username: candidate.username, name: candidate.name, role: 'CANDIDATE' };
}

authRouter.post('/candidate-signup', async (req, res) => {
  const { username, password, name, email } = req.body ?? {};
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: 'username, password, name and email are required' });
  }

  const existing = await prisma.candidate.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const candidate = await prisma.candidate.create({ data: { username, passwordHash, name, email } });

  res.status(201).json({ token: issueToken(candidate.id, 'CANDIDATE'), user: toPublicCandidate(candidate) });
});

authRouter.post('/candidate-login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const candidate = await prisma.candidate.findUnique({ where: { username } });
  if (!candidate || !candidate.passwordHash || !(await bcrypt.compare(password, candidate.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ token: issueToken(candidate.id, 'CANDIDATE'), user: toPublicCandidate(candidate) });
});

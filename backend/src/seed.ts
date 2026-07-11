import bcrypt from 'bcryptjs';

import { prisma } from './db';

const TEST_ACCOUNTS = {
  candidate: { username: 'candidate', password: 'password', name: 'Test Candidate', email: 'candidate@example.com' },
  recruiter: { username: 'recruiter', password: 'password', name: 'Test Recruiter' },
  admin: { username: 'admin', password: 'admin', name: 'Admin' },
} as const;

/**
 * Ensures the three fixed test accounts always exist with the credentials above,
 * since there's no admin signup flow and QA needs predictable logins. Upserts on
 * every startup so the password stays what's documented even if it drifts.
 */
export async function seedTestAccounts() {
  const { candidate, recruiter, admin } = TEST_ACCOUNTS;

  const candidatePasswordHash = await bcrypt.hash(candidate.password, 10);
  await prisma.candidate.upsert({
    where: { username: candidate.username },
    update: { passwordHash: candidatePasswordHash },
    create: {
      username: candidate.username,
      passwordHash: candidatePasswordHash,
      name: candidate.name,
      email: candidate.email,
    },
  });

  const recruiterPasswordHash = await bcrypt.hash(recruiter.password, 10);
  await prisma.user.upsert({
    where: { username: recruiter.username },
    update: { passwordHash: recruiterPasswordHash, role: 'RECRUITER' },
    create: {
      username: recruiter.username,
      passwordHash: recruiterPasswordHash,
      name: recruiter.name,
      role: 'RECRUITER',
    },
  });

  const adminPasswordHash = await bcrypt.hash(admin.password, 10);
  await prisma.user.upsert({
    where: { username: admin.username },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
      username: admin.username,
      passwordHash: adminPasswordHash,
      name: admin.name,
      role: 'ADMIN',
    },
  });

  console.log('Seeded test accounts:');
  console.log(`  candidate — username: ${candidate.username}, password: ${candidate.password}`);
  console.log(`  recruiter — username: ${recruiter.username}, password: ${recruiter.password}`);
  console.log(`  admin     — username: ${admin.username}, password: ${admin.password}`);
}

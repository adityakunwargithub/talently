import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { adminRouter } from './routes/admin';
import { analyticsRouter } from './routes/analytics';
import { applicationsRouter } from './routes/applications';
import { authRouter } from './routes/auth';
import { candidatesRouter } from './routes/candidates';
import { jobsRouter } from './routes/jobs';
import { publicRouter } from './routes/public';
import { resumeRouter } from './routes/resume';
import { seedTestAccounts } from './seed';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/public', publicRouter);
app.use('/api/admin', adminRouter);
app.use('/api/resume', resumeRouter);

const port = Number(process.env.PORT ?? 4000);
seedTestAccounts()
  .catch((err) => console.error('Failed to seed test accounts:', err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`TalentFlow API listening on http://localhost:${port}`);
    });
  });

# Talently ATS - Deployment Guide

## 🚀 Fixing the 404 Error on Vercel

The 404 error occurs because the frontend is trying to reach the backend API at `http://localhost:5000` which doesn't exist on the deployed server.

### ✅ Solution: Set Environment Variables

#### **Step 1: Deploy Backend First**

Before deploying the frontend, you need a deployed backend API. Options:

1. **Deploy to Vercel** (Recommended)
   - Create a new Vercel project for the backend
   - Push the `backend/` folder to a separate repository or use monorepo
   - Note the deployed URL (e.g., `https://talently-backend.vercel.app`)

2. **Deploy to Railway/Render/Fly.io**
   - Follow their deployment guide
   - Note the deployed URL

3. **Keep Backend Locally** (Development only)
   - Run `npm run dev` in the backend directory
   - Use your local IP address instead of localhost (for remote access)

#### **Step 2: Set Environment Variable in Vercel**

1. Go to your Vercel project (frontend)
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `EXPO_PUBLIC_API_URL`
   - **Value**: Your backend URL (e.g., `https://talently-backend.vercel.app/api`)
   - **Environments**: Select all (Production, Preview, Development)

4. Redeploy your frontend:
   - Go to **Deployments** tab
   - Click the three dots next to the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger auto-deployment

#### **Step 3: Verify Configuration**

1. Check that the environment variable is set in Vercel Dashboard
2. Redeploy and wait for build to complete
3. Visit your deployed URL and open Browser DevTools (F12)
4. Check the Console to see if there are any API URL errors
5. Try logging in to verify the API connection works

### 📋 Backend Deployment Options

#### **Option A: Vercel (Easiest for Express.js)**

1. Update `backend/package.json` build script if needed
2. Create new Vercel project from backend repository
3. Set any required environment variables (database URL, etc.)
4. Vercel will auto-deploy on git push

#### **Option B: Railway**

1. Sign up at railway.app
2. Connect your GitHub repository
3. Select the backend directory
4. Set environment variables
5. Deploy

#### **Option C: Render**

1. Sign up at render.com
2. Create new Web Service
3. Connect repository
4. Set build command: `npm install`
5. Set start command: `npm run dev`
6. Deploy

### 🔧 Local Development Setup

1. **Frontend (.env.local in talentflow-ats/)**
   ```
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **Backend**
   - Start with: `cd backend && npm run dev`
   - Runs on `http://localhost:5000`

3. **Frontend**
   - Start with: `cd talentflow-ats && npm run web`
   - Runs on `http://localhost:8081`

### 📝 Environment Variables Summary

| Variable | Frontend | Backend | Example |
|----------|----------|---------|---------|
| `EXPO_PUBLIC_API_URL` | ✅ Required | ❌ N/A | `https://api.talently.app/api` |
| `DATABASE_URL` | ❌ N/A | ✅ Required | `postgresql://...` |
| `JWT_SECRET` | ❌ N/A | ✅ Required | Auto-generated random string |

### ❌ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on login | API URL pointing to localhost | Set `EXPO_PUBLIC_API_URL` in Vercel |
| CORS errors | API not allowing requests from frontend domain | Add frontend URL to CORS whitelist in backend |
| Blank page | Build failed | Check build logs in Vercel |
| API 503 | Backend not running | Ensure backend is deployed and running |

### ✨ After Fixing

Once deployed and working:
1. Test login with test credentials
2. Create a new job posting
3. Test candidate application from careers page
4. Verify data appears in dashboard

### 🆘 Debugging

1. **Check Vercel Logs**: Deployments → Click deployment → Logs
2. **Check Browser Console**: F12 → Console tab for errors
3. **Check Network Tab**: F12 → Network tab to see API requests
4. **Verify Environment Variables**: Settings → Environment Variables

---

**Need help?** Check the error ID in your browser console (e.g., `bom1::nlw85-1783808691123-aa72668681af`) and share it with the team for faster debugging.

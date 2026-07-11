# Talently Backend - Deployment Guide

## 🚀 Deployment Options

Choose one of the following deployment platforms:

---

## **Option 1: Vercel (Recommended - Free & Easy)**

### Prerequisites
- Vercel account (sign up at vercel.com)
- GitHub account with the repository pushed

### Step 1: Prepare Backend for Vercel

The backend is already configured with `vercel.json`. Just ensure:
- `package.json` has correct start script
- `src/index.ts` is the main entry point

Check your `package.json`:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "ts-node src/index.ts"
  }
}
```

### Step 2: Create New Vercel Project for Backend

1. **Option A: Deploy from GitHub** (Recommended)
   - Go to https://vercel.com/new
   - Import your repository (`adityakunwargithub/talently`)
   - Select "Other" as framework preset
   - Set these configurations:
     - **Root Directory**: `backend`
     - **Build Command**: Leave empty (Vercel auto-detects)
     - **Output Directory**: Leave empty
   - Click "Deploy"

2. **Option B: Deploy using Vercel CLI**
   ```bash
   npm install -g vercel
   cd backend
   vercel --prod
   ```

### Step 3: Set Environment Variables in Vercel

1. Go to your Vercel backend project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

   | Name | Value | Environments |
   |------|-------|---|
   | `DATABASE_URL` | `file:./prod.db` or PostgreSQL URL | Production, Preview |
   | `JWT_SECRET` | Generate a random secret (e.g., use: `openssl rand -base64 32`) | Production, Preview |
   | `NODE_ENV` | `production` | Production |
   | `FRONTEND_URL` | Your Vercel frontend URL | Production |

4. Click "Save"

### Step 4: Redeploy

1. Go to **Deployments**
2. Click the three dots on latest deployment
3. Select **Redeploy**
4. Wait for build to complete

### Step 5: Get Your Backend URL

- Your backend URL will be: `https://your-backend-name.vercel.app`
- Copy this URL

### Step 6: Update Frontend Environment Variable

Go to your **Frontend Vercel project**:
1. **Settings** → **Environment Variables**
2. Update `EXPO_PUBLIC_API_URL`: `https://your-backend-name.vercel.app/api`
3. **Redeploy** the frontend

---

## **Option 2: Railway (Good Alternative)**

### Step 1: Create Railway Account
- Go to https://railway.app
- Sign up with GitHub

### Step 2: Deploy Backend

1. Click **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. Select the `backend` directory
4. Railway will auto-detect Node.js

### Step 3: Set Environment Variables

1. Go to **Variables** tab
2. Add environment variables:
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your-random-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

### Step 4: Deploy

- Railway auto-deploys on git push
- Your URL will be auto-generated (e.g., `https://production-env.up.railway.app`)

### Step 5: Update Frontend

Set `EXPO_PUBLIC_API_URL` in your frontend Vercel project to your Railway backend URL.

---

## **Option 3: Render**

### Step 1: Create Account
- Go to https://render.com
- Sign up with GitHub

### Step 2: Create New Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `talently-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` or `npx ts-node src/index.ts`
   - **Plan**: Free tier is fine for testing

### Step 3: Set Environment Variables

In the **Environment** section:
```
DATABASE_URL=file:./prod.db
JWT_SECRET=your-random-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 4: Deploy

- Click **Create Web Service**
- Render will deploy from your repository
- Your URL: `https://talently-backend.onrender.com`

---

## 📊 Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Free Tier** | ✅ Yes | ✅ Yes ($5 credit) | ✅ Yes |
| **Auto-Deploy on Git Push** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Database Support** | SQLite/PostgreSQL | SQLite/PostgreSQL | SQLite/PostgreSQL |
| **Cold Start** | Fast | Fast | Slow (might sleep) |

**Recommendation**: Use **Vercel** for simplicity (same platform as frontend)

---

## ✅ Testing Your Deployed Backend

### 1. Check API Status
```bash
curl https://your-backend-url.com/api/
```

### 2. Test a Public Endpoint
```bash
curl https://your-backend-url.com/api/public/jobs
```

### 3. Check Logs
- **Vercel**: Deployments → Click deployment → Logs
- **Railway**: Runtime → Logs
- **Render**: Logs tab

---

## 🔐 Important: Environment Variables

**NEVER commit `.env` files to GitHub!** 

For production, ALWAYS:
1. Set variables in the deployment platform's dashboard
2. Use strong, random JWT_SECRET (generate with: `openssl rand -base64 32`)
3. Use production database URL if not using SQLite

---

## 🐛 Troubleshooting

### Build Failed
- Check **Build Logs** in deployment dashboard
- Ensure `package.json` is in `backend/` directory
- Verify Node.js version compatibility

### API Returns 500 Error
1. Check environment variables are set
2. Check logs for database connection issues
3. Verify `JWT_SECRET` is set

### Frontend Still Getting 404
1. Verify backend is deployed and running
2. Check `EXPO_PUBLIC_API_URL` is set correctly in frontend
3. Ensure backend URL is `https://your-url.com/api`
4. Redeploy frontend after updating the variable

### CORS Errors
1. Check backend `CORS` configuration in `src/index.ts`
2. Ensure frontend URL matches `FRONTEND_URL` environment variable
3. Add frontend URL to CORS whitelist if needed

---

## 📝 After Deployment

Once backend is deployed:

1. **Update Frontend Environment Variable**
   - Set `EXPO_PUBLIC_API_URL` to your backend URL
   - Redeploy frontend

2. **Test the Connection**
   - Visit frontend URL
   - Open DevTools (F12) → Network tab
   - Try logging in
   - Check if API requests succeed

3. **Monitor**
   - Watch deployment logs for errors
   - Set up error notifications if available

---

## 🎯 Complete Checklist

- [ ] Backend deployed to production platform
- [ ] Environment variables set in deployment dashboard
- [ ] Backend URL obtained
- [ ] Frontend `EXPO_PUBLIC_API_URL` updated
- [ ] Frontend redeployed
- [ ] Backend API responding to requests
- [ ] Frontend successfully calls backend API
- [ ] Login works end-to-end
- [ ] Dashboard loads with data

---

**Need help?** Share:
- Backend deployment URL
- Frontend URL  
- Error message from browser console (F12)
- Deployment platform (Vercel/Railway/Render)

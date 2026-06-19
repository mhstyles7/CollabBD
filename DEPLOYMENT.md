# CollabBD — Vercel + Render Deployment Guide

## Architecture
- **Frontend**: Vercel → `apps/web` (Next.js)
- **Backend**: Render → `apps/server` (Express + Socket.io)
- **Database**: MongoDB Atlas (already configured)
- **Media**: Cloudinary (already configured)

---

## Step 1 — Push to GitHub
Make sure your latest code is pushed to a GitHub repository.

---

## Step 2 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Set the following:
   - **Name**: `collabbd-api`
   - **Root Directory**: `apps/server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: `Node`

4. Add **Environment Variables** in the Render dashboard:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `MONGODB_URI` | *(your Atlas URI)* |
| `JWT_SECRET` | *(your secret)* |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | *(your value)* |
| `CLOUDINARY_API_KEY` | *(your value)* |
| `CLOUDINARY_API_SECRET` | *(your value)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | *(your gmail)* |
| `SMTP_PASS` | *(your app password)* |

5. Click **Create Web Service** → wait for deploy (≈3 min)
6. Copy your Render URL: `https://collabbd-api.onrender.com`

---

## Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js *(auto-detected)*
4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://collabbd-api.onrender.com/api` |

5. Click **Deploy** → wait (≈2 min)
6. Your live URL: `https://collabbd.vercel.app`

---

## Step 4 — Update CORS on Render
After Vercel gives you the final URL, go back to Render and update:
- `CLIENT_URL` → your Vercel URL (e.g. `https://collabbd.vercel.app`)

Then **manually redeploy** on Render.

---

## Verification Checklist
- [ ] `https://collabbd-api.onrender.com/api/health` → `{ status: "ok" }`
- [ ] Login/Register works on live Vercel URL
- [ ] Feed loads posts
- [ ] Community rooms + real-time chat works
- [ ] Profile image upload works (Cloudinary)
- [ ] Map view works

---

## Free Tier Notes
- **Render free tier**: Server sleeps after 15 min of inactivity — first request after sleep takes ~30s (cold start). Upgrade to Render Starter ($7/mo) to avoid this.
- **Vercel free tier**: 100GB bandwidth/month — more than enough for a new platform.

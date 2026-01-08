---
description: Deploy the Coffee Corner POS app to Render
---

# Deploy to Render - Complete Guide

This workflow will guide you through deploying your Coffee Corner POS application to Render's free tier.

## Prerequisites

- ✅ GitHub account (you already have this)
- ✅ Git repository pushed to GitHub (you already have this)
- ⬜ Render account (free)

---

## Step 1: Prepare Your Repository

First, ensure all your latest changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

> **Note**: If your default branch is `master` instead of `main`, use `git push origin master`

---

## Step 2: Create a Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up using your **GitHub account** (recommended for easier integration)
4. Verify your email address

---

## Step 3: Create a New Web Service

1. Once logged in, click **"New +"** button in the top right
2. Select **"Web Service"**
3. Click **"Connect a repository"** or **"Configure account"** to give Render access to your GitHub repos
4. Find and select your repository: `Mahmoud-abusaman/-`
5. Click **"Connect"**

---

## Step 4: Configure Your Web Service

Fill in the following settings:

### Basic Settings:
- **Name**: `coffee-corner-pos` (or any name you prefer)
- **Region**: Choose the closest to your location
- **Branch**: `main` (or `master` if that's your default branch)
- **Root Directory**: Leave blank
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Instance Type:
- Select **"Free"** (this is the default)

---

## Step 5: Environment Variables (Optional)

If you need to set any environment variables:

1. Scroll down to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Add any variables from your `.env.local` file if needed

> **Note**: For the free tier, your app will use the default PORT that Render provides (usually 10000), but your server.js will need a small update to use `process.env.PORT`.

---

## Step 6: Update server.js for Render

Before deploying, update your server to use Render's PORT:

**Current code (line 11):**
```javascript
const PORT = 3001;
```

**Change to:**
```javascript
const PORT = process.env.PORT || 3001;
```

This allows Render to assign its own port while keeping 3001 for local development.

Commit and push this change:
```bash
git add server.js
git commit -m "Use PORT from environment for Render deployment"
git push origin main
```

---

## Step 7: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your frontend (`npm run build`)
   - Start your server (`npm start`)

This process takes about 2-5 minutes.

---

## Step 8: Access Your Deployed App

Once deployment is complete:

1. You'll see a **green "Live"** status
2. Your app URL will be: `https://coffee-corner-pos.onrender.com` (or whatever name you chose)
3. Click the URL to open your deployed app! 🎉

---

## Step 9: Set Up Auto-Deploy (Already Enabled!)

Good news! Render automatically sets up auto-deploy:
- Every time you push to your `main` branch, Render will automatically rebuild and redeploy
- You'll get notifications about deployment status

---

## Troubleshooting

### Issue: Build fails
- Check the **Logs** tab in Render dashboard
- Common fix: Make sure all dependencies are in `package.json` (not just `devDependencies`)

### Issue: App shows "Service Unavailable"
- Check if the build completed successfully
- Verify the **Start Command** is `npm start`
- Check logs for any runtime errors

### Issue: Data not persisting
- Render's free tier has **ephemeral storage** - files are deleted when the service restarts
- For persistent data, you'll need to:
  - Upgrade to a paid plan with persistent disk
  - Or use a database service (PostgreSQL, MongoDB, etc.)

### Issue: App is slow to wake up
- This is normal on the free tier - services spin down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds
- Upgrade to paid tier ($7/month) to keep it always running

---

## Important Notes for Free Tier

⚠️ **Spin-down behavior**: Your app will sleep after 15 minutes of no requests
⚠️ **Ephemeral storage**: Your JSON files in the `data/` folder will be reset when the service restarts
⚠️ **750 hours/month**: Enough for one app running 24/7

### For Production Use:
Consider upgrading to Render's **Starter plan ($7/month)** which includes:
- No spin-down
- Persistent disk storage (keeps your data files)
- More resources

---

## Next Steps

After deployment, you might want to:

1. **Set up a custom domain** (available on free tier!)
   - Go to Settings → Custom Domain
   - Follow the DNS configuration instructions

2. **Monitor your app**
   - Use the Render dashboard to view logs
   - Set up email notifications for deployment failures

3. **Consider data persistence**
   - For a production POS system, migrate to a proper database
   - Or upgrade to paid tier for persistent disk

---

## Quick Reference

- **Dashboard**: https://dashboard.render.com
- **Your app URL**: `https://[your-service-name].onrender.com`
- **Logs**: Dashboard → Your Service → Logs tab
- **Redeploy manually**: Dashboard → Your Service → Manual Deploy → Deploy latest commit

---

## Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check deployment logs in the Render dashboard

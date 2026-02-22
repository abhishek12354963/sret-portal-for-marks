# Step-by-Step: Deploy to Render

Follow these steps to deploy your SRET Marks Portal and get a shareable URL.

## Step 1: Create a GitHub Repository (if you don't have one)

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `sret-marks-portal`
4. Choose **Public** (or Private)
5. **Don't** initialize with README (we already have files)
6. Click **"Create repository"**

## Step 2: Upload Your Code to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in
3. Click **"File"** → **"Add Local Repository"**
4. Browse to: `d:\SRET website`
5. Click **"Add repository"**
6. Click **"Publish repository"** → Select your GitHub account → Click **"Publish"**

### Option B: Using Git Command Line

Open PowerShell in `d:\SRET website` and run:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sret-marks-portal.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your GitHub username)

## Step 3: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (recommended) or email
4. Verify your email if needed

## Step 4: Create a New Web Service

1. After logging in, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if prompted to connect GitHub
4. Select your GitHub account
5. Find and select your repository: **`sret-marks-portal`**
6. Click **"Connect"**

## Step 5: Configure Your Service

Fill in these settings:

- **Name:** `sret-marks-portal` (or any name you like)
- **Region:** Choose closest to you (e.g., `Oregon (US West)` or `Singapore`)
- **Branch:** `main` (or `master` if that's your branch)
- **Root Directory:** Leave empty (or `./` if required)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Select **"Free"**

## Step 6: Add Environment Variable (if needed)

1. Scroll down to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Name: `PORT`
4. Value: `3000`
5. Click **"Save Changes"**

(Note: Render usually auto-detects PORT, so you might not need this)

## Step 7: Deploy

1. Scroll down and click **"Create Web Service"**
2. Render will start building your app
3. Wait 2-5 minutes for deployment to complete
4. You'll see build logs - wait for "Your service is live"

## Step 8: Get Your Shareable URL

Once deployment is complete:

1. You'll see a URL at the top like: `https://sret-marks-portal.onrender.com`
2. **This is your shareable link!** ✅
3. Click the URL to test it

## Step 9: Test Your Website

1. Open the URL in your browser
2. Test student view: Enter `SRET001` and click "View Marks"
3. Test admin: Enter `admin@123` to see admin panel

## Step 10: Share the Link

Share this URL with others:
```
https://sret-marks-portal.onrender.com
```

(Your actual URL will be shown in Render dashboard)

---

## Troubleshooting

### If build fails:
- Check the build logs in Render dashboard
- Make sure `package.json` has `"start": "node server.js"`
- Ensure all files are committed to GitHub

### If the site doesn't load:
- Wait a few minutes (first deployment can take time)
- Check Render dashboard for errors
- Make sure `PORT` environment variable is set (Render usually sets this automatically)

### If you need to update your code:
1. Make changes locally
2. Commit and push to GitHub
3. Render will automatically redeploy (or click "Manual Deploy" in Render dashboard)

---

## Important Notes

- **Free tier:** Your app may spin down after 15 minutes of inactivity
- **First request:** May take 30-60 seconds to wake up (subsequent requests are fast)
- **Always-on:** For $7/month, you can upgrade to "Starter" plan for always-on service

---

**Your website is now live and shareable!** 🎉

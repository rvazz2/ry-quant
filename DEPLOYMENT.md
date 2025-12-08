# Deployment Guide: Financial Dashboard

This guide covers how to deploy the Quant Financial Dashboard to the web using **Vercel** (Frontend) and **Render** (Backend).

## Prerequisites
1. **GitHub Account**: You need a GitHub account to host your code.
2. **Git Installed**: You must have Git installed on your computer.
   - Download: [git-scm.com](https://git-scm.com/downloads)
   - Verification: Open terminal and run `git --version`

## Step 1: Push Code to GitHub

Since you haven't initialized Git yet, follow these commands in your `Ry Website` folder:

```bash
# 1. Initialize Git
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit"

# 4. Connect to GitHub (Create a new repository on GitHub first!)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
# Note: "main" is the standard branch name, but if it fails try "master"
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend (Render)

1. Sign up at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Render will auto-detect `render.yaml` (if not, choose "Python 3" environment).
5. **Environment Variables**:
   Add the following variables in the "Environment" tab:
   - `PYTHON_VERSION`: `3.10.0`
   - `GOOGLE_API_KEY`: (Your Google Generic AI Key)
6. Click **Deploy**.
7. Copy your backend URL (e.g., `https://quant-dashboard.onrender.com`).

## Step 3: Deploy Frontend (Vercel)

1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **Environment Variables**:
   Add the following variable:
   - `NEXT_PUBLIC_API_URL`: Paste your Render Backend URL (e.g., `https://quant-dashboard.onrender.com/api`)
5. Click **Deploy**.

## Updating Your Website

To update your website, just make changes locally and push to GitHub:

```bash
git add .
git commit -m "Description of changes"
git push
```

Both Vercel and Render will automatically redeploy your new code!

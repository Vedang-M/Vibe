# GitHub Deployment Guide for Vibe Quiz Master

## Step 1: Create a GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `Vibe` (or any name you prefer)
3. Description: `A native online quiz web application that generates quizzes from PDFs with MCQ, Flashcard, Coding, and Numerical challenges`
4. Choose **Public** (so anyone can access)
5. **DO NOT** initialize with README (we already have one)
6. Click **Create repository**

After creation, GitHub will show you a quick setup guide. Copy the repository URL (it will look like `https://github.com/YOUR-USERNAME/Vibe.git`)

---

## Step 2: Initialize Git Locally

Open Terminal and run these commands in your project folder:

```bash
cd /Users/vedangmendhurwar/Downloads/Vibe

# Initialize git repository
git init

# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: Vibe Quiz Master v1.0 - Complete quiz app with PDF extraction, MCQs, Flashcards, Coding & Numerical challenges"
```

---

## Step 3: Connect to GitHub

Replace `YOUR-USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/Vibe.git

# Verify the connection
git remote -v
```

You should see:
```
origin  https://github.com/YOUR-USERNAME/Vibe.git (fetch)
origin  https://github.com/YOUR-USERNAME/Vibe.git (push)
```

---

## Step 4: Push to GitHub

```bash
# Push to GitHub (might prompt for credentials)
git branch -M main
git push -u origin main
```

**Note:** GitHub may ask for authentication. Choose one:
- **Personal Access Token** (recommended for security)
  - Go to https://github.com/settings/tokens
  - Click "Generate new token"
  - Select `repo` scope
  - Copy and paste when prompted
  
- **GitHub CLI** (easier)
  - Install: `brew install gh`
  - Authenticate: `gh auth login`
  - Choose HTTPS when asked
  - Select "Authenticate with a web browser"

---

## Step 5: Enable GitHub Pages

Once pushed, set up GitHub Pages to make your app live:

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Choose branch: **main**
6. Choose folder: **/ (root)**
7. Click **Save**

GitHub will show: `Your site is live at https://YOUR-USERNAME.github.io/Vibe/`

---

## Step 6: Verify It Works

1. Wait 1-2 minutes for GitHub Pages to build
2. Visit: `https://YOUR-USERNAME.github.io/Vibe/`
3. Your app should be live! 🎉

---

## Troubleshooting

**"fatal: not a git repository"**
```bash
cd /Users/vedangmendhurwar/Downloads/Vibe
git init
```

**"refused to merge unrelated histories"**
```bash
git pull origin main --allow-unrelated-histories
```

**"authentication failed"**
- Use Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

**Site not showing after enabling Pages**
- Wait 2-3 minutes
- Check that `.gitignore` doesn't exclude any needed files
- Verify GitHub Pages is enabled in Settings → Pages

---

## Future Updates

To push changes after making updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

---

## Optional: Add a Custom Domain

1. Buy a domain (e.g., visequiz.com)
2. In repository Settings → Pages → Custom domain
3. Enter your domain and save
4. Follow DNS setup instructions from your domain registrar

---

## Files Included in Your Project

- ✅ `index.html` - Main application
- ✅ `app.js` - All logic (PDF extraction, question generation, gamification)
- ✅ `styles.css` - Beautiful UI with 50+ animations
- ✅ `404.html` - GitHub Pages routing fix
- ✅ `package.json` - Project metadata
- ✅ `.gitignore` - Don't commit unnecessary files
- ✅ Documentation files (README, FEATURES, etc.)
- ✅ `deploy.sh` - Helper script

All are ready to push! No build process needed. ✨

---

## Next Steps After Deployment

1. **Share the link** with friends/classmates
2. **Create issues/PRs** for new features
3. **Star the repo** if you like it! ⭐
4. **Share on social media** with the live link
5. **Add more documentation** as needed

Enjoy! 🚀

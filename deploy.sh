#!/bin/bash

# Vibe Quiz Master - GitHub Pages Deployment Script
# This script helps deploy the application to GitHub Pages

echo "🚀 Vibe Quiz Master - Deployment Helper"
echo "======================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "========================"
echo ""

# Step 1: Initialize git repository
if [ ! -d ".git" ]; then
    echo "1. Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "2. Staging files..."
git add .
echo "✅ All files staged"

echo ""
echo "3. Creating initial commit..."
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit"
else
    git commit -m "Initial commit: Vibe Quiz Master application"
    echo "✅ Initial commit created"
fi

echo ""
echo "📦 Repository Setup Instructions:"
echo "=================================="
echo ""
echo "To deploy on GitHub Pages:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to github.com/new"
echo "   - Name it: Vibe (or any name you prefer)"
echo "   - Choose Public (for GitHub Pages)"
echo "   - Don't initialize with README/license"
echo ""
echo "2. Add remote and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/Vibe.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to repository Settings → Pages"
echo "   - Select 'Deploy from a branch'"
echo "   - Choose 'main' branch"
echo "   - Click Save"
echo ""
echo "4. Wait a few minutes and visit:"
echo "   https://YOUR_USERNAME.github.io/Vibe"
echo ""
echo "✨ Your Vibe Quiz Master is now live!"
echo ""

# 🖥️ CHROMEBOOK_LOCAL_DEPLOYMENT.md - Deploy Locally on Chromebook

> **Complete guide to deploy your Spelling Test App locally on a Chromebook using Linux (Crostini)**

---

## 📋 Overview

This guide covers how to **run your app locally on your Chromebook** with full development capabilities. Your app will run on `http://localhost:5173/` with hot-reload support.

---

## ✅ Prerequisites

Your Chromebook must support **Linux (Crostini)**:
- ✅ Chrome OS 69+
- ✅ 4GB+ RAM (8GB recommended)
- ✅ 20GB+ free storage
- ✅ Linux support enabled

### Check if Your Chromebook Supports Linux

1. Open **Settings**
2. Go to **Advanced** → **Developers**
3. Look for **"Linux development environment"** option
4. If visible → Your Chromebook supports Linux ✅
5. If not visible → Your Chromebook is too old (use live web link instead)

---

## 🚀 Step-by-Step Local Deployment

### Step 1: Enable Linux on Chromebook (5 minutes)

1. Click the **Clock** (bottom right) → **Settings**
2. Go to **Advanced** → **Developers**
3. Click **"Enable Linux development environment"**
4. Click **"Next"**
5. Accept the installation (takes 5-10 minutes)
6. Wait for Linux to install
7. ✅ Linux terminal will open automatically

### Step 2: Update Linux Package Manager (2 minutes)

In the Linux terminal that opened, run:

```bash
sudo apt update
sudo apt upgrade -y
```

This updates your package manager to latest version.

### Step 3: Install Node.js v18+ (5 minutes)

Your Chromebook likely has Node.js v12 (too old). We need v18+.

**Option A: Install from NodeSource (Recommended)**

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version    # Should show v18.x.x
npm --version     # Should show 8.x.x or higher
```

**Option B: If above doesn't work**

```bash
# Try this alternative
sudo apt install -y nodejs npm

# Check version
node --version

# If version is too old, upgrade:
sudo npm install -g n
sudo n lts
node --version
```

### Step 4: Get Your Project Files (Varies)

**Option A: Clone from GitHub** (Best if you pushed to GitHub)

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/spelling-test-app.git
cd spelling-test-app
```

**Option B: Copy from Files App** (If you have project on cloud)

```bash
# Files are usually in: /mnt/chromeos/MyFiles/Downloads/

# Navigate to your project
cd /path/to/your/project

# Or create a working directory
mkdir ~/projects
cd ~/projects

# Copy files here (use file manager or git)
```

**Option C: Download & Extract ZIP**

```bash
# If you have a ZIP file in Downloads:
cd ~/projects
unzip ~/Downloads/spelling-test-app.zip
cd spelling-test-app
```

### Step 5: Install Dependencies (3-5 minutes)

This downloads all npm packages (~500MB):

```bash
cd spelling-test-app
npm install
```

Wait for it to complete. You'll see:
```
added 200+ packages in 3m
```

### Step 6: Run Development Server (30 seconds)

Start your app locally:

```bash
npm run dev
```

You'll see output like:
```
  VITE v7.1.12  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Your app is now running locally!**

### Step 7: Access in Browser (30 seconds)

1. Open **Chrome browser** on your Chromebook
2. Go to: **`http://localhost:5173`**
3. ✅ **Your app is live locally!**

---

## 🎮 Using Your Local App

### Features Available Locally

- ✅ Full spelling test app
- ✅ Real-time typing feedback
- ✅ Statistics tracking
- ✅ Responsive design
- ✅ Touch input support
- ✅ Hot reload (changes appear instantly when you edit files)

### Managing the Development Server

**Keep it Running:**
```bash
# Terminal stays open with dev server running
# App automatically reloads when you save files
```

**Stop the Server:**
```bash
# Press Ctrl+C in the terminal
# Dev server stops
```

**Restart the Server:**
```bash
# Press Ctrl+C to stop
npm run dev
# Runs again
```

### Run in Background (Advanced)

Keep the terminal open in background:

```bash
# Run in background
npm run dev &

# You can still use terminal for other commands
# To see the server output again:
fg

# Or use a terminal multiplexer (tmux)
sudo apt install tmux
tmux new-session -d -s spelling-dev 'npm run dev'
```

---

## 🔧 Common Tasks

### Check if App is Running

```bash
# In a new terminal tab/window:
curl http://localhost:5173
# If running, should show HTML response
```

### View Console Logs

Open **Developer Tools** in Chrome:
- Press **F12**
- Go to **Console** tab
- See all app logs and errors

### Edit Code & See Changes

1. Open a text editor on your Chromebook (Linux files)
2. Edit files in `src/` folder
3. Save the file
4. App automatically reloads in browser!

Example edit: `src/components/SpellingTest.tsx`

### Build for Production

When ready to deploy online:

```bash
npm run build
```

Creates optimized `dist/` folder (~180 KB)

Then deploy to Netlify, Vercel, or GitHub Pages (see other guides)

---

## 📝 File Structure Overview

Your project on Chromebook:

```
spelling-test-app/
├── src/
│   ├── components/           # React components
│   │   ├── SpellingTest.tsx  # Main component
│   │   ├── Feedback.tsx
│   │   ├── Statistics.tsx
│   │   └── ...
│   ├── utils/
│   │   └── progressManager.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── words.txt             # Spelling words list
├── index.html                # Main HTML file
├── package.json              # Dependencies
├── vite.config.ts            # Build config
├── tsconfig.json             # TypeScript config
└── dist/                      # (Created after npm run build)
```

---

## 🎯 Quick Edit & Test Workflow

### Make a Change and See It Live

1. **Terminal**: `npm run dev` (keeps running)
2. **Editor**: Edit `src/components/SpellingTest.tsx`
3. **Save**: Ctrl+S (or Cmd+S)
4. **Browser**: Changes appear instantly!
5. **Test**: Try your changes
6. **Repeat**: Make more edits

### Example: Change Welcome Message

```bash
# 1. Keep dev server running in terminal

# 2. Open file in editor:
# Linux files are in: /home/username/projects/spelling-test-app/

# 3. Edit src/App.tsx:
# Change: "Spelling Test App" to "My Awesome Spelling App"

# 4. Save file

# 5. Browser auto-reloads (within 1-2 seconds)

# 6. See your changes live!
```

---

## 🆘 Troubleshooting

### Problem: "npm: command not found"

```bash
# Node.js not installed or not in PATH
# Reinstall:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify:
node --version
npm --version
```

### Problem: "Cannot find module" errors

```bash
# Dependencies not fully installed
cd your-project-folder
rm -rf node_modules package-lock.json
npm install

# Then try again:
npm run dev
```

### Problem: Port 5173 already in use

```bash
# Use different port:
npm run dev -- --port 3000

# Access at: http://localhost:3000
```

### Problem: App very slow on Linux

- Close unused browser tabs
- Close other Linux applications
- Check RAM usage: `free -h`
- Close Chrome and reopen
- Consider using live web link instead

### Problem: Can't find files in file manager

```bash
# Linux files are usually hidden
# Enable showing hidden folders:
# Files app → Hamburger menu → Show Hidden Files

# Or access via terminal:
ls -la ~
ls -la ~/projects/spelling-test-app/
```

### Problem: Permission denied errors

```bash
# Fix permissions:
chmod -R 755 ~/projects/spelling-test-app/

# Or navigate to your project and try again
```

### Problem: Internet not working in Linux

```bash
# Check connection:
ping google.com

# Restart network:
sudo systemctl restart networking

# Or restart Linux:
# Settings → Advanced → Developers → "Turn Off" Linux
# Wait 30 seconds
# Turn on again
```

---

## 💡 Pro Tips

### Tip 1: Use Multiple Terminal Tabs

```bash
# Open Linux terminal
# Press Ctrl+Alt+T for new tab
# Tab 1: npm run dev (keep running)
# Tab 2: Other commands (git, npm build, etc.)
```

### Tip 2: Use Git for Version Control

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Later push to GitHub
git remote add origin https://github.com/your-username/spelling-test-app.git
git push -u origin main
```

### Tip 3: Take Advantage of Hot Reload

- Edit code
- Save file
- See changes instantly in browser
- No need to restart server

### Tip 4: Use VS Code on Chromebook

```bash
# Install VS Code in Linux:
sudo apt install code

# Open project:
code ~/projects/spelling-test-app/

# Now edit with full IDE features!
```

### Tip 5: Monitor File Changes

```bash
# Install file watcher:
sudo apt install inotify-tools

# Watch for changes:
watch -n 1 ls -la src/
```

---

## 📊 Typical Workflow

### Morning: Start Development

```bash
# Open Linux terminal
npm run dev

# See: "Local: http://localhost:5173/"
# App is ready!
```

### Throughout Day: Make Changes

```bash
# In editor:
# Edit files in src/

# Changes auto-reload in browser
# No server restart needed!
```

### Before Lunch: Test Everything

```bash
# Open DevTools (F12)
# Test all features
# Check console for errors
# Verify responsive design
```

### End of Day: Build & Deploy

```bash
# When ready to go live:
npm run build

# This creates optimized dist/ folder
# Then deploy to Netlify, Vercel, etc.
```

---

## 🔄 Deploy to Production from Chromebook

After testing locally, deploy:

### Option 1: Deploy to Netlify

```bash
# Build
npm run build

# Visit on Chrome: https://app.netlify.com/drop
# Drag dist/ folder
# ✅ Live!
```

### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# ✅ Live!
```

### Option 3: Deploy to GitHub Pages

```bash
# Commit and push to GitHub
git add .
git commit -m "Update app"
git push origin main

# Enable Pages in GitHub Settings
# ✅ Live at yourusername.github.io/repo
```

---

## ✅ Verification Checklist

After local deployment, verify:

- [ ] Dev server running (`npm run dev`)
- [ ] App loads at `http://localhost:5173`
- [ ] Can see spelling words
- [ ] Input field works (tap/type)
- [ ] "Check" button works
- [ ] Feedback displays correctly
- [ ] "Next" button changes words
- [ ] Statistics track correctly
- [ ] Data persists on reload
- [ ] Touch screen works (if testing on tablet)
- [ ] Browser console has no red errors (F12)
- [ ] Hot reload works (edit file, see change instantly)

**All verified? ✅ You're ready to develop or deploy!**

---

## 📱 Screen Size Optimization

Your app adapts to any screen size:

```
Mobile (< 768px)      : Portrait/Landscape
Tablet (768-1024px)   : Landscape recommended
Desktop (> 1024px)    : Full width
```

Test different sizes:
- F12 → Toggle device toolbar
- Try different device sizes
- App should work on all

---

## 🚀 When You're Done

### After Finishing Development:

```bash
# Stop dev server
Ctrl+C

# Build for production
npm run build

# This creates optimized dist/ folder ready to deploy
```

### Next: Deploy to Live

- See `DEPLOYMENT_COMPLETE.md` for deployment options
- Or see `00_READ_ME_FIRST_DEPLOYMENT.md` for quick start

---

## 📞 Quick Reference Commands

```bash
# Enable Linux
# Settings → Advanced → Developers → Enable Linux environment

# Start development
npm run dev

# Access in browser
# http://localhost:5173

# View logs
F12 in browser → Console tab

# Stop server
Ctrl+C

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install

# Check versions
node --version
npm --version
```

---

## 🎓 Learning Resources

### For Linux on Chromebook:
- https://support.google.com/chromebook/answer/9145439
- Chrome OS Developers: https://chromium.org

### For Node.js/npm:
- https://nodejs.org/docs/
- https://docs.npmjs.com/

### For Your App:
- React: https://react.dev/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/

---

## 🎉 You're All Set!

Your Spelling Test App is now running locally on your Chromebook with:

✅ Full development environment  
✅ Hot reload for instant feedback  
✅ Easy to test and modify  
✅ Ready to deploy when done  

**Start by running: `npm run dev` and visiting `http://localhost:5173`** 🚀

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Local Deployment Ready  
**Tested On**: Chromebook with Linux support  
**Time to Setup**: ~30 minutes total

---

## TLDR (Ultra-Quick)

```bash
# 1. Settings → Advanced → Developers → Enable Linux
# Wait 5-10 min

# 2. In Linux terminal:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone/upload your project
git clone https://github.com/YOUR_USERNAME/spelling-test-app.git
cd spelling-test-app

# 4. Install dependencies
npm install

# 5. Run development server
npm run dev

# 6. Open Chrome browser
# Visit: http://localhost:5173

# ✅ DONE! App is running locally!
```

**That's it! Start developing! 🎓**

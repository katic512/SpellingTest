# ⚡ CHROMEBOOK_LOCAL_QUICK_REFERENCE.md - Copy-Paste Commands

> **Quick copy-paste commands to deploy locally on Chromebook**

---

## 🚀 7-Step Quick Setup

### Step 1: Enable Linux
```
Settings → Advanced → Developers → Enable Linux development environment
Wait 5-10 minutes
```

### Step 2: Update Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Node.js v18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify:**
```bash
node --version    # Should show v18.x.x
npm --version     # Should show 8.x.x or higher
```

### Step 4: Get Your Project

**Option A: Clone from GitHub**
```bash
git clone https://github.com/YOUR_USERNAME/spelling-test-app.git
cd spelling-test-app
```

**Option B: Extract ZIP**
```bash
cd ~/projects
unzip ~/Downloads/spelling-test-app.zip
cd spelling-test-app
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Start Development Server
```bash
npm run dev
```

You'll see:
```
➜  Local:   http://localhost:5173/
```

### Step 7: Open in Browser
```
Chrome → http://localhost:5173
```

---

## 🎯 Essential Commands

### Start Development
```bash
npm run dev
```

### Stop Server
```bash
Ctrl+C
```

### Restart Server
```bash
npm run dev
```

### Use Different Port
```bash
npm run dev -- --port 3000
# Then visit: http://localhost:3000
```

### Build for Production
```bash
npm run build
```

### Check Versions
```bash
node --version
npm --version
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Edit & Hot Reload Workflow

1. **Keep terminal open** with `npm run dev` running
2. **Edit file** in text editor (e.g., `src/components/SpellingTest.tsx`)
3. **Save file** (Ctrl+S)
4. **Browser auto-reloads** (1-2 seconds) with your changes
5. **Test** your changes
6. **Repeat** steps 2-5

**That's it! No server restart needed!**

---

## 📱 View in Browser Tools

**Open Developer Tools:**
```
Press F12 or Right-click → Inspect
```

**Tabs:**
- **Elements** - See HTML structure
- **Console** - See logs and errors
- **Network** - See requests
- **Performance** - See speed metrics

---

## 🆘 Troubleshooting Commands

### Clear Node Modules and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Available Disk Space
```bash
df -h
```

### Check Available RAM
```bash
free -h
```

### Check Linux Terminal Status
```bash
uname -a
```

### Find Your Project Files
```bash
find ~ -name "spelling-test-app" -type d
```

### Check if Port is in Use
```bash
lsof -i :5173
```

---

## 📂 File Locations

**Your project in Linux:**
```
/home/username/projects/spelling-test-app/
```

**Source code to edit:**
```
/home/username/projects/spelling-test-app/src/
```

**Components to modify:**
```
/home/username/projects/spelling-test-app/src/components/
```

**Build output:**
```
/home/username/projects/spelling-test-app/dist/
```

---

## 🔗 Important URLs

**Local Development:**
```
http://localhost:5173/
```

**Localhost with different port:**
```
http://localhost:3000/
```

**Chrome DevTools:**
```
Press F12 in Chrome
```

---

## 📋 Complete One-Time Setup Script

Copy and paste this entire block into your Linux terminal:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version

# Create projects folder
mkdir -p ~/projects
cd ~/projects

# Clone project (replace with your username)
git clone https://github.com/YOUR_USERNAME/spelling-test-app.git
cd spelling-test-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open Chrome and visit: `http://localhost:5173`

---

## 🎓 Daily Development Workflow

### Morning: Start
```bash
cd ~/projects/spelling-test-app
npm run dev
# Visit: http://localhost:5173
```

### Throughout Day: Edit Code
```
Edit files in src/
Save file (Ctrl+S)
See changes instantly in browser!
```

### Before Submitting: Build
```bash
npm run build
```

### Deploy to Production
```bash
# After npm run build, deploy dist/ folder
# See: DEPLOYMENT_COMPLETE.md
```

---

## ⌨️ Keyboard Shortcuts

**Linux Terminal:**
- `Ctrl+C` - Stop running command
- `Ctrl+Z` - Suspend command
- `Ctrl+A` - Go to start of line
- `Ctrl+E` - Go to end of line
- `Up Arrow` - Previous command
- `Down Arrow` - Next command

**Chrome Browser:**
- `F12` - Open DevTools
- `Ctrl+Shift+R` - Hard refresh
- `Ctrl+Shift+Delete` - Clear cache
- `Ctrl+Plus` - Zoom in
- `Ctrl+Minus` - Zoom out
- `Ctrl+0` - Reset zoom

**Text Editor:**
- `Ctrl+S` - Save file
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+F` - Find

---

## 📊 Expected Output

### Successful npm run dev:
```
  VITE v7.1.12  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Successful npm install:
```
added 200+ packages in 3m 45s
```

### Successful build:
```
✓ 456 modules transformed.
dist/index.html          2.10 kB │ gzip: 0.96 kB
dist/assets/index-xxxxx.js  159 kB │ gzip: 51.23 kB
```

---

## 🚀 You're Ready!

```bash
# Just run these 3 things:

# 1. Install Node.js (Step 3 above)

# 2. Get project (Step 4 above)

# 3. Start dev server:
npm run dev

# ✅ Done! Visit http://localhost:5173
```

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Quick Reference Ready

For full details, see: `CHROMEBOOK_LOCAL_DEPLOYMENT.md`

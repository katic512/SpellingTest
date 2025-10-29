# 💻 Setup Guide - Run on Another Machine

For someone who receives your project and wants to run it on their computer.

---

## 🎯 What They Need

### Minimum Requirements
- **Computer**: Windows, Mac, or Linux
- **Software**: Node.js (free)
- **Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **Time**: 5 minutes

---

## 📥 Step-by-Step Setup

### Step 1: Install Node.js

**Option A: Download from Website**
1. Go to https://nodejs.org
2. Download LTS version (Long Term Support)
3. Run installer
4. Click "Next" through all steps
5. Restart computer

**Option B: Verify if Already Installed**
```bash
node --version
npm --version
```

If you see version numbers, Node.js is installed ✅

---

### Step 2: Get the Project

#### Option A: ZIP File (If they gave you a ZIP)
1. Download the ZIP file
2. Right-click → Extract/Unzip
3. Open the extracted folder

#### Option B: GitHub (If they gave you a link)
1. Open Terminal/Command Prompt
2. Run:
```bash
git clone <repository-link>
cd spelling-test-app
```

#### Option C: Cloud Storage (Google Drive, Dropbox, etc.)
1. Download the folder
2. Extract if it's zipped
3. Open the folder

---

### Step 3: Install Dependencies

Open Terminal/Command Prompt in the project folder and run:

```bash
npm install
```

**What it does**: Downloads all required libraries (~150 MB)

**Time**: 2-3 minutes

**You'll see**: Many lines of downloading files, then "added XXX packages"

---

### Step 4: Start the App

**For Development (with live reload)**:
```bash
npm run dev
```

**What happens**:
1. You'll see: `Local: http://localhost:5173/`
2. Automatically opens in browser
3. App is now running!

**To stop**: Press `Ctrl+C` in Terminal

---

### Step 5: Use the App

1. Open browser to `http://localhost:5173/`
2. Start practicing!
3. Progress is saved automatically

---

## 🌐 Run the Optimized Build

After development, you can build for production:

```bash
npm run build
```

**What it does**: Creates optimized version in `dist` folder

**Then view it**:
```bash
npm run preview
```

This shows what it's like deployed online.

---

## 🏃 Quick Start Commands Reference

```bash
# Install dependencies (do this first!)
npm install

# Start development (with live reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Build and preview
npm run build && npm run preview
```

---

## 🗂️ What's in the Folder?

```
spelling-test-app/
├── src/                      ← Source code (React components)
│   ├── components/           ← App components
│   └── utils/                ← Helper functions
├── dist/                     ← Built app (after npm run build)
├── node_modules/             ← Installed libraries (auto-created)
├── package.json              ← Project settings
├── package-lock.json         ← Dependency versions
├── vite.config.ts            ← Build settings
├── tsconfig.json             ← TypeScript settings
└── README.md                 ← Project description
```

---

## ✅ Verify Installation

Check everything works:

```bash
# 1. Node is installed
node --version

# 2. NPM is installed  
npm --version

# 3. Project dependencies installed
npm install

# 4. App runs
npm run dev
```

If all pass ✅, you're ready to go!

---

## 🆘 Troubleshooting

### "Command not found: npm"
**Problem**: Node.js not installed  
**Solution**: Install Node.js from https://nodejs.org

### "npm install takes forever"
**Problem**: Slow internet  
**Solution**: Normal, wait 2-5 minutes

### "Module not found" error
**Problem**: Dependencies not installed  
**Solution**: Run `npm install` again

### "Port already in use"
**Problem**: Another app using port 5173  
**Solution**: Run `npm run dev -- --port 3000`

### "Cannot read package.json"
**Problem**: Not in right folder  
**Solution**: Make sure you're in the project folder with `cd spelling-test-app`

---

## 📱 Access from Other Devices

Once running on your machine, access from:

### Same Network
1. Find your computer's IP: 
   - Mac: `System Preferences → Network` 
   - Windows: `Settings → Network`
2. From other device: `http://YOUR-IP:5173`

### Different Networks
- Share the `dist` folder (after `npm run build`)
- Deploy to Vercel or Netlify
- See DEPLOYMENT.md for options

---

## 🔄 Development Workflow

1. **Edit code** in `src/` folder
2. **Browser auto-refreshes** (thanks to Vite)
3. **Check browser** for changes
4. **Repeat!**

No need to restart `npm run dev` for most changes ✅

---

## 📦 For Full Offline Distribution

If you want to share without requiring Node.js:

**Step 1**: Build the project
```bash
npm run build
```

**Step 2**: Share the `dist` folder
- Zip the folder
- Send via email/Google Drive/etc

**Step 3**: Others just open `dist/index.html`
- No installation needed
- Works completely offline
- No npm required

---

## 💾 Saving Progress

Progress is automatically saved locally:
- Stored in browser's storage
- Persists after closing browser
- Each browser/device separate

To backup:
1. Open Dashboard (📊 button)
2. Click Export
3. Save the JSON file

---

## 🎓 File Structure Explained

### Key Files
- **package.json** - Project info and dependencies
- **vite.config.ts** - Build tool settings
- **tsconfig.json** - TypeScript settings
- **.gitignore** - Files to ignore in git

### Directories
- **src/** - Your source code
- **dist/** - Built app (production ready)
- **node_modules/** - Downloaded libraries
- **public/** - Static files (words.txt)

---

## 🚀 Next Steps

After setup:
1. ✅ Open http://localhost:5173
2. ✅ Try the app
3. ✅ Add custom words in `public/words.txt`
4. ✅ Share with others or deploy
5. ✅ See DEPLOYMENT.md for hosting options

---

## 💡 Pro Tips

### Tip 1: Keep Terminal Running
```bash
npm run dev
```
Leave this running in background. Stop with `Ctrl+C` when done.

### Tip 2: Edit and Reload
Edit files in `src/` folder, browser auto-refreshes. No restart needed!

### Tip 3: Check for Errors
Open browser DevTools: Press `F12` or `Cmd+Option+I`  
Look for errors in Console tab

### Tip 4: Faster Development
```bash
npm install
npm run dev
# Edit code
# See changes live in browser
```

### Tip 5: Production Check
Before shipping:
```bash
npm run build
npm run preview
```
This shows what users will see.

---

## 🎯 Common Tasks

### "I want to change the words"
1. Open `public/words.txt`
2. Edit the word list
3. Save file
4. Refresh browser

### "I want to change colors"
1. Edit `.css` files in `src/styles/`
2. Browser auto-refreshes
3. See changes immediately

### "I want to add a feature"
1. Edit React components in `src/components/`
2. Browser auto-refreshes with changes
3. Test in browser

### "I want to share my changes"
1. Run `npm run build`
2. Share the `dist` folder
3. Others can use it

---

## 📞 Need Help?

### Common Issues
- **Problems installing?** → Check Node.js installed
- **App won't start?** → Try: `npm install` again
- **Something broken?** → Try: Hard refresh browser (Cmd+Shift+R)
- **Want to deploy?** → See DEPLOYMENT.md

---

## ✨ You're All Set!

Your spelling test app is ready to run! 

```bash
npm install    # One time only
npm run dev    # Every time you want to use it
```

That's it! 🎉

---

**Time to setup**: ~5 minutes  
**Storage needed**: ~500 MB (including node_modules)  
**Difficulty**: Easy ✅

**Questions?** Everything is in the README.md file!

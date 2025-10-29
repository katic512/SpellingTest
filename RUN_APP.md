# 🚀 Quick Start - Getting the App Running

## Prerequisites ✅
- Node.js installed (v14+)
- npm installed
- Dependencies: `npm install` already completed

---

## Starting the Dev Server

### Option 1: From VS Code Terminal
```bash
npm run dev
```

### Option 2: From Mac Terminal
```bash
cd "/Users/katic/Library/CloudStorage/GoogleDrive-ssn.karthick@gmail.com/My Drive/Akshitha/Projects/SpellingTest"
npm run dev
```

**Expected Output:**
```
  VITE v7.1.12  ready in 125 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

## Accessing the App

1. **Wait for server to start** (should be instant)
2. **Open browser** to: `http://localhost:5173/`
3. **You should see:**
   - Header: "✨ Spelling Test ✨"
   - First word displayed
   - Audio button (🔊)
   - Input field for spelling
   - Definition area
   - Progress bar (0/46)

---

## How to Test the App

### Test 1: Basic Functionality (2 minutes)
1. Look at the word displayed
2. Click 🔊 to hear pronunciation
3. Type the word in the input field
4. Press Enter
5. See feedback (green for correct, red for incorrect)
6. Progress bar updates
7. Next word loads automatically

### Test 2: Dashboard (1 minute)
1. Click "📊 Show Stats" button in header
2. Dashboard opens showing:
   - Accuracy percentage
   - Words mastered
   - Words in progress
   - New words
3. Each word shows success/miss count
4. Click "📊 Show Stats" again to hide

### Test 3: Smart Word Ordering (3 minutes)
1. Answer ~5 questions:
   - Get 2-3 correct (go to end of list)
   - Get 1-2 wrong (stay at front)
2. Notice word order changes
3. Words you missed appear more often

### Test 4: Progress Persistence (2 minutes)
1. Answer several questions
2. Note progress: "X/46"
3. Press F5 to refresh page
4. Progress should be restored
5. Same words reappear in same order

### Test 5: Export & Reset (2 minutes)
1. Click "📊 Show Stats"
2. Click "📥 Export" button
3. File downloads: `spelling-progress-[date].json`
4. Click "🔄 Reset" button
5. Confirmation dialog appears
6. Click "Confirm"
7. Progress clears to 0/46

---

## Stopping the Dev Server
- Press `Ctrl+C` in terminal (or `Cmd+C` on Mac)
- Terminal will show: `^C` and exit

---

## Building for Production

### Build the App
```bash
npm run build
```

**Expected Output:**
```
  dist/index.html                      12.45 kB │ gzip:  4.15 kB
  dist/assets/index-abc123.js          45.67 kB │ gzip: 15.23 kB
  dist/assets/index-def456.css         23.45 kB │ gzip:  5.67 kB
  
  ✓ built in 234ms
```

### Preview Production Build
```bash
npm run preview
```

Opens the optimized production build locally.

---

## Troubleshooting

### Issue: Port 5173 already in use
**Solution:**
```bash
npm run dev -- --port 5174
```

### Issue: Module not found errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: No audio sound
**Solution:**
- Check system volume
- Click 🔊 button multiple times
- Try different browser (Chrome recommended for Web Speech API)

### Issue: Definitions not loading
**Solution:**
- Check internet connection
- Dictionary API might be rate limited (free tier limit: 45 calls/minute)
- Refresh and try again later

### Issue: Progress not saving
**Solution:**
- Check browser localStorage is enabled
- Developer Tools → Application → Local Storage
- Should see key: `spelling-test-progress`

---

## File Structure for Reference

```
SpellingTest/
├── src/
│   ├── components/          (8 React components)
│   ├── styles/              (8 CSS files)
│   ├── utils/               (progressManager.ts)
│   ├── App.tsx              (Main app component)
│   ├── main.tsx             (React entry point)
│   └── index.css            (Global styles)
├── public/
│   └── words.txt            (46 practice words)
├── package.json             (Dependencies & scripts)
├── vite.config.ts           (Vite configuration)
├── tsconfig.json            (TypeScript configuration)
└── index.html               (HTML entry point)
```

---

## Key Features Ready to Test ✅

| Feature | Status | How to Test |
|---------|--------|------------|
| Word display | ✅ Ready | See first word on app load |
| Audio pronunciation | ✅ Ready | Click 🔊 button |
| Dictionary definitions | ✅ Ready | Wait for definition to load |
| Spelling check | ✅ Ready | Type word and press Enter |
| Instant feedback | ✅ Ready | See ✅ or ❌ after submission |
| Progress bar | ✅ Ready | Increments with each correct answer |
| Smart word ordering | ✅ Ready | Answer questions, watch order change |
| Performance tracking | ✅ Ready | Click "📊 Show Stats" |
| Data persistence | ✅ Ready | Refresh page to verify |
| Export progress | ✅ Ready | Click "📥 Export" in dashboard |
| Reset progress | ✅ Ready | Click "🔄 Reset" in dashboard |
| Responsive design | ✅ Ready | Resize browser window |

---

## Success Criteria

**App is working correctly when:**
- ✅ Loads without errors
- ✅ Displays words and definitions
- ✅ Audio plays pronunciation
- ✅ Spelling check works (correct/incorrect)
- ✅ Progress bar updates
- ✅ Stats dashboard functional
- ✅ Word order changes after answers
- ✅ Progress persists on refresh
- ✅ Export downloads file
- ✅ Reset clears data
- ✅ Responsive on different screen sizes

---

## Getting Help

If something doesn't work:
1. Check the browser console: F12 → Console tab
2. Look for red error messages
3. Check the TEST_CHECKLIST.md for detailed tests
4. Refer to documentation files in project root

---

**Status**: ✅ Ready to Launch!  
**Last Verified**: October 29, 2025

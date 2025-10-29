# 🚀 Quick Start Guide for Spelling Test App

## Step 1: Open the Project in VS Code

Open VS Code and open the folder:
```
/Users/katic/Library/CloudStorage/GoogleDrive-ssn.karthick@gmail.com/My Drive/Akshitha/Projects/SpellingTest
```

## Step 2: Start the Development Server

### Option A: Using VS Code Tasks (Easiest!)
1. Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
2. Select "Start Dev Server"
3. Wait for it to start (should see "VITE v5... ready in XXX ms")
4. Click on `http://localhost:5173/` in the terminal

### Option B: Using Terminal
1. Open the integrated terminal in VS Code (`Ctrl+` `)
2. Run: `npm run dev`
3. Open your browser to `http://localhost:5173/`

## Step 3: Use the App

1. **Click the Speaker Button** 🔊 to hear the word
2. **Type the spelling** in the text box
3. **Click "Check ✓"** or press Enter
4. See if you got it right! ✅ or ❌
5. **Click "Next"** to move to the next word

## Step 4: Add Your Own Words (Optional)

1. Open `public/words.txt`
2. Add your words (comma or newline separated):
   ```
   apple, banana, cherry, dragon, elephant
   ```
   OR
   ```
   apple
   banana
   cherry
   dragon
   elephant
   ```
3. Save the file
4. Refresh the browser to see the new words

## 🎨 Customizing the App

### Change the Title
Edit `src/App.tsx` - change the title in the return statement.

### Modify Word List
Edit `public/words.txt` with your own words.

### Change Colors
Edit the CSS files in `src/styles/` - look for gradient colors and change the hex codes.

### Adjust Font Sizes
Edit files like `src/styles/SpellingTest.css` to make text bigger or smaller.

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5173 already in use | Change port in `vite.config.ts` or kill the process using that port |
| Words won't load | Check `public/words.txt` exists and is formatted correctly |
| No audio | Check browser supports Web Speech API, volume is on, try Chrome/Firefox |
| Definition won't show | Check internet connection, refresh page |

## 📦 Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized version in the `dist/` folder that you can deploy to any web server.

## 💡 Tips for Your Daughter

- **Read the definition** before attempting the word - it helps with understanding
- **Listen multiple times** by clicking the speaker button as many times as needed
- **Take your time** - spelling is a skill that improves with practice
- **Check your progress** at the top of the screen
- **Try different categories** by editing the word list with themed words

---

Have fun learning! 🎉

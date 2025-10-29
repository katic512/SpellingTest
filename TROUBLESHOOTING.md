# 🆘 Troubleshooting & Support Guide

## Common Issues & Solutions

### ❌ "npm: command not found"

**Problem**: npm is not installed or not in PATH

**Solution**:
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify: `node --version` and `npm --version`

---

### ❌ "Failed to load words.txt"

**Problem**: App shows error banner but still works with default words

**Solution**:
1. Verify `public/words.txt` exists
2. Check file is not empty
3. Refresh browser (F5 or Cmd+R)
4. Ensure words are comma or newline separated
5. Check file encoding is UTF-8

---

### ❌ No Audio When Clicking Speaker Button

**Problem**: Speaker button doesn't produce sound

**Solutions** (try in order):
1. **Check volume**: Ensure device volume is not muted
2. **Try different browser**: Chrome or Firefox recommended
3. **Check for browser support**: Some older browsers don't support Web Speech API
4. **Clear browser cache**: 
   - Chrome: Ctrl+Shift+Delete
   - Safari: Safari → Preferences → Privacy → Remove History
5. **Restart browser**: Close completely and reopen
6. **Check internet**: Ensure you have a stable connection

---

### ❌ "Port 5173 already in use"

**Problem**: Dev server won't start, says port is taken

**Solution** (pick one):
1. **Find and stop the process**:
   ```bash
   lsof -i :5173
   kill -9 <PID>
   ```

2. **Use a different port** (edit `vite.config.ts`):
   ```typescript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 5174
     }
   })
   ```

3. **Wait a minute** and try again

---

### ❌ Words Don't Update After Editing `words.txt`

**Problem**: Added new words but app still shows old ones

**Solution**:
1. Save the `words.txt` file (Cmd+S or Ctrl+S)
2. Refresh the browser (F5 or Cmd+R)
3. Clear browser cache if still showing old words
4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

---

### ❌ Definition Not Showing

**Problem**: "Definition not available" message appears

**Solutions**:
1. **Check internet connection**: Must be online for definitions
2. **Check if word is valid**: Try a common word like "apple"
3. **API limits**: Free API may have rate limits
   - Wait a few minutes and try again
4. **Try different browser**: Some browsers may block API calls
5. **Check browser console** (F12) for error messages

---

### ❌ Input Field Won't Accept Typing

**Problem**: Can't type in the spelling input

**Solutions**:
1. **Check if input is disabled**: It disables after checking
   - Click Next button and try a new word
2. **Click on the input first**: Ensure it's focused
3. **Refresh page**: F5 or Cmd+R
4. **Try different browser**
5. **Check browser extensions**: Ad blockers might interfere

---

### ❌ App Looks Weird/Broken

**Problem**: Layout is messed up, colors are wrong

**Solutions**:
1. **Hard refresh**: Ctrl+Shift+R or Cmd+Shift+R
2. **Clear browser cache**: 
   - Chrome: Settings → Privacy & Security → Clear browsing data
3. **Try different browser**
4. **Check browser zoom**: Should be at 100% (Ctrl+0 or Cmd+0)
5. **Restart dev server**: Stop and run `npm run dev` again

---

### ❌ "Cannot find module" Error

**Problem**: Red errors in terminal about missing modules

**Solutions**:
1. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   npm install
   ```

---

### ❌ Keyboard Shortcut Not Working

**Problem**: Enter key doesn't work, keyboard navigation broken

**Solutions**:
1. **Ensure input is focused**: Click on the text box first
2. **Some browsers**:
   - Safari: Might need to click button instead
   - Firefox: Should work fine
3. **Try Tab to navigate**: Should move between buttons

---

## 📱 Platform-Specific Issues

### Mac Issues

**Terminal not found?**
- Open Finder, go to Applications → Utilities → Terminal
- Use Command + Space to open Spotlight, type "terminal"

**npm commands slow?**
- Try `npm install --no-optional`
- Check if you have Node.js installed for ARM (Apple Silicon): `arch`

---

### Windows Issues

**PowerShell security error?**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**npm command not recognized?**
- Add to PATH: https://docs.microsoft.com/en-us/cpp/build/building-on-the-command-line

---

## 🌐 Browser-Specific Issues

| Browser | Web Speech API | Dictionary API | Notes |
|---------|---|---|---|
| Chrome | ✅ Excellent | ✅ Works | Recommended |
| Firefox | ✅ Good | ✅ Works | Good alternative |
| Safari | ✅ Good | ✅ Works | May require enabling |
| Edge | ✅ Good | ✅ Works | Chromium-based |
| Internet Explorer | ❌ No | ❌ No | Not supported |

### Enable in Safari
1. Preferences → Privacy → Allow all websites to access camera/microphone
2. Preferences → Develop (if not visible, check Preferences → Advanced → Show Develop menu in menu bar)

---

## 🔧 Advanced Troubleshooting

### Check Browser Console for Errors

1. Open Developer Tools:
   - Chrome/Firefox: F12
   - Safari: Command+Option+I
   - Edge: F12

2. Click "Console" tab
3. Look for red error messages
4. Screenshot and research the error message

### Check Network Requests

1. Open Developer Tools (F12)
2. Click "Network" tab
3. Refresh page (F5)
4. Look for red requests (failed downloads)
5. Check if Dictionary API calls are successful

### Debug React Components

1. Install React Developer Tools extension for your browser
2. Open Dev Tools (F12)
3. Click "Components" tab
4. Inspect component state and props

---

## 📞 Getting Help

If you get stuck:

1. **Check the documentation**:
   - README.md (full features)
   - QUICK_START.md (quick setup)
   - FEATURES.md (technical details)

2. **Check this file** (you're reading it!)

3. **Check error messages carefully**:
   - App error banners
   - Browser console (F12)
   - Terminal output

4. **Research the error**:
   - Copy the exact error message
   - Paste into Google
   - Check Stack Overflow

5. **Try common fixes**:
   - Restart dev server
   - Clear cache and refresh
   - Restart browser
   - Restart computer

---

## ✨ Performance Tips

### Make the App Faster

1. **Use Chrome** - fastest browser for this app
2. **Close other tabs** - frees up memory
3. **Clear browser cache** - speeds up loading
4. **Reduce number of words** - fewer words to load
5. **Install locally** - faster than network drive (if applicable)

### Optimize Word Loading

- Smaller `words.txt` file = faster loading
- Remove duplicate words
- Keep words reasonable (not 1000+ words)

---

## 🎓 Learning Resources

Stuck on something? Check these:

- **React Hooks**: https://react.dev/reference/react
- **TypeScript**: https://www.typescriptlang.org/play
- **Vite Setup**: https://vitejs.dev/guide/
- **Web Speech API**: https://mdn.io/Web_Speech_API
- **CSS Gradients**: https://css-tricks.com/css3-gradients/

---

## 🐛 Reporting Bugs

If you find a bug:

1. Write down exactly what you did
2. Note what went wrong
3. Check if it happens consistently
4. Try another browser
5. Check the console (F12)
6. Document the steps to reproduce

---

## ✅ Quick Self-Diagnosis Checklist

Before asking for help, verify:

- [ ] Do I have Node.js and npm installed?
- [ ] Did I run `npm install`?
- [ ] Did I start the server with `npm run dev`?
- [ ] Am I going to `http://localhost:5173/`?
- [ ] Did I try refreshing the page (F5)?
- [ ] Did I try a different browser?
- [ ] Did I check the browser console (F12)?
- [ ] Did I check the terminal output?
- [ ] Is my internet connection working?
- [ ] Are there any error banners on the page?

---

## 📝 Notes

- App works best on **Chrome or Firefox**
- **Internet required** for word definitions
- **Audio works best** with speakers/headphones on
- **Large screen better** than mobile for practice
- **Refresh regularly** to clear cache

---

Happy learning! 🎉 If you have any questions, check the README.md or FEATURES.md files.

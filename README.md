# 📚 Spelling Test App

A **smart, interactive spelling practice application** with performance tracking, intelligent word ordering, and automatic progress saving.

## ✨ Features

### 🎯 Core Features
- **Interactive Spelling Practice** - Practice spelling with audio pronunciation
- **Real-time Feedback** - Immediate correct/incorrect feedback with correct spelling display
- **Definition Display** - Learn word meanings while practicing
- **Progress Tracking** - Automatic performance tracking per word
- **Smart Word Ordering** - Words adapt based on your performance
- **Auto-save Progress** - All progress saved to browser locally
- **Keyboard Navigation** - Use Enter key to submit answers (adaptive to context)

### 📊 Advanced Features
- **Statistics Dashboard** - View comprehensive performance metrics
- **Accuracy Tracking** - Per-word and overall accuracy percentages
- **Data Export** - Export progress as JSON for backup
- **Progress Reset** - Start over when you want
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Option 1: Run Locally (Recommended for Development)
```bash
# 1. Install dependencies (one time)
npm install

# 2. Start development server
npm run dev

# 3. Browser opens automatically at http://localhost:5173/
```

### Option 2: Use Pre-built Version (No Setup)
1. Run `npm run build`
2. Download the `dist` folder
3. Open `dist/index.html` in browser
4. Start practicing!

### Option 3: Deploy Online (See Deployment Section)

---

## 📋 How to Use

### Basic Practice
1. **View Word** - Read the word and listen to pronunciation (🔊)
2. **See Definition** - Understand the word meaning
3. **Type Spelling** - Enter your spelling attempt
4. **Check Answer** - Click "Check ✓" button (or press Enter)
5. **Get Feedback** - See if correct or incorrect
6. **Retry or Next** - Try again with "Check Another ✓" or move forward with "Next →"

### Track Progress
1. Click **📊 Show Dashboard** (top right)
2. View statistics:
   - Accuracy percentage
   - Mastered words count
   - New words remaining
   - Success/miss breakdown

### Manage Data
- **Export**: Click "📥 Export" in dashboard (saves JSON file)
- **Reset**: Click "🔄 Reset" to start fresh (with confirmation)

---

## 💾 Data & Privacy

### ✅ Privacy Features
- **Local Storage Only** - All data stored in your browser
- **No Server Upload** - Nothing sent to external servers
- **No Tracking** - We don't track your activity
- **No Ads** - Completely ad-free
- **No Login Required** - Just open and use

### 📦 How Data is Stored
- Progress automatically saved after each attempt
- Data persists across browser sessions
- Survives browser restart and computer reboot
- Per-browser storage (not synced across devices)

### 🔄 Backup & Restore
```
1. Open Dashboard (📊 button)
2. Click Export (📥)
3. JSON file downloads to your computer
4. Save as backup
5. Can restore anytime by importing the file
```

---

## 🎨 User Interface

### Main Practice Screen
```
┌───────────────────────────────────────────┐
│ 🎓 Spelling Test         [📊 Show Dashboard]
├───────────────────────────────────────────┤
│ Progress: 5 / 50                         │
│                                           │
│ Word: butterfly 🔊                        │
│ 📖 Word Meaning: Large flying insect     │
│                                           │
│ Input: [Type spelling here...]           │
│                                           │
│ [Check ✓]                                │
├───────────────────────────────────────────┤
│ This Word: ✅ 3  ❌ 1                     │
│ Accuracy: 75%                            │
│ Overall: 25 attempts, 78% correct        │
└───────────────────────────────────────────┘
```

### Feedback Display
**Correct Answer**:
```
✅ Correct!
🎉 Great job! Keep it up!
[Check Another ✓] [Next →]
```

**Incorrect Answer**:
```
❌ Incorrect! Try again.

✏️ Correct spelling: butterfly
(in prominent green box)

[Check Another ✓] [Next →]
```

---

## 📊 Performance Tracking & Smart Ordering

### How Word Ordering Works
Words appear in this priority order:

1. **NEW WORDS** - Never attempted (highest priority)
2. **LOW ACCURACY** - Frequently misspelled (needs practice)
3. **MEDIUM ACCURACY** - Being learned
4. **MASTERED** - Always correct (lowest priority)

Within each category, words are shuffled randomly to keep learning dynamic.

### Example
```
Word         | Attempts | Correct | Order Why?
-------------|----------|---------|------------------
butterfly    | 0        | -       | 1st ← New word
celebrate    | 3        | 0       | 2nd ← 0% accuracy
beautiful    | 4        | 2       | 3rd ← 50% accuracy  
amazing      | 5        | 5       | Last ← 100% mastered
```

### Dashboard Statistics
- **Accuracy**: Overall correct percentage
- **Mastered**: Words with 100% accuracy
- **In Progress**: Words being practiced
- **New Words**: Words never attempted

---

## 🛠️ Installation & Setup

## 📝 Adding Your Own Words

Edit the `public/words.txt` file to add your own words:

```
apple, banana, elephant, butterfly, celebration
```

Words can be:
- **Comma-separated**: `word1, word2, word3`
- **Newline-separated**: One word per line

Simply edit the file and save - the app will automatically load the new words on the next refresh!

## 🎮 How to Use

1. **Read Instructions**: "Listen to the word and spell it:"
2. **Click Speaker Button**: 🔊 Click the speaker icon to hear the word pronounced
3. **Type Your Answer**: Type the spelling in the input box
4. **Submit**: Click "Check ✓" or press Enter
5. **Get Feedback**: 
   - ✅ Correct! - Move to the next word
   - ❌ Incorrect! - See the correct spelling and try again
6. **Navigate**: Use Previous/Next buttons to move between words

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Web Speech API** - Text-to-speech for word pronunciation
- **Dictionary API** - Free API for word definitions (dictionaryapi.dev)
- **CSS3** - Beautiful, responsive styling

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app component
├── App.css                 # App styles
├── index.css               # Global styles
├── main.tsx                # React entry point
├── components/
│   ├── SpellingTest.tsx    # Main spelling test component
│   ├── WordDisplay.tsx     # Word display with speaker button
│   ├── SpellingInput.tsx   # Input field for spelling
│   ├── Feedback.tsx        # Feedback messages
│   ├── Progress.tsx        # Progress bar and counter
│   └── DefinitionDisplay.tsx # Word definition display
└── styles/
    ├── SpellingTest.css
    ├── WordDisplay.css
    ├── SpellingInput.css
    ├── Feedback.css
    ├── Progress.css
    └── DefinitionDisplay.css
public/
└── words.txt              # Word list file
```

## 🎨 Customization

### Change Colors
Edit the CSS files in `src/styles/` to customize the appearance. Look for gradient colors like:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Font Sizes
Edit `src/styles/SpellingTest.css` and other CSS files to change font sizes for better readability.

### Modify Speech Rate
In `src/components/WordDisplay.tsx`, adjust the `utterance.rate` value (currently 0.8) to make pronunciation faster or slower.

## 🌐 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Some older browsers may not support the Web Speech API. The app will show an alert if the browser doesn't support speech synthesis.

## 🐛 Troubleshooting

### Words won't load
- Ensure `public/words.txt` exists
- Check that words are formatted correctly (comma or newline separated)
- Refresh the browser

### No audio on speaker button
- Check if your browser supports Web Speech API
- Ensure your device volume is not muted
- Try a different browser

### Dictionary definitions not showing
- The free Dictionary API may have rate limits
- Check your internet connection
- Try refreshing the page

## 📚 API References

- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Dictionary API**: https://dictionaryapi.dev/

## 📄 License

This project is free to use and modify for educational purposes.

## 🎯 Future Enhancements

Possible features to add:
- Score tracking and statistics
- Save progress to local storage
- Multiple difficulty levels
- Word categories
- Timer challenges
- Leaderboard
- Export scores

---

Happy learning! 🎉

# Admin Page - Visual Guide & Feature Walkthrough

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin · Vocabulary                      [← Practice] [Sign out]  │
│ Signed in as {username} · 42 words                              │
└─────────────────────────────────────────────────────────────────┘

[✓ Success message or ✗ Error message - auto-disappears]

┌─────────────────────────────────────────────────────────────────┐
│ Add word                                                         │
│ ┌──────────────┐ ┌──────────────────────────┐ ┌──────┐        │
│ │Spelling      │ │Meaning (optional)        │ │ Add  │        │
│ └──────────────┘ └──────────────────────────┘ └──────┘        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐ ┌──────────┐
│Search words or meanings…             │ │Refresh   │
└──────────────────────────────────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Word       │ Meaning                    │ Actions               │
├─────────────────────────────────────────────────────────────────┤
│ apple      │ a fruit that grows...      │[Edit][Delete]         │
├─────────────────────────────────────────────────────────────────┤
│ banana     │ a yellow tropical fruit    │[Edit][Delete]         │
├─────────────────────────────────────────────────────────────────┤
│ cat*       │ No meaning yet             │[Edit][Fetch][Delete]  │ ← highlighted
├─────────────────────────────────────────────────────────────────┤
│ dog*       │ No meaning yet             │[Edit][Fetch][Delete]  │ ← highlighted
└─────────────────────────────────────────────────────────────────┘
*highlighted rows indicate missing definitions
```

## Button States & Actions

### Normal View (Non-Editing)
```
[Edit]      - Click to enter edit mode for this word
[Fetch]     - Click to fetch definition from API (only if no definition)
[Delete]    - Click to delete word (with confirmation)
```

### Edit Mode
```
[Save]      - Click to save changes
[Cancel]    - Click to cancel editing without saving
```

### Button Colors
- Blue/Purple: Primary actions (Add, Edit, Fetch)
- Gray: Secondary actions (Practice link, Refresh)
- Red: Destructive actions (Delete)
- Cyan/Teal: Fetch definition button

## Feature Highlights

### 1. Add a New Word
**Before:**
- Manually fetch definition from API each time

**After:**
- Add word with optional meaning
- If no meaning provided → automatically fetches from API and saves
- Future lookups use cached definition (no API calls)

### 2. Fetch Missing Definitions
- Click "Fetch" button on highlighted rows
- System queries Merriam-Webster API
- Definition is saved to database
- Button disappears, row is no longer highlighted

### 3. Edit Word Details
- Click "Edit" to modify spelling or meaning
- Inline editing in table
- Click "Save" to persist changes
- Returns to normal view on success

### 4. Delete Words
- Click "Delete" to remove a word
- Confirmation dialog prevents accidental deletion
- User progress for that word also removed
- Success message confirms deletion

### 5. Search & Filter
- Real-time search across word spellings and meanings
- Shows "No matching words" if search returns nothing
- Case-insensitive search

### 6. Status Feedback
- **Green success message**: Word added/updated/deleted successfully
- **Red error message**: Something went wrong (with error details)
- **Spinner icon (⟳)**: Definition is being fetched from API
- **Highlighted rows**: Words without cached definitions

## Keyboard & Accessibility

- Tab navigation works through all form fields
- Enter key submits forms
- Escape can cancel edits (recommended enhancement)
- Color contrast meets WCAG standards
- Disabled buttons indicate loading/processing states

## Mobile Responsive

On smaller screens:
- Form controls stack vertically
- Table remains scrollable horizontally
- Buttons adjust size appropriately
- Layout remains usable on phones

## Performance Notes

✅ **Optimized for Speed:**
- Definitions cached in database
- No repeated API calls for same words
- Search filters locally (no server roundtrip)
- Efficient batch updates

✅ **Reliable:**
- Works even if API is temporarily unavailable
- Definitions persist across sessions
- User progress is preserved when editing words

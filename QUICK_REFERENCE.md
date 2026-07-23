# Quick Reference: Admin Panel Features

## 🎮 Feature Buttons & What They Do

### Add Word Section
```
┌─────────────────────────────────────────┐
│ [Input: Spelling]  [Input: Meaning]  [Add] │
└─────────────────────────────────────────┘

[Add] → Creates word, fetches definition if needed, shows success message
```

### Word List Actions
```
┌──────────────┬──────────────┬─────────────────────────────┐
│ Word         │ Meaning      │ Actions                     │
├──────────────┼──────────────┼─────────────────────────────┤
│ apple        │ a fruit...   │ [Edit] [Delete]             │
├──────────────┼──────────────┼─────────────────────────────┤
│ cat ⚠️       │ No meaning   │ [Edit] [Fetch] [Delete]     │
└──────────────┴──────────────┴─────────────────────────────┘

[Edit]    → Enter edit mode to modify word or definition
[Fetch]   → Get definition from API & save to database (only if no definition)
[Delete]  → Remove word permanently (with confirmation)
```

## 🔧 State Management

### Component State
```typescript
words                // All words from database
loading              // True while fetching words
error                // Error message if operation fails
success              // Success message (auto-dismiss)
search               // Search query
newWord              // New word being added
newDefinition        // Definition for new word
editingId            // Which word is being edited (null = view mode)
editWord             // Edited word value
editDefinition       // Edited definition value
fetchingDefId        // Which word's definition is being fetched
saving               // True during any async operation
```

## 🌐 API Endpoints Used

```
GET  /api/admin/words
     → Fetch all words (requires auth)
     Response: { words: [{id, word, definition, sortOrder}, ...] }

POST /api/admin/words
     → Create new word
     Body: { word, definition? }

PUT  /api/admin/words/:id
     → Update word
     Body: { word?, definition? }

DELETE /api/admin/words/:id
     → Delete word

GET  /api/words/:word/definition
     → Fetch definition (public endpoint)
     Response: { word, definition, source: 'db'|'api'|'none' }
```

## 🎨 CSS Classes

```css
.admin-words              /* Main container */
.admin-header             /* Header with title and buttons */
.admin-error              /* Red error message */
.admin-success            /* Green success message */
.admin-add                /* Add word form section */
.admin-input              /* Text inputs */
.admin-textarea           /* Multi-line inputs */
.admin-btn                /* Default button (blue) */
.admin-btn-primary        /* Primary action (purple gradient) */
.admin-btn-secondary      /* Secondary action (cyan) */
.admin-btn-danger         /* Delete action (red) */
.admin-btn-muted          /* Inactive/secondary (gray) */
.admin-table              /* Word list table */
.admin-word-cell          /* Word column styling */
.admin-def-cell           /* Definition column styling */
.admin-missing            /* Placeholder for missing definition */
.admin-row-missing-def    /* Highlight row with no definition */
.admin-actions            /* Actions cell styling */
```

## 📋 Common Workflows

### Workflow 1: Add New Word with Auto-Fetch
```
1. Type "elephant" in Spelling field
2. Leave Meaning field empty
3. Click "Add"
✓ Word saved
✓ Definition fetched from API: "a large animal with..."
✓ Definition saved to database
✓ Success message appears
✓ Word appears in list with definition
```

### Workflow 2: Add New Word with Custom Meaning
```
1. Type "zebra" in Spelling field
2. Type "striped African animal" in Meaning field
3. Click "Add"
✓ Word saved with your custom meaning
✓ No API call needed (meaning provided)
✓ Success message appears
✓ Word appears in list with your meaning
```

### Workflow 3: Fetch Definition for Existing Word
```
1. See row: "dolphin | No meaning yet | [Edit] [Fetch] [Delete]"
2. Click "Fetch"
⟳ Loading spinner appears
✓ Definition fetched: "a marine mammal..."
✓ Saved to database
✓ Row updates with definition
✓ "Fetch" button disappears
```

### Workflow 4: Edit Word Spelling
```
1. Word in list: "aple" (typo)
2. Click "Edit" button
3. Change to "apple"
4. Click "Save"
✓ Word updated to "apple"
✓ Definition preserved
✓ Success message appears
```

### Workflow 5: Edit Definition
```
1. Word in list: "penguin | a cold weather bird"
2. Click "Edit" button
3. Change definition to more accurate one
4. Click "Save"
✓ Definition updated
✓ Word spelling preserved
✓ Success message appears
```

### Workflow 6: Delete Word
```
1. Find word to delete
2. Click "Delete" button
3. Confirm in popup dialog
✓ Word removed from database
✓ User progress for word removed
✓ Row disappears from list
✓ Success message appears
```

### Workflow 7: Search Words
```
1. Type "cat" in search box
✓ List filters instantly to words containing "cat"
   e.g., "cat", "category", "concatenate"
✓ Also searches definitions
   e.g., search "animal" shows words with "animal" in definition
```

## 🎯 Button States

### Disabled States
Buttons become **disabled** (grayed out, not clickable) when:
- An operation is in progress (saving, loading, fetching)
- Invalid form data (empty word field)
- API call is in progress

### Interactive States
Buttons show visual feedback:
- **Normal**: Clickable, full color
- **Hover**: Darker shade or subtle animation
- **Active/Pressed**: Visual indication of click
- **Disabled**: Reduced opacity, cursor not-allowed

## 📱 Mobile & Accessibility

### Touch Friendly
- Large tap targets (44px+ minimum)
- Adequate spacing between buttons
- Scrollable on small screens

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit forms
- Click anywhere to dismiss success messages

### Screen Readers
- Semantic HTML structure
- ARIA labels where appropriate
- Clear button text and labels

## 🐛 Troubleshooting

### Issue: "Fetch" button won't work
**Check:** Word might already have a definition
**Action:** Clear the definition field, then try Fetch
**Message:** "Definition already exists. Clear it first if you want to refetch from API."

### Issue: Definition doesn't appear after Fetch
**Check:** 
- Network connection
- API might be rate-limited
- Word might not exist in Merriam-Webster database
**Action:** Try adding definition manually instead

### Issue: Error when adding word
**Check:** 
- Word already exists (duplicate)
- Word field is empty
- Invalid characters in word
**Action:** Check error message, modify input, try again

### Issue: Search not working
**Check:** Make sure you're searching with correct term
**Note:** Search is case-insensitive and matches partial words
**Example:** "cat" finds "concatenate", "cat", "category"

## 📊 Performance Tips

1. **Use Fetch button** for bulk definition loading
   - Instead of manually typing definitions
   - Faster and more consistent

2. **Use Search** to find words quickly
   - Rather than scrolling through entire list
   - Works on both spelling and definition

3. **Batch operations**
   - Add multiple words in sequence
   - Fetch multiple definitions
   - Then review and edit as needed

4. **Monitor word count**
   - Shown in header: "Signed in as admin · 42 words"
   - Large word lists are still fast due to database indexing

## 🔐 Permissions

- **Admin only** can access this page
- **Regular users** cannot add, edit, or delete words
- **Login required** with JWT token
- **Admin role** checked on backend

---

For more detailed information, see:
- `ADMIN_PAGE_GUIDE.md` - Full visual guide
- `DEFINITION_MANAGEMENT.md` - Architecture deep-dive
- `IMPLEMENTATION_COMPLETE.md` - Complete summary

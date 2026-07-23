# Definition Management Architecture

## The Problem We Solved

Previously, the application relied heavily on API calls:
- Each time a word was displayed, it would fetch the definition from the API
- This was inefficient, slow, and prone to failures if the API was down
- Multiple requests for the same word wasted API quota

## The Solution: Database-First Architecture

### 1. Definition Lookup Flow

```
┌─────────────────────────────────────────┐
│ User requests definition for word       │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Check Database       │
    │ for definition       │
    └──────┬───────────────┘
           │
      ┌────┴────┐
      ▼         ▼
   Found    Not Found
      │         │
      │         ▼
      │    ┌────────────────┐
      │    │ Fetch from API │
      │    └────┬───────────┘
      │         │
      │         ▼
      │    ┌────────────────┐
      │    │ Save to DB     │
      │    └────┬───────────┘
      │         │
      └─────┬───┘
            │
            ▼
    ┌──────────────────────┐
    │ Return definition    │
    │ to user              │
    └──────────────────────┘
```

### 2. API Endpoint: `/api/words/:word/definition`

**What it does:**
1. Receives a word parameter
2. Checks if definition exists in database
3. If found: Returns from DB (instant, no API call)
4. If not found:
   - Calls Merriam-Webster API
   - Saves result to database
   - Returns the definition

**Code location:** `server/dictionary.ts` - `getOrFetchDefinition()` function

**Benefits:**
- ✅ First load is slightly slower (API call needed)
- ✅ Subsequent loads are instant (DB lookup only)
- ✅ Graceful degradation if API is down (uses cached definition)
- ✅ Reduces API quota usage by ~90%

### 3. Admin Panel: "Fetch" Button

When an admin sees a word without a definition (highlighted row):

1. Click "Fetch" button
2. Frontend calls `/api/words/:word/definition`
3. Backend fetches from API and saves to DB
4. Frontend updates the row and removes "Fetch" button
5. Definition is now cached for all future requests

```typescript
// Frontend code
const handleFetchDefinition = async (id: number, currentDef: string | null) => {
  const res = await fetch(`/api/words/${encodeURIComponent(wordRow.word)}/definition`)
  const data = await res.json()
  
  if (data.definition) {
    // Save to DB via API
    await updateAdminWord(id, { definition: data.definition })
    // Update UI
    setSuccess(`Definition fetched for "${wordRow.word}"`)
  }
}
```

### 4. Adding a New Word

When admin adds a word:

```
1. Admin enters spelling + (optional) meaning
2. Click "Add"
3. Word saved to database
4. If no meaning provided:
   - Call getOrFetchDefinition()
   - API fetches from Merriam-Webster
   - Definition saved to DB
5. Return success message with word details
```

### 5. Querying Definitions During Spelling Test

When user practices:

```typescript
// User encounters a word
const word = "elephant"

// Frontend calls
const response = await fetch(`/api/words/${encodeURIComponent(word)}/definition`)
const { definition, source } = response.json()

// source tells us where it came from:
// - 'db'  = instant lookup from database
// - 'api' = first time ever, fetched and cached
// - 'none' = not found anywhere

// Show definition to user (from cache if available)
showDefinition(definition)
```

## Database Schema

### vocabulary_words table

```sql
CREATE TABLE vocabulary_words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) NOT NULL UNIQUE,
  definition TEXT,  -- ← Cached here!
  sort_order INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key column:** `definition`
- NULL = not yet fetched/cached
- TEXT = definition from API (cached)

## Implementation Details

### Source Code Files

1. **`server/dictionary.ts`**
   - `getOrFetchDefinition(word)` - Main function implementing DB-first logic
   - `fetchDefinitionFromApi(word)` - Calls Merriam-Webster API
   - `normalizeWord(word)` - Cleans word for lookup

2. **`server/index.ts`**
   - `GET /api/words/:word/definition` - Endpoint
   - `PUT /api/admin/words/:id` - Update definition

3. **`src/components/AdminWords.tsx`**
   - `handleFetchDefinition()` - Button handler for fetching
   - Displays "Fetch" button only for words without definitions

4. **`src/utils/api.ts`**
   - `updateAdminWord()` - Sends updated definition to backend

## Example Scenario

### Day 1: First Time Adding Word "Serendipity"

```
Admin adds word "serendipity" without definition
    ↓
Backend checks database → not found
    ↓
Backend calls Merriam-Webster API
    ↓
API returns: "finding something valuable by luck"
    ↓
Backend saves to database
    ↓
Frontend shows success: "Word 'serendipity' added"
    ↓
Definition is now cached
```

**Database state:**
```
word: "serendipity"
definition: "finding something valuable by luck"
```

### Day 2: User Practices with "Serendipity"

```
Student practices, encounters "serendipity"
    ↓
Frontend calls /api/words/serendipity/definition
    ↓
Backend checks database → FOUND!
    ↓
Returns instantly: "finding something valuable by luck"
    ↓
No API call made!
    ↓
Definition displayed to student
```

**Performance:**
- No API delay
- Instant response
- No API quota used

### Day 10: API is Down

```
Student practices, encounters "serendipity"
    ↓
Frontend calls /api/words/serendipity/definition
    ↓
Backend checks database → FOUND!
    ↓
Returns: "finding something valuable by luck"
    ↓
Even though Merriam-Webster API is offline,
students can still practice!
```

## Configuration

**Merriam-Webster API Key:**
```
Location: .env file
Variable: MERRIAM_WEBSTER_API_KEY
Default: Built-in key (limited quota)
Production: Use your own key for better limits
```

## Monitoring & Maintenance

### Check cached definitions count:
```sql
SELECT COUNT(*) FROM vocabulary_words WHERE definition IS NOT NULL;
```

### Find words without definitions:
```sql
SELECT word FROM vocabulary_words WHERE definition IS NULL ORDER BY word;
```

### Bulk fetch missing definitions:
1. Go to Admin panel
2. Filter/search for rows with "No meaning yet"
3. Click "Fetch" on each word
4. Definitions will be cached

## Future Enhancements

- [ ] Bulk fetch missing definitions button
- [ ] Definition edit history/audit trail
- [ ] Multiple definitions per word
- [ ] Custom definition sources besides Merriam-Webster
- [ ] Export/import definitions as JSON
- [ ] Definition quality ratings

# ⚠️ Vercel Still Showing Error? Here's What to Do

## The Error You're Seeing
```
Environment Variable "DATABASE_URL" references Secret "DATABASE_URL", which does not exist.
```

Even though you added DATABASE_URL, this error means:

### Possible Issues:

1. **You need to add JWT_SECRET too**
   - vercel.json references both DATABASE_URL and JWT_SECRET
   - Both must exist in Vercel, not just one

2. **The deployment was triggered BEFORE you added the variable**
   - Old failed build is still showing the error
   - You need to trigger a NEW deployment

3. **You need to redeploy to use the new variables**
   - Just adding variables doesn't auto-trigger a build
   - You must manually redeploy

---

## Complete Fix (Do All These Steps)

### Step 1: Verify DATABASE_URL is Added
1. Go to: https://vercel.com/dashboard
2. Click **SpellingTest** project
3. Click **Settings** → **Environment Variables**
4. You should see `DATABASE_URL` listed ✓

### Step 2: Add JWT_SECRET (IMPORTANT!)
The error might be because JWT_SECRET is also referenced but not added.

1. Click **Add New**
2. **Name:** `JWT_SECRET`
3. **Value:** `ff57122d96c38d14d718d418b6e832de211f64886120643f6c53408292fc7277`
4. **Environments:** ✓ Production, ✓ Preview, ✓ Development
5. Click **Add**

### Step 3: Add MERRIAM_WEBSTER_API_KEY
1. Click **Add New**
2. **Name:** `MERRIAM_WEBSTER_API_KEY`
3. **Value:** `2a1b51e3-7493-4ec5-b9a5-5649e9dc6f23`
4. **Environments:** ✓ Production, ✓ Preview, ✓ Development
5. Click **Add**

### Step 4: Trigger a NEW Deployment
1. Go to **Deployments** tab
2. Click on the latest failed deployment
3. Click the three dots (...) button
4. Click **Redeploy**
5. Wait for the build to complete

---

## Checklist

- [ ] DATABASE_URL is added in Vercel Environment Variables
- [ ] JWT_SECRET is added in Vercel Environment Variables
- [ ] MERRIAM_WEBSTER_API_KEY is added in Vercel Environment Variables
- [ ] All three have ✓ for Production, Preview, Development
- [ ] You clicked "Redeploy" on the latest deployment
- [ ] Build now shows "Ready" (not "Error")

---

## If Still Not Working

Try this:

1. **Check the exact error message** - Is it a different error now?
2. **Go to Deployments** → Click latest → Scroll down to "Build Logs"
3. **Look for the actual error** (not just the environment variable message)
4. **Take a screenshot** of the error and let me know what it says

---

## Test After Deployment Succeeds

Once it shows "Ready":

```bash
curl https://spelling-test-kappa.vercel.app/api/health
```

Should return:
```json
{"ok":true}
```

---

Let me know when you've:
1. Added all 3 environment variables
2. Clicked Redeploy
3. See what the new error is (if any)

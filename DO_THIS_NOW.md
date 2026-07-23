# 🚀 DO THIS NOW - Vercel Deployment (15 minutes)

## ✅ What's Done
- Backend API code: ✅ Created (`api/index.ts`)
- Configuration: ✅ Ready (`vercel.json`)
- Code: ✅ Pushed to GitHub
- Build: ✅ Succeeds locally

## ⏳ What You Need to Do

### ACTION 1: Set Environment Variables (3 minutes)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click your project: `spelling-test-kappa`

2. **Navigate to Settings**
   - Click: **Settings** (top menu bar)
   - Click: **Environment Variables** (left sidebar)

3. **Add DATABASE_URL**
   - Click: **Add New**
   - Name: `DATABASE_URL`
   - Value: Copy from Neon dashboard
     - Go to: https://console.neon.tech
     - Select your project
     - Click: **Connection String**
     - Copy the `postgres://...` URL
     - Paste into Vercel
   - Check: ✓ Production, ✓ Preview, ✓ Development
   - Click: **Save**

4. **Add JWT_SECRET**
   - Click: **Add New**
   - Name: `JWT_SECRET`
   - Value: Generate random secret
     ```bash
     # Run this in terminal, copy output
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Check: ✓ Production, ✓ Preview, ✓ Development
   - Click: **Save**

### ACTION 2: Trigger New Deployment (2 minutes)

1. **Go to Deployments**
   - In Vercel dashboard, click: **Deployments**
   - Find the latest deployment

2. **Redeploy**
   - If status shows "Building" or "Failed": Click it
   - Click: **Redeploy** button
   - Wait for: `✓ Built successfully` (3-5 minutes)

3. **Or Wait for Auto-Deploy**
   - Vercel auto-deploys when code is pushed
   - Just refresh dashboard and wait

### ACTION 3: Test It Works (2 minutes)

**Test 1: Health Check**
```bash
curl https://spelling-test-kappa.vercel.app/api/health
```
Should return: `{"ok":true}`

**Test 2: Browser Test**
- Go to: https://spelling-test-kappa.vercel.app/
- You should see login page (no 404!)
- Try to login

**Test 3: Create Account**
```bash
curl -X POST https://spelling-test-kappa.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```
Should return: Token and user info (no error)

---

## 📋 Quick Checklist

- [ ] Step 1: Set `DATABASE_URL` env var on Vercel
- [ ] Step 1: Set `JWT_SECRET` env var on Vercel
- [ ] Step 2: Trigger new deployment
- [ ] Step 2: Wait for "✓ Built successfully"
- [ ] Step 3: Test `/api/health` returns `{"ok":true}`
- [ ] Step 3: Browser shows login page (no 404)
- [ ] Done! 🎉

---

## 🆘 Still Getting 404?

**Checklist:**
1. Did you set both env vars? (DATABASE_URL, JWT_SECRET)
2. Did you wait for deployment to complete? (shows "Ready")
3. Hard refresh browser: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
4. Check Vercel build logs for errors

**Can't find environment variables section?**
- Make sure you're in: Settings → Environment Variables
- (Not in Deployments or other sections)

---

## 💡 What This Does

- ✅ Database can now connect (DATABASE_URL)
- ✅ Auth tokens can be signed (JWT_SECRET)
- ✅ API endpoints work on Vercel
- ✅ Frontend can call backend
- ✅ 404 error is fixed
- ✅ Users can login
- ✅ App is fully functional

---

## 📞 Reference

| Issue | Solution |
|-------|----------|
| Still 404 | Set env vars, wait for deploy, refresh browser |
| Build failed | Check Vercel build logs for specific error |
| Can't login | Check DATABASE_URL is correct |
| CORS error | Already configured, hard refresh browser |

---

## 🎯 Timeline

| Task | Time |
|------|------|
| Set env vars | 3 min |
| Wait for deploy | 5 min |
| Test | 2 min |
| **Total** | **~10 min** |

---

## 🎉 Success Looks Like

- ✅ `/api/health` returns `{"ok":true}`
- ✅ Homepage loads
- ✅ Login page appears
- ✅ Can create account
- ✅ Can login
- ✅ Can use app

---

**Ready? Start with ACTION 1 above! ⬆️**

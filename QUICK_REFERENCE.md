# SpellingTest - Quick Reference Guide## Project OverviewSpellingTest is a full-stack web application for practicing spelling with rewards integration and admin user management.**Tech Stack:**- Frontend: React + TypeScript + Vite- Backend: Express.js + TypeScript- Database: PostgreSQL (via Neon)- Auth: JWT + bcryptjs---## Getting Started### 1. **Setup Environment**```bash# Copy environment templatecp .env.example .env# Add your database URL to .env# DATABASE_URL=postgresql://user:password@host/database```### 2. **Install Dependencies**```bashnpm install```### 3. **Run Development Server**```bashnpm run dev```- Frontend: http://localhost:5174- API: http://localhost:3001### 4. **Build for Production**```bashnpm run buildnpm run preview```---## Project Structure```src/├── components/          # React UI components├── utils/              # API client & utilities├── auth/               # Authentication context└── styles/             # Component-specific CSSserver/├── index.ts            # Express server & API routes├── db.ts               # Database setup & queries├── auth.ts             # Authentication logic├── rewards.ts          # Reward system└── dictionary.ts       # Dictionary API integrationpublic/└── words.txt           # Word list for practice```---## Key Features### 🎯 Spelling Practice- Load words from vocabulary list- Real-time feedback on spelling- Progress tracking (successes/misses)- Word definitions via API### 💰 Reward System- Earn $0.05 per correct answer- View current balance- Cash out rewards- Track transaction history### 👨‍💼 Admin Management- View all users- Edit user information- Toggle user status (enable/disable)- Delete users and their data- Monitor reward balance### 🔐 Authentication- User registration- Secure login with JWT- Admin user pre-configured (username: `katic`)- Role-based access control---## API Endpoints### Authentication```POST   /api/auth/register    - Create new userPOST   /api/auth/login       - Login userGET    /api/auth/me          - Get current user (requires auth)```### Progress```GET    /api/progress         - Load user progressPOST   /api/progress         - Save user progressDELETE /api/progress         - Clear user progress```### Rewards```GET    /api/rewards/balance  - Get user balancePOST   /api/rewards/add      - Award pointsGET    /api/rewards/history  - Get cashout historyPOST   /api/rewards/cashout  - Process cashout```### Admin (Admin only)```GET    /api/admin/users      - List all usersPUT    /api/admin/users/:id  - Update userDELETE /api/admin/users/:id  - Delete user```### Words```GET    /api/words            - Get word list```---## Environment Variables```env# DatabaseDATABASE_URL=postgresql://...# AdminADMIN_PASSWORD=admin# Optional: Dictionary API (not required)REACT_APP_API_KEY=your_api_key```---## Database Schema### users```sqlid, username, password_hash, role, balance_cents, total_earned_cents, total_cashed_out_cents, is_enabled, created_at```### spelling_progress```sqluser_id, current_index, total_attempts, last_updated```### vocabulary_words```sqlid, word, definition, sort_order, created_at```### user_word_progress```sqluser_id, word_id, successes, misses, last_attempt```### cashout_history```sqlid, user_id, amount_cents, status, created_at```

---

## Development Tips

### Adding New Features
1. Add API endpoint in `server/index.ts`
2. Create React component in `src/components/`
3. Add API client function in `src/utils/api.ts`
4. Import and use component

### Database Changes
1. Modify schema in `server/db.ts` (initDb function)
2. Changes run automatically on startup
3. Use `ALTER TABLE IF NOT EXISTS` for safe migrations

### Styling
- Component styles in `src/styles/` or `src/components/`
- Global styles in `src/index.css` and `src/App.css`
- Use CSS classes matching component names

### Debugging
- Frontend: Browser DevTools (F12)
- Backend: Check server logs in terminal
- Database: Use PostgreSQL client to inspect

---

## Common Tasks

### Deploy to Vercel
```bash
git push origin main
# Vercel auto-deploys on push
```

### Reset Admin Password
```bash
# Set ADMIN_PASSWORD in .env
ADMIN_PASSWORD=newpassword
# Restart server - user will be updated
```

### Add New Words
```bash
# Edit public/words.txt
# Add words (one per line or comma-separated)
# They'll be seeded automatically on next startup
```

### Clear All User Data
```bash
# Use admin panel to delete users
# Or clear database: psql $DATABASE_URL < reset.sql
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 or 5173
lsof -i :3001
lsof -i :5173
kill -9 <PID>
```

### Database Connection Error
- Verify DATABASE_URL in .env
- Check if database exists
- Ensure network access if remote

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Admin Login Not Working
- Default username: `katic`
- Default password: `admin` (or from ADMIN_PASSWORD env)
- Check if user exists in database

---

## Production Checklist

- [ ] All environment variables set
- [ ] Database URL points to production database
- [ ] ADMIN_PASSWORD is secure
- [ ] vercel.json is correct
- [ ] package.json scripts updated
- [ ] No debug console.log statements
- [ ] Tests passing
- [ ] Performance optimized
- [ ] Security review complete
- [ ] Monitoring set up

---

## Support & Debugging

For issues:
1. Check browser console (F12)
2. Check server logs
3. Review error in database
4. Check .env file setup
5. Verify network connectivity

**Status Check:**
```bash
# Test API
curl http://localhost:3001/api/words

# Test Frontend
curl http://localhost:5174

# Test Database
psql $DATABASE_URL -c "SELECT count(*) FROM users;"
```

---

Last Updated: July 27, 2026

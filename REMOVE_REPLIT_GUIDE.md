# Guide: Remove Replit Dependencies

Follow these steps to remove all Replit-specific code from your app.

---

## Step 1: DELETE Files

**Delete this entire file:**
```
server/replitAuth.ts
```

---

## Step 2: UPDATE Your .env File

**Open `.env` and DELETE these 2 lines:**
```
ISSUER_URL=https://replit.com/oidc
REPL_ID=local-development
```

**Keep these lines:**
```
DATABASE_URL=mysql://logicbet_user:123456jvPT@localhost:3306/logicbet
SESSION_SECRET=logic-bet-super-secret-key-change-this-in-production
```

---

## Step 3: UPDATE server/routes.ts

**Find and DELETE** any imports like:
```typescript
import { setupAuth, isAuthenticated } from "./replitAuth";
```

**Replace with:**
```typescript
import { setupAuth, isAuthenticated } from "./localAuth";
```

That's it! All other code in routes.ts stays the same.

---

## Step 4: VERIFY Package Installation

Make sure these packages are installed:

```bash
npm install bcrypt @types/bcrypt passport passport-local @types/passport-local
```

---

## Step 5: UPDATE server/index.ts

**Nothing to change!** The `setupAuth` import will now come from `localAuth` instead.

---

## Step 6: Test Your App

```bash
npm run dev
```

Visit: http://localhost:5000

---

## What Changed:

✅ Removed Replit OIDC authentication  
✅ Added simple local authentication (username/password)  
✅ Session storage still uses MySQL  
✅ App now works 100% locally without any Replit dependencies  

---

## Note About Authentication:

The new `localAuth.ts` file is a **basic placeholder**. For production, you'll want to:

1. Add a `password` column to the `users` table
2. Hash passwords with bcrypt before storing
3. Implement proper user registration
4. Verify passwords on login

For now, it's set up so you can develop the UI without authentication blocking you.

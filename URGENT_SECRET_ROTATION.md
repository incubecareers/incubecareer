# 🚨 URGENT: SECRET ROTATION REQUIRED IMMEDIATELY

**Date:** January 21, 2026  
**Status:** CRITICAL - All production secrets are exposed in git history  
**Action Required:** Within 24 hours

---

## ⚠️ WHAT HAPPENED

All secrets in `.env` were committed to git and are visible in repository history. Even though `.env` is in `.gitignore`, the historical commits contain the actual production credentials.

**Impact:** Anyone with repository access (or if repo was ever public) can access:
- Payment gateway (process refunds, view transactions)
- SMS service (send messages, view OTPs)
- Database (full read/write access)
- OAuth (impersonate users)

---

## 🔴 STEP 1: ROTATE RAZORPAY CREDENTIALS (HIGHEST PRIORITY)

**Current Exposed:**
- Key ID: `rzp_test_TRheQ50c3IOtEq`
- Key Secret: `OXCVRaQ9iBKQX1HNGLXNWJ3Z`

**Actions:**
1. Go to https://dashboard.razorpay.com/app/keys
2. Click "Regenerate Test Key" or "Regenerate Live Key"
3. **CRITICAL:** Download new credentials immediately
4. Update `.env` and `.env.local`:
   ```
   RAZORPAY_KEY_ID=<new_key_id>
   RAZORPAY_KEY_SECRET=<new_key_secret>
   NEXT_PUBLIC_RAZORPAY_KEY_ID=<new_key_id>
   ```
5. Redeploy application IMMEDIATELY
6. Old keys will stop working - update before rotating

**Verify:**
- Test a payment transaction after rotation
- Check Razorpay dashboard for new key activity

---

## 🔴 STEP 2: ROTATE MSG91 CREDENTIALS

**Current Exposed:**
- Widget ID: `366768653055333034393739` (public - less critical)
- Token Auth: `546879TMUtnIDFZ9j6a4dd245P1` (public - less critical)
- Auth Key: `546879AYgdi9y9rG6a4e6895P1` (⚠️ SERVER SECRET - CRITICAL)

**Actions:**
1. Go to https://control.msg91.com/app/
2. Navigate to Settings → API Key
3. Click "Regenerate API Key"
4. Update `.env` and `.env.local`:
   ```
   MSG91_AUTH_KEY=<new_auth_key>
   NEXT_PUBLIC_MSG91_WIDGET_ID=<same_or_new>
   NEXT_PUBLIC_MSG91_TOKEN_AUTH=<same_or_new>
   ```
5. Redeploy

**Verify:**
- Test OTP login flow after rotation
- Send test OTP to verify service works

---

## 🔴 STEP 3: ROTATE GOOGLE OAUTH CLIENT SECRET

**Current Exposed:**
- Client ID: `234162347389-fhbr0v7bpnr8ldtiuu8oufgkvev458u3.apps.googleusercontent.com`
- Client Secret: `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` (⚠️ CRITICAL)

**Actions:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click the edit/pencil icon
4. Click "Regenerate Secret" or create new credentials
5. Update `.env` and `.env.local`:
   ```
   GOOGLE_CLIENT_ID=<new_or_same_client_id>
   GOOGLE_CLIENT_SECRET=<new_client_secret>
   ```
6. Redeploy

**Verify:**
- Test Google sign-in after rotation
- Verify existing sessions still work (JWT-based, not affected)

---

## 🔴 STEP 4: REGENERATE NEXTAUTH_SECRET

**Current Exposed:**
- Secret: `9Tf6vLgPdBB/4aKCmGQ9COKSLSSWJlv9ZdS3xk/SS50=`

**Impact:** Session forgery possible with this secret

**Actions:**
1. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
2. Update `.env` and `.env.local`:
   ```
   NEXTAUTH_SECRET=<new_secret>
   ```
3. **WARNING:** This will invalidate ALL existing sessions
4. Redeploy
5. All users will need to log in again

**Verify:**
- Test login flow after rotation
- Verify sessions persist correctly

---

## 🔴 STEP 5: ROTATE MONGODB CREDENTIALS

**Current Exposed:**
- Full URI with embedded credentials

**Actions:**
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Navigate to Database Access
4. Create new database user with same permissions
5. Delete old user: `shankarbccen572_db_user`
6. Update connection string in `.env` and `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://<new_user>:<new_password>@perspectivelearning.5zpukra.mongodb.net/perspective-learning?retryWrites=true&w=majority&appName=PerspectiveLearning
   ```
7. Redeploy

**Verify:**
- Application connects successfully
- Test database read/write operations
- Monitor for connection errors

---

## 🔴 STEP 6: CLEAN GIT HISTORY

**⚠️ WARNING:** This rewrites git history. Coordinate with team.

**Option A - If you control the repo:**
```bash
# Backup first
git clone <repo_url> incube-backup

# Remove .env from all history
cd incube
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (destructive!)
git push origin --force --all
git push origin --force --tags
```

**Option B - If repo was public or widely shared:**
Consider these nuclear options:
1. Delete the repository entirely
2. Create fresh repo with current code (no history)
3. Treat all secrets as permanently compromised
4. Enable GitHub secret scanning immediately

---

## 🔴 STEP 7: PREVENT FUTURE LEAKS

**1. Install pre-commit hooks:**
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run check-secrets"
```

**2. Add to package.json:**
```json
{
  "scripts": {
    "check-secrets": "git diff --cached --name-only | grep -E '\\.(env|env.local)$' && echo 'ERROR: .env file in commit!' && exit 1 || exit 0"
  }
}
```

**3. Enable GitHub secret scanning:**
- Go to repository Settings → Security → Code security and analysis
- Enable "Secret scanning"
- Enable "Push protection"

**4. Use environment variable validation:**
Add to your startup code:
```javascript
// lib/validateEnv.js
const requiredSecrets = [
  'RAZORPAY_KEY_SECRET',
  'MSG91_AUTH_KEY',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'MONGODB_URI'
]

requiredSecrets.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required secret: ${key}`)
  }
  if (process.env[key].length < 20) {
    throw new Error(`Secret ${key} appears too short - may be placeholder`)
  }
})
```

---

## ✅ VERIFICATION CHECKLIST

After rotating all secrets:

- [ ] Razorpay test payment completes successfully
- [ ] MSG91 OTP login works
- [ ] Google OAuth sign-in works
- [ ] Database queries execute without errors
- [ ] Application deploys and starts successfully
- [ ] No old credentials in `.env` or `.env.local`
- [ ] Git history cleaned (optional but recommended)
- [ ] Pre-commit hooks installed
- [ ] Team notified of rotation
- [ ] Monitoring alerts configured for auth failures

---

## 📞 IF SOMETHING BREAKS

**Payment fails:**
- Check Razorpay dashboard for error messages
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches `RAZORPAY_KEY_ID`
- Check browser console for Razorpay script errors

**Login fails:**
- Clear browser cookies
- Check `NEXTAUTH_SECRET` is set correctly
- Verify Google OAuth redirect URIs are configured

**Database connection fails:**
- Verify new MongoDB user has correct permissions
- Check IP whitelist in MongoDB Atlas
- Test connection string locally first

**General debugging:**
```bash
# Check environment variables are loaded
npm run dev
# In another terminal:
curl http://localhost:3000/api/health
```

---

## 🔒 COMPLETED CODE FIXES

✅ **Auth bypass removed** from:
- `lib/session.ts` - No more auto-admin creation
- `lib/admin.ts` - No more dev bypass

These changes are already committed and need to be deployed with new secrets.

---

## ⏰ TIMELINE

**Hour 0 (NOW):**
- Read this document
- Prepare access to all service dashboards

**Hour 1:**
- Rotate Razorpay credentials (highest priority)
- Test payment flow

**Hour 2:**
- Rotate MSG91 credentials
- Test OTP flow

**Hour 3:**
- Rotate Google OAuth
- Rotate NEXTAUTH_SECRET
- Test logins

**Hour 4:**
- Rotate MongoDB credentials
- Deploy with all new secrets
- Monitor for errors

**Hour 6-12:**
- Clean git history (if possible)
- Install pre-commit hooks
- Document incident

**Day 2:**
- Review logs for suspicious activity during exposure window
- Enable additional monitoring
- Security team post-mortem

---

## 🆘 NEED HELP?

This is critical. If you're unsure about any step:
1. **DON'T SKIP IT** - proceed carefully
2. Take backups before rotating
3. Test in staging environment if available
4. Keep old credentials until new ones are verified working

**After completing rotation, delete this file from the repository.**

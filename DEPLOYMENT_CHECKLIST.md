# Deployment Checklist

Complete this checklist before deploying the ARBIT Cards application to production.

## 📋 Pre-Deployment Checks

### Code Quality & Testing
- [ ] All TypeScript compilation errors resolved (`npm run build` succeeds)
- [ ] No linter errors (`npm run lint` passes)
- [ ] All console.log debug statements removed (keep only console.error for production)
- [ ] Code formatting applied (`npm run format` if needed)
- [ ] Git repository is clean and up to date
- [ ] All features tested in development environment
- [ ] Responsive design tested on multiple screen sizes (mobile, tablet, desktop)

### Environment Variables & Configuration
- [ ] Production environment variables configured:
  - [ ] `NEXT_PUBLIC_PEAR_API_URL` - Set to production Pear Protocol API URL
  - [ ] `PEAR_CLIENT_ID` - Production client ID
  - [ ] `PEAR_CLIENT_SECRET` - Production client secret (if required)
  - [ ] `PEAR_WALLET_PRIVATE_KEY` - Production wallet private key (secure storage)
  - [ ] `NODE_ENV=production`
- [ ] `.env.local` file NOT committed to git (check `.gitignore`)
- [ ] Environment variables documented in deployment platform (Vercel/Netlify/etc.)
- [ ] API endpoints configured for production environment

### Security Audit
- [ ] No API keys or secrets hardcoded in source code
- [ ] Private keys stored securely (environment variables, not in code)
- [ ] Wallet private key properly secured (use secure vault/service)
- [ ] All user inputs validated and sanitized
- [ ] API endpoints have proper error handling (no sensitive data in error messages)
- [ ] CORS configured correctly for production domain
- [ ] HTTPS enabled on production domain
- [ ] `.env.local` and sensitive files in `.gitignore`

### Dependencies & Build
- [ ] All dependencies up to date (`npm audit` run and vulnerabilities addressed)
- [ ] No deprecated dependencies
- [ ] `package.json` and `package-lock.json` committed
- [ ] Production build succeeds: `npm run build`
- [ ] Build output size checked (optimize if needed)
- [ ] Next.js build artifacts generated correctly (`.next/` directory)

### Assets & Images
- [ ] All card images present in `public/images/cards/`:
  - [ ] `nexus-prime.jpg`
  - [ ] `voidweaver.jpg`
  - [ ] `quantum-shift.jpg`
  - [ ] `nexus-helper.jpg`
  - [ ] `space-sweeper.jpg`
  - [ ] `cosmic-rager.jpg`
  - [ ] `dream-stalker.jpg`
  - [ ] `fuel-bot.jpg`
  - [ ] `fusion-core.jpg`
  - [ ] `stellar-wing.jpg`
  - [ ] `the-nexus.jpg`
  - [ ] `zephyr-flux.jpg`
- [ ] Image file sizes optimized (reasonable file sizes)
- [ ] All images accessible and loading correctly

### API Endpoints Verification
- [ ] All API routes tested:
  - [ ] `POST /api/mint-card` - Trade-to-Mint integration
  - [ ] `POST /api/execute-trade` - Custom basket trades
  - [ ] `GET /api/cards` - Card listing
  - [ ] `GET /api/cards/:id` - Card details
  - [ ] `GET /api/users/:walletAddress/cards` - User collection
  - [ ] `GET /api/market/pairs` - Trading pairs
  - [ ] `GET /api/market/ticker` - Market data
  - [ ] `POST /api/trades/close-with-card` - Close trade and mint card
- [ ] Pear Protocol API integration tested
- [ ] Error responses properly formatted
- [ ] API rate limiting considered (if applicable)

### Frontend Features
- [ ] All pages loading correctly:
  - [ ] Home page (`/`)
  - [ ] Trading page (`/trading`)
  - [ ] Portfolio page (`/portfolio`)
  - [ ] Collection page (`/collection`)
  - [ ] Gallery page (`/gallery`)
  - [ ] Card details page (`/card/:id`)
  - [ ] Help page (`/help`)
- [ ] Wallet connection working
- [ ] Navigation menu functional
- [ ] Card reveal animation (WormholeReveal) working
- [ ] Responsive design working on all breakpoints
- [ ] Dark mode / theme consistent

### Database & Data (if applicable)
- [ ] Database connection configured (if using database)
- [ ] Database migrations run (if applicable)
- [ ] Mock data removed or production data seeded
- [ ] Trade data persistence working (if storing trades)

## 🚀 Build & Deploy

### Build Process
- [ ] Run production build: `npm run build`
- [ ] Verify build output in `.next/` directory
- [ ] Check for build warnings (address critical ones)
- [ ] Build time acceptable (< 5 minutes for small apps)

### Deployment Platform Setup
- [ ] Deployment platform configured (Vercel/Netlify/other)
- [ ] Environment variables set in deployment platform
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start` (or platform default)
- [ ] Node version: `18.x` or higher (check `package.json` engines)
- [ ] Root directory: `/` (not `web-preview` or other)

### Pre-Deploy Verification
- [ ] Branch protection rules enabled (if using GitHub)
- [ ] Deployment preview tested (if available)
- [ ] Production URL configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS certificate active

## 🔍 Post-Deployment Verification

### Smoke Tests
- [ ] Application loads at production URL
- [ ] Home page displays correctly
- [ ] No console errors in browser dev tools
- [ ] Navigation links work
- [ ] Wallet connection works
- [ ] API endpoints responding correctly

### Functional Tests
- [ ] Can view card gallery
- [ ] Can view collection (if wallet connected)
- [ ] Can view portfolio
- [ ] Trading interface loads
- [ ] Card details page displays (test with `/card/nexus-prime`)
- [ ] Wormhole reveal animation works (test closing a trade)

### API Integration Tests
- [ ] Pear Protocol API connection working
- [ ] Can fetch market pairs
- [ ] Can fetch market ticker data
- [ ] Trade execution works (if enabled)
- [ ] Card minting works (if enabled)

### Performance Checks
- [ ] Page load times acceptable (< 3 seconds initial load)
- [ ] Images loading efficiently
- [ ] No memory leaks in browser console
- [ ] Mobile performance acceptable
- [ ] Lighthouse score > 80 (optional but recommended)

### Browser Compatibility
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Documentation

- [ ] `README.md` updated with deployment instructions
- [ ] API documentation up to date
- [ ] Environment variables documented
- [ ] Deployment URL documented
- [ ] Known issues/limitations documented (if any)

## 🔧 Monitoring & Maintenance

- [ ] Error tracking configured (Sentry/LogRocket/other - optional)
- [ ] Analytics configured (if applicable)
- [ ] Monitoring alerts set up (if applicable)
- [ ] Backup strategy defined (for data if applicable)
- [ ] Rollback plan prepared

## ⚠️ Security Reminders

- [ ] Never commit `.env.local` or `.env.production`
- [ ] Rotate API keys after deployment if they were used in development
- [ ] Enable rate limiting on API routes (if applicable)
- [ ] Review API access logs regularly
- [ ] Keep dependencies updated for security patches

## 🎯 Production Checklist Summary

**Critical Items (Must Complete):**
1. Environment variables configured
2. Build succeeds without errors
3. No secrets in source code
4. All card images present
5. API endpoints tested

**Important Items (Should Complete):**
1. Security audit passed
2. All pages functional
3. Responsive design verified
4. Performance acceptable

**Optional Items (Nice to Have):**
1. Analytics configured
2. Error tracking set up
3. Monitoring alerts configured

---

## Quick Commands Reference

```bash
# Build for production
npm run build

# Start production server locally (test before deploy)
npm start

# Check for security vulnerabilities
npm audit

# Run linter
npm run lint

# Format code
npm run format

# Test build locally
npm run build && npm start
```

## Deployment Platforms

### Vercel (Recommended for Next.js)
- Automatic deployments on git push
- Environment variables in dashboard
- Preview deployments for PRs

### Netlify
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `.next`

### Self-Hosted
- Ensure Node.js 18+ installed
- Run `npm run build`
- Run `npm start` or use PM2/systemd
- Configure reverse proxy (nginx)
- Set up SSL certificate

---

**Last Updated:** 2024-12-20
**Next Review:** After each major deployment

## 🔴 Known Build Issues

### Issue: React Native files in Next.js build
**Status:** ⚠️ Build currently fails due to React Native imports in root `App.tsx`

**Solution:**
- `App.tsx` in root is for React Native, not Next.js
- Next.js should ignore React Native files
- Options:
  1. Move `App.tsx` to `src/` directory (excluded from Next.js)
  2. Update `tsconfig.json` to exclude React Native files
  3. Create separate builds for web (Next.js) and mobile (React Native)

**Temporary Fix:**
- Exclude React Native files from Next.js build in `tsconfig.json`
- Or rename/move `App.tsx` to not conflict with Next.js

## ✅ Build Fixes Needed Before Deployment

- [ ] Fix TypeScript configuration to exclude React Native files from Next.js build
- [ ] Install ESLint if missing: `npm install --save-dev eslint`
- [ ] Ensure `App.tsx` doesn't conflict with Next.js (either move or exclude)
- [ ] Verify production build completes: `npm run build`



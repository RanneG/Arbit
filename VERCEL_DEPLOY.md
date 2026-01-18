# Deploying to Vercel

## Option 1: GitHub Integration (Recommended - Easiest)

1. **Push your code to GitHub** (already done ✅)

2. **Go to [vercel.com](https://vercel.com)**
   - Sign up or log in with your GitHub account

3. **Import your repository**
   - Click "Add New..." → "Project"
   - Select your repository: `RanneG/Arbit`
   - Vercel will auto-detect Next.js

4. **Configure project settings**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

5. **Set environment variables** (in Vercel dashboard):
   - `NEXT_PUBLIC_PEAR_API_URL` = `https://hl-v2.pearprotocol.io`
   - `PEAR_CLIENT_ID` = Your production client ID
   - `PEAR_CLIENT_SECRET` = Your production client secret (if required)
   - `PEAR_WALLET_PRIVATE_KEY` = Your production wallet private key (secure!)
   - `NODE_ENV` = `production`

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-5 minutes)
   - Your app will be live at `https://arbit-[hash].vercel.app`

## Option 2: Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 3: Deploy
```bash
vercel
```
Or for production:
```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (first time) or **Yes** (subsequent)
- What's your project's name? `arbit` (or your choice)
- In which directory is your code located? `./`
- Want to override settings? **No** (uses defaults)

### Step 4: Set Environment Variables (CLI)
```bash
vercel env add NEXT_PUBLIC_PEAR_API_URL
vercel env add PEAR_CLIENT_ID
vercel env add PEAR_WALLET_PRIVATE_KEY
# Add production values when prompted
```

Or add all at once:
```bash
vercel env add NEXT_PUBLIC_PEAR_API_URL production
# Enter: https://hl-v2.pearprotocol.io

vercel env add PEAR_CLIENT_ID production
# Enter: Your client ID

vercel env add PEAR_WALLET_PRIVATE_KEY production
# Enter: Your private key (secure!)
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_PEAR_API_URL` | Pear Protocol API base URL | `https://hl-v2.pearprotocol.io` |
| `PEAR_CLIENT_ID` | Pear Protocol client ID | `APITRADER` or your client ID |
| `PEAR_CLIENT_SECRET` | Pear Protocol client secret (if required) | Your secret |
| `PEAR_WALLET_PRIVATE_KEY` | Wallet private key for agent wallet | `0x...` (keep secure!) |
| `NODE_ENV` | Environment | `production` |

## Post-Deployment

1. **Verify deployment**
   - Visit your Vercel URL
   - Test all pages load correctly
   - Test wallet connection
   - Test API endpoints

2. **Custom domain (optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

3. **Monitor deployment**
   - Check Vercel dashboard for build logs
   - Monitor function logs for API errors
   - Set up alerts (optional)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify `npm run build` works locally
- Check environment variables are set
- Ensure TypeScript config excludes React Native files

### Environment Variables Not Working
- Make sure variables are set for **Production** environment
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### API Errors
- Verify `NEXT_PUBLIC_PEAR_API_URL` is correct
- Check `PEAR_CLIENT_ID` and `PEAR_WALLET_PRIVATE_KEY` are valid
- Review API logs in Vercel Functions tab

### Runtime Errors
- Check browser console for errors
- Review Vercel function logs
- Verify all dependencies are in `package.json`

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Security Notes

- ⚠️ Never commit `.env.local` or `.env.production` files
- ✅ Use Vercel's environment variables (encrypted)
- ✅ Keep `PEAR_WALLET_PRIVATE_KEY` secure - never commit to git
- ✅ Use different keys for development and production


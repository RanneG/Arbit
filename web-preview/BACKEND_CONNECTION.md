# Connecting to Your Friend's Backend

This guide will help you connect your web app to your friend's backend that has wallet extensions and Bitcoin wallet integration.

## Step 1: Get Your Friend's Backend Information

Ask your friend for:
- **Backend URL** (e.g., `https://api.arbit-cards.com` or `http://localhost:3000`)
- **API Base Path** (usually `/api` or `/v1`)
- **Any required API keys or authentication tokens**
- **CORS configuration** (if testing locally)

## Step 2: Configure Environment Variables

### Option A: Using Environment File (Recommended)

1. **Copy the example file:**
   ```bash
   cd web-preview
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   VITE_API_BASE_URL=https://your-friends-backend.com/api
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option B: Direct Configuration

Edit `src/services/api.ts` and update line 5:

```typescript
const API_BASE_URL = 'https://your-friends-backend.com/api';
```

## Step 3: Test the Connection

1. **Start your web app:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) and check for:
   - Network requests to your friend's backend
   - Any CORS errors
   - API response errors

3. **Test endpoints:**
   - Gallery should load cards from backend
   - Collection should load user's cards
   - Card details should fetch from backend

## Step 4: Handle CORS (If Needed)

If you get CORS errors, your friend needs to add your frontend URL to their backend CORS configuration:

**For development:**
```javascript
// Backend CORS config
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
```

**For production:**
```javascript
app.use(cors({
  origin: ['https://your-website.com'],
  credentials: true
}));
```

## Step 5: Wallet Integration

Since your friend has wallet extensions, you may need to:

1. **Install wallet connector library** (if not already):
   ```bash
   npm install @web3modal/wagmi wagmi viem
   ```

2. **Update wallet connection** in your components to use your friend's wallet provider

3. **Test wallet connection** - ensure wallet addresses are passed correctly to API

## Step 6: Production Deployment

When deploying to production:

1. **Set environment variable** in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **Other**: Check hosting provider docs

2. **Add `VITE_API_BASE_URL`** with your friend's production backend URL

3. **Rebuild and deploy:**
   ```bash
   npm run build
   ```

## Troubleshooting

### CORS Errors
- **Problem**: Browser blocks requests to different domain
- **Solution**: Friend needs to add your frontend URL to backend CORS whitelist

### 404 Errors
- **Problem**: API endpoints not found
- **Solution**: Verify API base path matches backend routes

### Authentication Errors
- **Problem**: 401 Unauthorized
- **Solution**: Check if backend requires API keys or tokens in headers

### Network Errors
- **Problem**: Cannot connect to backend
- **Solution**: 
  - Verify backend URL is correct
  - Check if backend is running
  - Verify firewall/network settings

## Sharing Your Web App Code

To give your friend the web app code:

1. **Option A: Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial web app"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Option B: Zip File**
   ```bash
   cd ..
   zip -r arbit-cards-web.zip web-preview/
   ```

3. **Option C: Deploy and Share URL**
   - Deploy to Vercel/Netlify
   - Share the live URL with your friend
   - They can see it working immediately

## Next Steps

1. ✅ Configure API URL
2. ✅ Test connection
3. ✅ Fix CORS if needed
4. ✅ Test wallet integration
5. ✅ Deploy to production
6. ✅ Share with your friend

## Need Help?

- Check browser console for specific errors
- Verify backend is running and accessible
- Test API endpoints directly (using Postman or curl)
- Check network tab in browser DevTools

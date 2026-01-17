# How to Share Your Web App with Your Friend

Since your friend has the backend with wallet extensions, here's how to share your web app code with them.

## Quick Share Options

### Option 1: Git Repository (Best for Collaboration)

1. **Create a GitHub repository:**
   ```bash
   cd web-preview
   git init
   git add .
   git commit -m "ARBIT Cards web app"
   ```

2. **Push to GitHub:**
   - Create a new repo on GitHub
   - Follow GitHub's instructions to push

3. **Share the repository URL** with your friend

4. **Your friend can then:**
   ```bash
   git clone <repository-url>
   cd web-preview
   npm install
   cp .env.example .env
   # Edit .env with their backend URL
   npm run dev
   ```

### Option 2: Zip File (Quick Transfer)

1. **Create a zip file:**
   ```bash
   cd /Users/kylaangeles/Desktop/ARBIT\ -\ CARDS
   zip -r arbit-cards-web.zip web-preview/ -x "web-preview/node_modules/*" "web-preview/dist/*"
   ```

2. **Send the zip file** to your friend

3. **Your friend extracts and runs:**
   ```bash
   unzip arbit-cards-web.zip
   cd web-preview
   npm install
   cp .env.example .env
   # Edit .env with their backend URL
   npm run dev
   ```

### Option 3: Deploy and Share URL (Easiest)

1. **Deploy to Vercel:**
   ```bash
   cd web-preview
   npm i -g vercel
   vercel
   ```

2. **Share the live URL** with your friend

3. **Your friend can:**
   - See it working immediately
   - Clone the repo if they want the code
   - Update environment variables in Vercel dashboard

## What Your Friend Needs to Do

### 1. Get the Code
- Clone from Git, extract zip, or fork repository

### 2. Install Dependencies
```bash
cd web-preview
npm install
```

### 3. Configure Backend URL
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=https://their-backend-url.com/api
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## File Structure Your Friend Will Receive

```
web-preview/
├── src/
│   ├── components/     # All React components
│   ├── services/       # API service (ready to connect)
│   ├── types/          # TypeScript types
│   ├── data/           # Mock data (fallback)
│   └── App.tsx         # Main app
├── public/             # Images and assets
├── .env.example        # Environment template
├── package.json        # Dependencies
├── vite.config.ts      # Build config
└── README.md           # Documentation
```

## Important Files for Backend Connection

1. **`src/services/api.ts`** - API configuration
2. **`.env`** - Backend URL configuration
3. **`vite.config.ts`** - Build settings

## What's Already Set Up

✅ API service layer ready  
✅ All endpoints defined  
✅ Error handling configured  
✅ TypeScript types for API responses  
✅ Environment variable support  
✅ CORS-ready configuration  

## Next Steps After Sharing

1. Your friend configures `.env` with their backend URL
2. Tests locally with `npm run dev`
3. Deploys to their hosting platform
4. Updates environment variables in production
5. Your web app is now connected to their backend!

## Support

If your friend has questions:
- Check `BACKEND_CONNECTION.md` for detailed setup
- Check `README.md` for general info
- Check browser console for errors
- Verify backend is running and accessible

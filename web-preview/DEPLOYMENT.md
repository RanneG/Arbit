# Deployment Guide

This guide will help you deploy the ARBIT Cards website to various hosting platforms.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd web-preview
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

4. **Your site will be live at:** `https://your-project.vercel.app`

**Or use GitHub Integration:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite and deploys automatically

---

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   cd web-preview
   npm run build
   netlify deploy --prod
   ```

3. **Or use Netlify Dashboard:**
   - Push code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy!

**Configuration:** The `netlify.toml` file is already configured for SPA routing.

---

### Option 3: GitHub Pages

1. **Update `vite.config.ts`:**
   ```typescript
   base: '/your-repo-name/'
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   # Install gh-pages
   npm install --save-dev gh-pages
   
   # Add to package.json scripts:
   "deploy": "npm run build && gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://username.github.io/repo-name`

---

### Option 4: Any Static Host (AWS S3, Cloudflare Pages, etc.)

1. **Build:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your hosting provider

3. **Configure SPA routing:**
   - All routes should serve `index.html`
   - This allows client-side routing to work

---

## Environment Variables

Create a `.env` file for production:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

**For Vercel/Netlify:**
- Add environment variables in dashboard
- Prefix with `VITE_` for Vite to expose them

---

## Custom Domain

### Vercel:
1. Go to project settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to site settings → Domain management
2. Add custom domain
3. Configure DNS as instructed

---

## Performance Optimization

The build is already optimized with:
- Code splitting
- Minification
- Asset optimization
- Cache headers (configured in `netlify.toml` and `vercel.json`)

---

## Troubleshooting

### Routes not working (404 errors)
- Ensure SPA routing is configured (all routes → `index.html`)
- Check `netlify.toml` or `vercel.json` configuration

### API calls failing
- Check CORS settings on backend
- Verify `VITE_API_BASE_URL` environment variable
- Check browser console for errors

### Build fails
- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires Node 18+)
- Review build logs for specific errors

---

## Post-Deployment Checklist

- [ ] Test all navigation routes
- [ ] Verify API connections work
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Verify SEO meta tags
- [ ] Check loading performance
- [ ] Test card interactions
- [ ] Verify images load correctly

---

## Need Help?

- Check the main README.md
- Review Vite documentation: https://vitejs.dev
- Check hosting provider documentation

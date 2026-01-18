# ARBIT Cards Website

A production-ready website for ARBIT Cards - a trading card platform that combines collectible cards with crypto trading education.

## Features

- **Card Gallery**: Browse all available trading cards with search and filters
- **Collection**: View your personal card collection with stats
- **Card Details**: Detailed view of each card with trading stats
- **Help & FAQ**: Comprehensive guide for new users
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI**: Dark theme with gradient effects and smooth animations

## Quick Start

### Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:3001`

### Production Build

```bash
npm run build
npm run preview
```

Build output will be in the `dist/` folder.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Or connect your GitHub repo in Netlify dashboard

### Deploy to GitHub Pages

1. Update `vite.config.ts` base to your repo name:
   ```ts
   base: '/your-repo-name/'
   ```
2. Build: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages

### Deploy to Any Static Host

1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure your server to serve `index.html` for all routes (SPA routing)

## Project Structure

```
web-preview/
├── public/          # Static assets (images, favicon)
├── src/
│   ├── components/  # React components
│   ├── data/        # Mock data
│   ├── types/       # TypeScript types
│   ├── App.tsx      # Main app component
│   └── main.tsx     # Entry point
├── index.html       # HTML template
└── vite.config.ts   # Vite configuration
```

## Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS3**: Styling with modern features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Variables

Create a `.env` file for API configuration:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

Access in code: `import.meta.env.VITE_API_BASE_URL`

## Performance

- Code splitting for optimal loading
- Image optimization
- Lazy loading components
- Minified production builds

## SEO

- Meta tags configured
- Semantic HTML
- Accessible navigation
- Open Graph tags for social sharing

## License

See LICENSE file in root directory.

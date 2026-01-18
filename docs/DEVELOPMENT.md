# Development Guide

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Card.tsx        # Trading card component
├── screens/            # App screens
│   ├── CardGalleryScreen.tsx
│   ├── CardDetailsScreen.tsx
│   └── CollectionScreen.tsx
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx
├── services/          # API services
│   ├── api.ts         # Backend API integration
│   └── wallet.example.ts  # Wallet integration template
├── types/             # TypeScript types
│   └── Card.ts        # Card data models
└── data/              # Mock data
    └── mockCards.ts   # Sample cards
```

## Development Workflow

1. **Start Metro bundler**: `npm start`
2. **Run on device/simulator**: `npm run ios` or `npm run android`
3. **Web preview**: `cd web-preview && npm run dev`

## Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Follow React Native best practices

## Adding New Features

1. Create components in `src/components/`
2. Add screens in `src/screens/`
3. Update navigation in `src/navigation/`
4. Add types in `src/types/`
5. Update API services in `src/services/`

## Testing

Currently using mock data. When backend is ready:
1. Update API endpoints in `src/services/api.ts`
2. Remove mock data fallbacks
3. Test with real wallet connections

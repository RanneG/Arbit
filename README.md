# ARBIT Cards - Space-Themed Trading Cards Mobile App

A React Native mobile app for collecting and trading space-themed character cards, designed to integrate with Hyperliquid and Pear API backend for crypto trading functionality.

## 🎴 Features

- **Trade-to-Mint Integration**: Mint character cards by executing live Pear Protocol trades (core hackathon requirement)
- **Card Gallery**: Browse all available space-themed trading cards with search and filters
- **Collection**: View your personal card collection with stats
- **Trading Stats**: Learn crypto trading concepts through gamified stats (Long, Short, Leverage, Market IQ)
- **Beautiful UI**: Space-themed design with gradient effects, rarity emojis, and animations
- **Live Trading Interface**: Pear Garden-style trading interface with real-time candlestick charts
- **Backend Ready**: API service layer prepared for Hyperliquid/Pear integration

## 📱 Project Structure

```
ARBIT-CARDS/
├── src/                    # React Native app source code
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation setup
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── data/               # Mock data
├── web-preview/            # Web preview version (for development/testing)
└── scripts/                # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and Android SDK

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **For iOS (Mac only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start Metro bundler:**
   ```bash
   npm start
   ```

4. **Run the app:**
   ```bash
   npm run ios      # iOS
   npm run android  # Android
   ```

### Web Preview

To preview the app in your browser:

```bash
cd web-preview
npm install
npm run dev
```

Then open `http://localhost:3001`

## 🎨 Card Characters

The app features 12 unique space-themed characters:

- **Nexus Prime** (Legendary) - Mad Scientist of Dimension X-9
- **Zephyr Flux** (Epic) - The Anxious Sidekick
- **Voidweaver** (Legendary) - Master of Dimensional Rifts
- **Quantum Shift** (Epic) - The Reality Bender
- **Nexus Helper** (Rare) - The Task Master
- **Stellar Wing** (Epic) - Champion of the Celestial Aviary
- **Cosmic Rager** (Rare) - The Party Beast
- **Dream Stalker** (Uncommon) - The Nightmare Runner
- **Fuel Bot** (Rare) - The Hungry Automaton
- **The Nexus** (Legendary) - The Collective Consciousness
- **Space Sweeper** (Common) - The Cosmic Janitor
- **Fusion Core** (Epic) - The Experimental Hybrid

## 📊 Trading Stats Explained

Each card has four trading-related stats that teach crypto trading concepts:

- **📈 Buy Up (Long Position)**: Ability to profit when prices rise
- **📉 Sell Down (Short Position)**: Ability to profit when prices fall
- **⚖️ Risk Power (Leverage)**: Risk management and position sizing ability
- **🧠 Market Smarts (Market IQ)**: Understanding of market dynamics and trends

See `docs/TRADING_STATS_GUIDE.md` for detailed explanations.

## 🔗 Backend Integration

The app is designed to work with a backend that integrates Hyperliquid and Pear API. See `docs/BACKEND_INTEGRATION.md` for API endpoint specifications.

### Trade-to-Mint Integration

**POST** `/api/mint-card` - Core hackathon integration endpoint that executes a real Pear Protocol trade when minting a character card.

When a user mints a card:
1. Frontend sends `characterId` and `userWallet` to `/api/mint-card`
2. Backend maps character to thematic basket trade configuration
3. Backend executes real Pear Protocol basket trade (using `pearClient.executeBasketTrade()`)
4. Backend receives real `orderId` from Pear Protocol
5. Backend generates card metadata with `orderId` embedded
6. Frontend displays minted card with real trade confirmation

**Example Request:**
```json
{
  "characterId": "nexus-prime",
  "userWallet": "0x..."
}
```

**Example Response:**
```json
{
  "success": true,
  "trade": {
    "orderId": "pear_ord_abc123",
    "status": "filled",
    "characterId": "nexus-prime"
  },
  "card": {
    "id": "nexus-prime-pear_ord_abc123",
    "name": "Nexus Prime",
    "description": "... Trade Order ID: pear_ord_abc123"
  }
}
```

See `DEMO_SCRIPT.md` for the complete demo flow.

### Expected API Endpoints

- `POST /api/mint-card` - **Trade-to-Mint Integration** (core hackathon requirement)
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get card by ID
- `GET /api/users/:walletAddress/cards` - Get user's collection
- `GET /api/market/pairs` - Get available trading pairs
- `GET /api/market/ticker?pair=...` - Get market ticker data
- `POST /api/execute-trade` - Execute custom basket trade

## 🖼️ Adding Card Images

Card images should be placed in:
- **Web Preview**: `web-preview/public/images/cards/`
- **React Native**: `src/assets/images/cards/`

Required files (400x600px, JPG or PNG):
- `nexus-prime.jpg`, `zephyr-flux.jpg`, `voidweaver.jpg`, etc.

See `docs/IMAGE_SETUP.md` for detailed instructions.

## 📚 Documentation

- `docs/TRADING_STATS_GUIDE.md` - Explanation of trading stats
- `docs/BACKEND_INTEGRATION.md` - Backend API specifications
- `docs/IMAGE_SETUP.md` - How to add card images
- `docs/DEVELOPMENT.md` - Development guide

## 🛠️ Tech Stack

- **React Native** 0.72.6
- **TypeScript**
- **React Navigation** - Navigation system
- **React Native Linear Gradient** - Gradient effects
- **Axios** - HTTP client for API calls

## 📝 License

MIT

## 🤝 Contributing

This is a collaborative project. Coordinate with backend developers to ensure API contracts match.

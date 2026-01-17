# Backend Integration Guide

This document outlines the API endpoints expected by the ARBIT Cards frontend for integration with Hyperliquid and Pear API backend.

## Base URL Configuration

Update the `API_BASE_URL` in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-backend-api.com/api';  // Production
```

## Card Management Endpoints

### Get All Cards
```
GET /api/cards
```
**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "title": "string",
    "rarity": "common|uncommon|rare|epic|legendary",
    "faction": "nebula|void|stellar|cosmic|quantum",
    "stats": {
      "longPosition": 0-100,
      "shortPosition": 0-100,
      "leverage": 0-100,
      "marketIQ": 0-100
    },
    "description": "string",
    "imageUrl": "string",
    "marketValue": number,
    "tradingPair": "string",
    "lastTradePrice": number
  }
]
```

### Get Card by ID
```
GET /api/cards/:id
```

### Get User Collection
```
GET /api/users/:walletAddress/cards
```
**Response:**
```json
{
  "walletAddress": "string",
  "cards": [...],
  "totalCards": number,
  "totalValue": number
}
```

### Filter Cards
```
GET /api/cards?rarity=:rarity
GET /api/cards?faction=:faction
```

## Hyperliquid Integration

### Get Market Data
```
GET /api/hyperliquid/market/:pair
```
**Example:** `GET /api/hyperliquid/market/BTC-USD`

### Get User Positions
```
GET /api/hyperliquid/positions/:walletAddress
```

## Pear API Integration

### Execute Pair Trade
```
POST /api/pear/pair-trade
```
**Request Body:**
```json
{
  "walletAddress": "string",
  "longPair": "string",
  "shortPair": "string",
  "amount": number
}
```

### Get Trade Status
```
GET /api/pear/trade/:tradeId
```

## Authentication

### Connect Wallet
```
POST /api/auth/connect
```
**Request Body:**
```json
{
  "walletAddress": "string",
  "signature": "string"
}
```

### Verify Connection
```
GET /api/auth/verify/:walletAddress
```

## Error Handling

All endpoints should return standard HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "error": "string",
  "message": "string"
}
```

## Testing

During development, the app uses mock data. To test with real backend:

1. Update `API_BASE_URL` in `src/services/api.ts`
2. Remove mock data fallbacks
3. Ensure CORS is enabled on backend
4. Test with testnet first

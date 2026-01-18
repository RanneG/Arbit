# Trade-to-Mint Integration Demo Script

## Overview

This document describes the **Trade-to-Mint** integration demo flow - the core hackathon requirement that connects card minting to live Pear Protocol trading.

## Demo Flow

### Step 1: User Selects Character Card

User navigates to the home page and sees the "Mint & Trade" button.

- Character: **Nexus Prime** (Legendary - Mad Scientist of Dimension X-9)
- Trade Configuration:
  - Long: HYPE (50%), ARB (50%)
  - Short: ETH (100%)
  - Notional: $10 USD

### Step 2: User Clicks "Mint & Trade"

When the user clicks the **"Mint & Trade (Nexus Prime)"** button:

1. Frontend sends POST request to `/api/mint-card`:
   ```json
   {
     "characterId": "nexus-prime",
     "userWallet": "0x..."
   }
   ```

2. Backend executes the integration:
   - Validates request (characterId and userWallet)
   - Maps character to trade configuration (via `lib/tradeMapping.ts`)
   - Executes real Pear Protocol basket trade via `pearClient.executeBasketTrade()`
   - Uses real authentication (APITRADER client ID)
   - **No mock mode** - this is a live trade execution

3. Pear Protocol processes the trade:
   - Returns real `orderId` (e.g., `pear_ord_abc123`)
   - Returns trade `status` (e.g., `filled`)

4. Backend generates card metadata:
   - Combines base card data from `mockCards.ts`
   - Embeds the real `orderId` in card description
   - Sets `ownerAddress` to user's wallet
   - Sets `mintedAt` timestamp

5. Response returned to frontend:
   ```json
   {
     "success": true,
     "trade": {
       "orderId": "pear_ord_abc123",
       "status": "filled",
       "characterId": "nexus-prime",
       "notional": 10,
       "basket": {
         "long": ["HYPE", "ARB"],
         "short": ["ETH"]
       }
     },
     "card": {
       "id": "nexus-prime-pear_ord_abc123",
       "name": "Nexus Prime",
       "rarity": "Legendary",
       "description": "... Trade Order ID: pear_ord_abc123",
       ...
     }
   }
   ```

### Step 3: Display Minted Card

Frontend displays the newly minted card:

- Card component shows the character image, name, rarity, stats
- **Real `orderId` is visible in the card description**
- Card can be added to user's collection
- User can view trade details via the embedded `orderId`

## Success Criteria ✅

The integration is successful when:

1. ✅ User clicks "Mint & Trade" → POST request sent to `/api/mint-card`
2. ✅ Backend executes real Pear Protocol trade → Receives valid `orderId`
3. ✅ Card displayed with real `orderId` embedded in description
4. ✅ Trade details verifiable via Pear Protocol (using `orderId`)

## Technical Details

### API Endpoint

**POST** `/api/mint-card`

**Request:**
```typescript
{
  characterId: string  // e.g., "nexus-prime"
  userWallet: string   // e.g., "0x1234..."
}
```

**Response (Success):**
```typescript
{
  success: true
  trade: {
    orderId: string      // Real Pear Protocol order ID
    status: string       // e.g., "filled"
    characterId: string
    notional: number
    basket: {
      long: string[]
      short: string[]
    }
  }
  card: Card            // Full card metadata with orderId embedded
  message: string
}
```

**Response (Error):**
```typescript
{
  success: false
  error: string         // User-friendly error message
  details?: string      // Additional error details
}
```

### Trade Mapping

Location: `lib/tradeMapping.ts`

Maps character IDs to basket trade configurations:
- Character: `nexus-prime`
- Trade: Long HYPE+ARB, Short ETH
- Weights: Custom (50/50 for long, 100% for short)
- Notional: $10 USD

### Real Trade Execution

Uses `pearClient.executeBasketTrade()`:
- Authenticates via Pear Protocol API (APITRADER client ID)
- Executes basket trade on Hyperliquid
- Returns real `orderId` from Pear Protocol
- **No mock mode** - this endpoint requires real authentication

## Error Handling

If trade execution fails:
- No card is minted (maintains integrity)
- Error message returned to frontend
- User can retry after resolving issues:
  - Builder approval
  - Agent wallet setup
  - Sufficient balance
  - API configuration

## Next Steps (Future)

1. Add more characters to `CHARACTER_TRADES` mapping
2. Support multiple characters in mint selection UI
3. Add card metadata caching for minted cards
4. Display trade history per card

## Hackathon Notes

For demo purposes:
- Focus on **Nexus Prime** character working end-to-end
- Real `orderId` in card description proves live integration
- Trade execution uses real Pear Protocol API (not mocked)
- This demonstrates the core hackathon requirement: **Trade-to-Mint Integration**


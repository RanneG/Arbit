# Card Rarity & Value Calculation System Prompt

## 🎯 Core Concept

When a user closes a crypto trading position in this app, they receive a collectible card. The card's **rarity** and **value** are determined by how well the trade performed. **Better trades = better cards.**

The system rewards both trading skill (high ROI) and patience (hold duration) through a transparent, mathematical formula that converts trade metrics into card attributes.

---

## 📐 The Math: Progressive Complexity (Simple → Advanced)

### 1. Basic ROI-Based Rarity (MVP - Start Here)

**Formula:**
```
Rarity = f(|ROI%|)

If |ROI| ≥ 100% → MYTHIC
If |ROI| ≥ 50%  → LEGENDARY  
If |ROI| ≥ 25%  → EPIC
If |ROI| ≥ 10%  → RARE
Else            → COMMON
```

**Key Points:**
- Use **absolute value** of ROI (both profits and losses count)
- Big moves in either direction are rare and valuable
- Simple if/else logic - perfect for MVP

**Examples:**
- BTC trade with **75% profit** → `LEGENDARY` card
- ETH trade with **8% profit** → `COMMON` card
- SOL trade with **120% loss** → `MYTHIC` card (big moves are rare!)

---

### 2. Add Hold Duration Bonus (Enhanced)

**Formula:**
```
Score = (|ROI| × 0.5) + min(HoldDays, 20)

If Score ≥ 90 → MYTHIC
If Score ≥ 70 → LEGENDARY
If Score ≥ 50 → EPIC  
If Score ≥ 30 → RARE
Else         → COMMON
```

**Key Points:**
- Rewards holding longer (capped at 20 days)
- Balances ROI impact (50% weight) with patience (up to 20 points)

**Examples:**
- **40% ROI held 15 days**: Score = (40 × 0.5) + 15 = **35** → `RARE`
- **20% ROI held 30 days**: Score = (20 × 0.5) + 20 = **30** → `RARE` (cap at 20 days)

---

### 3. Complete MVP Formula (Full System)

**Formula:**
```
Total Score = ROI_Score + Duration_Score + Size_Score + Win_Bonus

Where:
- ROI_Score    = min(|ROI%|, 100) × 0.5    (0-50 points)
- Duration_Score = min(HoldDays, 20)       (0-20 points)
- Size_Score   = min(NotionalUSD ÷ 100, 20) (0-20 points)
- Win_Bonus    = 10 if ROI > 0, else 0     (0-10 points)

Rarity Thresholds:
- MYTHIC:      ≥90 points
- LEGENDARY:   ≥70 points  
- EPIC:        ≥50 points
- RARE:        ≥30 points
- COMMON:      <30 points
```

**Key Points:**
- **4 factors** balance skill (ROI), patience (duration), conviction (size), and success (win bonus)
- Each factor capped to prevent dominance
- Total max score: **100 points** (50 + 20 + 20 + 10)

**Example Calculation:**
```
Trade: BTC long, $5,000 notional, 45% ROI, held 7 days

ROI_Score    = min(45, 100) × 0.5 = 22.5
Duration_Score = min(7, 20)       = 7
Size_Score   = min(5000 ÷ 100, 20) = 20
Win_Bonus    = 10 (profit > 0)

Total Score  = 22.5 + 7 + 20 + 10 = 59.5 → EPIC
```

---

### 4. Card Value Calculation

**Formula:**
```
Card Value = max(Profit × Rarity_Multiplier, $10)

Where:
- Profit = |(ROI% ÷ 100) × NotionalUSD|
- Rarity_Multipliers:
  - COMMON:    1.2×
  - RARE:      1.5×
  - EPIC:      2.0×
  - LEGENDARY: 3.0×
  - MYTHIC:    5.0×
```

**Key Points:**
- Value scales with actual profit/loss
- Minimum card value: **$10** (even losing trades get value)
- Rarer cards have higher multipliers

**Examples:**
```
Trade: $1,000 notional, 20% profit ($200), RARE card
Value = $200 × 1.5 = $300

Trade: $5,000 notional, 45% profit ($2,250), EPIC card  
Value = $2,250 × 2.0 = $4,500

Trade: $100 notional, -50% loss ($50), LEGENDARY card
Value = $50 × 3.0 = $150 (above $10 minimum)
```

---

### 5. Card Naming Algorithm

**Formula:**
```
Card Name = Adjective + Asset + Noun

Where:
- Adjective = from rarity/performance table
- Asset = trading pair base (BTC from BTC/USD)
- Noun = from direction (Long/Short) and outcome (Bull/Bear)
```

**Adjective Tables:**

**MYTHIC (Wins):** `["Godlike", "Divine", "Perfect", "Celestial"]`  
**MYTHIC (Losses):** `["Catastrophic", "Apocalyptic", "Disastrous", "Legendary Loss"]`

**LEGENDARY (Wins):** `["Epic", "Legendary", "Supreme", "Majestic"]`  
**LEGENDARY (Losses):** `["Titanic", "Colossal", "Monumental Loss"]`

**EPIC (Wins):** `["Stellar", "Magnificent", "Brilliant", "Superb"]`  
**EPIC (Losses):** `["Massive", "Substantial Loss"]`

**RARE (Wins):** `["Strong", "Solid", "Notable", "Impressive"]`  
**RARE (Losses):** `["Significant Loss"]`

**COMMON (Wins):** `["Modest", "Steady", "Stable"]`  
**COMMON (Losses):** `["Minor Loss"]`

**Noun Rules:**
- Long position + Profit → `"Bull"` or `"Surger"`
- Short position + Profit → `"Bear"` or `"Short"`  
- Long position + Loss → `"Dump"` or `"Slump"`
- Short position + Loss → `"Squeeze"` or `"Rally"`

**Examples:**
- 75% profit on BTC long → `"Epic BTC Bull"` or `"Legendary BTC Surger"`
- 60% profit on ETH short → `"Legendary ETH Short"`
- 30% loss on SOL long → `"Notable SOL Slump"`

---

## 💻 Implementation Guidance

### Step 1: Ask for Trade Data Structure

**Before implementing, clarify what data is available:**

```
What data is available when a trade closes?
- ROI percentage (signed: + for profit, - for loss)
- Hold time in days (or milliseconds?)
- Trade size in USD (notional)
- Trading pair (BTC/USD, ETH/USD, etc.)
- Direction (LONG/SHORT)
- Entry price, exit price
- Entry timestamp, exit timestamp
- Actual PnL in USD
```

**Recommended TypeScript Interface:**
```typescript
interface ClosedTrade {
  id: string
  pair: string  // "BTC/USD"
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  notional: number  // USD
  roi: number  // percentage (signed: + for profit, - for loss)
  pnl: number  // USD (signed)
  entryTime: string  // ISO timestamp
  exitTime: string   // ISO timestamp
  holdDays: number   // calculated from timestamps
}
```

---

### Step 2: Progressive Implementation

**Phase 1: ROI-Only Rarity** (MVP)
- Simple if/else based on |ROI|
- Pure function: `calculateRarity(roi: number): Rarity`
- Test with various ROI values

**Phase 2: Add Hold Duration Bonus**
- Extend function: `calculateRarity(roi: number, holdDays: number): Rarity`
- Implement scoring formula
- Test edge cases (0 days, 100+ days)

**Phase 3: Complete Formula**
- Full implementation: `calculateRarity(trade: ClosedTrade): Rarity`
- Add size score and win bonus
- Tune thresholds based on test data

**Phase 4: Fine-Tune**
- Collect real trade data
- Analyze score distribution
- Adjust thresholds to match desired rarity distribution (e.g., 1% MYTHIC, 5% LEGENDARY)

---

### Step 3: Code Examples

**Pure Rarity Calculator Function:**
```typescript
enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

function calculateRarity(trade: ClosedTrade): Rarity {
  const roiScore = Math.min(Math.abs(trade.roi), 100) * 0.5
  const durationScore = Math.min(trade.holdDays, 20)
  const sizeScore = Math.min(trade.notional / 100, 20)
  const winBonus = trade.roi > 0 ? 10 : 0
  
  const totalScore = roiScore + durationScore + sizeScore + winBonus
  
  if (totalScore >= 90) return Rarity.MYTHIC
  if (totalScore >= 70) return Rarity.LEGENDARY
  if (totalScore >= 50) return Rarity.EPIC
  if (totalScore >= 30) return Rarity.RARE
  return Rarity.COMMON
}
```

**Card Value Calculator:**
```typescript
const RARITY_MULTIPLIERS = {
  [Rarity.COMMON]: 1.2,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 2.0,
  [Rarity.LEGENDARY]: 3.0,
  [Rarity.MYTHIC]: 5.0,
}

function calculateCardValue(trade: ClosedTrade, rarity: Rarity): number {
  const profit = Math.abs((trade.roi / 100) * trade.notional)
  const multiplier = RARITY_MULTIPLIERS[rarity]
  return Math.max(profit * multiplier, 10) // Minimum $10
}
```

**Card Name Generator:**
```typescript
const ADJECTIVES = {
  [Rarity.MYTHIC]: {
    win: ['Godlike', 'Divine', 'Perfect', 'Celestial'],
    loss: ['Catastrophic', 'Apocalyptic', 'Disastrous'],
  },
  [Rarity.LEGENDARY]: {
    win: ['Epic', 'Legendary', 'Supreme', 'Majestic'],
    loss: ['Titanic', 'Colossal'],
  },
  // ... etc
}

function generateCardName(trade: ClosedTrade, rarity: Rarity): string {
  const isWin = trade.roi > 0
  const adjectives = ADJECTIVES[rarity][isWin ? 'win' : 'loss']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  
  const asset = trade.pair.split('/')[0] // BTC from BTC/USD
  
  let noun: string
  if (trade.direction === 'LONG') {
    noun = isWin ? 'Bull' : 'Slump'
  } else {
    noun = isWin ? 'Short' : 'Rally'
  }
  
  return `${adjective} ${asset} ${noun}`
}
```

**Integration with Trade Closing Endpoint:**
```typescript
// In your trade closing API endpoint
app.post('/api/close-trade', async (req, res) => {
  const closedTrade = await closeTradePosition(req.body.tradeId)
  
  // Calculate card attributes
  const rarity = calculateRarity(closedTrade)
  const value = calculateCardValue(closedTrade, rarity)
  const name = generateCardName(closedTrade, rarity)
  
  // Create card
  const card = {
    id: `${closedTrade.id}-card`,
    name,
    rarity,
    value,
    sourceTradeId: closedTrade.id,
    mintedAt: new Date().toISOString(),
    // ... other card metadata
  }
  
  // Save card to database/user collection
  await saveCardToCollection(req.user.walletAddress, card)
  
  res.json({
    success: true,
    trade: closedTrade,
    card,
  })
})
```

---

### Step 4: Edge Cases & Considerations

**Very Small Trades ($10):**
- Minimum card value ($10) ensures all cards have some worth
- Size score will be minimal, but not zero

**Very Short Holds (minutes/hours):**
- Convert to days (e.g., 2 hours = 0.083 days)
- Consider minimum hold period (e.g., 1 hour) for card eligibility?

**Negative ROI Trades:**
- **Include them!** Big losses are rare and interesting
- Use absolute value for ROI score
- Still provide minimum value ($10)

**Extreme Values (1000% ROI):**
- Cap ROI at 100% for score calculation (ROI_Score max = 50)
- But use actual ROI for value calculation
- Consider special "ULTRA MYTHIC" for >200% ROI?

**Hold Duration Cap:**
- Capped at 20 days to prevent "buy and forget" exploits
- Alternative: logarithmic scaling instead of hard cap

**Trade Size Cap:**
- Capped at $2000 notional for size score (÷100, max 20)
- Prevents whale-only high scores
- Alternative: use percentile-based scoring

---

## 🎮 Key Principles to Emphasize

### 1. Transparency
- **Users should understand** how their trade becomes a card
- Display calculation breakdown in UI
- Show: "Your 45% ROI + 7 day hold + $5K size = EPIC card"

### 2. Gamification
- **Reward skill** (high ROI) AND **patience** (hold duration)
- Balance multiple factors so no single metric dominates
- Make rare cards feel earned, not random

### 3. Market Value
- Rare cards should have **meaningful value** ($100+ for LEGENDARY+)
- Value should scale with actual trading performance
- Minimum value ensures even losing trades create collectibles

### 4. Progression
- **Start simple** (ROI-only) for MVP
- **Add complexity** based on user feedback and data
- Iterate on thresholds after collecting real trade data

---

## 📖 Example User Story

**As a trader:**
> When I close a BTC position with 45% profit after holding 7 days with $5,000 size, I want to receive an **EPIC "Stellar BTC Bull"** card worth **~$4,500**, so I feel rewarded for my trading skill and patience.

**Breakdown:**
```
Trade: BTC long, $5,000, +45% ROI, 7 days

Score Calculation:
- ROI Score: 45 × 0.5 = 22.5
- Duration: 7
- Size: min(5000 ÷ 100, 20) = 20
- Win Bonus: 10
- Total: 59.5 → EPIC

Value Calculation:
- Profit: $5,000 × 0.45 = $2,250
- EPIC Multiplier: 2.0×
- Card Value: $2,250 × 2.0 = $4,500

Name: "Stellar BTC Bull" (EPIC + Long + Profit)
```

---

## 🔧 Implementation Checklist

When implementing this system, ensure:

- [ ] **Pure calculation functions** (testable, no side effects)
- [ ] **TypeScript types** for trade data and card attributes
- [ ] **Unit tests** for edge cases (0 ROI, extreme values, etc.)
- [ ] **Integration** with trade closing endpoint
- [ ] **UI components** to display rarity calculation breakdown
- [ ] **Card metadata storage** (rarity, value, source trade ID)
- [ ] **Collection update** when trade closes
- [ ] **Error handling** for invalid trade data
- [ ] **Logging** for debugging rarity calculations
- [ ] **Documentation** of formula and thresholds

---

## 🎯 Success Metrics

After implementation, track:

1. **Rarity Distribution**: Are cards distributed as intended? (e.g., ~1% MYTHIC)
2. **Value Range**: Are card values meaningful and varied?
3. **User Engagement**: Do users understand and care about card rarity?
4. **Trade Behavior**: Does card system encourage better trading?

---

## 📝 Notes for AI Assistant

When helping implement this system:

1. **Ask first**: What trade data is available? What's the current data structure?
2. **Start simple**: Begin with ROI-only calculation, test thoroughly
3. **Build incrementally**: Add complexity (duration, size, win bonus) one at a time
4. **Provide examples**: Show exact calculations for sample trades
5. **Consider edge cases**: Very small trades, short holds, extreme ROI
6. **Suggest testing**: Provide test cases with expected outputs
7. **Integration guidance**: Show how to connect to existing trade closing flow
8. **UI suggestions**: How to display rarity calculation to users

Remember: The goal is to make traders feel rewarded for good trades while maintaining transparency and fairness.


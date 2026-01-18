/**
 * Trade Mapping for Character-to-Mint Integration
 * Maps character IDs to Pear Protocol basket trade configurations
 * 
 * Each character card "mint" triggers a specific thematic basket trade
 * that represents the character's trading narrative.
 */

export interface CharacterTradeConfig {
  long: string[]  // Assets to long (e.g., ['HYPE', 'ARB'])
  short: string[] // Assets to short (e.g., ['ETH'])
  notional: number // Trade notional value in USD
  weightsLong: number[] // Weights for long assets (must sum to 1.0)
  weightsShort: number[] // Weights for short assets (must sum to 1.0)
  orderType?: 'market' | 'limit' // Order type (default: 'market')
  limitPrice?: number // Optional limit price for limit orders
}

/**
 * Character Trade Configurations
 * Maps character IDs to their thematic basket trades
 */
export const CHARACTER_TRADES: Record<string, CharacterTradeConfig> = {
  'nexus-prime': {
    long: ['HYPE', 'ARB'],
    short: ['ETH'],
    notional: 10,
    weightsLong: [0.5, 0.5],
    weightsShort: [1.0],
    orderType: 'market',
  },
  // Additional characters can be added here
  // 'zephyr-flux': { ... },
  // 'voidweaver': { ... },
} as const

/**
 * Get trade configuration for a character
 * @param characterId - The character ID (e.g., 'nexus-prime')
 * @returns The trade configuration or null if not found
 */
export function getCharacterTrade(characterId: string): CharacterTradeConfig | null {
  return CHARACTER_TRADES[characterId] || null
}

/**
 * List all available character IDs that can be minted
 */
export function getAvailableCharacters(): string[] {
  return Object.keys(CHARACTER_TRADES)
}

/**
 * Get character ID from various formats
 * Handles both 'nexus-prime' and 'Nexus Prime' formats
 */
export function normalizeCharacterId(input: string): string | null {
  const lowerInput = input.toLowerCase().trim()
  
  // Direct match
  if (CHARACTER_TRADES[lowerInput]) {
    return lowerInput
  }
  
  // Try matching by converting spaces to hyphens
  const hyphenated = lowerInput.replace(/\s+/g, '-')
  if (CHARACTER_TRADES[hyphenated]) {
    return hyphenated
  }
  
  // Try finding by case-insensitive key match
  for (const key of Object.keys(CHARACTER_TRADES)) {
    if (key.toLowerCase() === lowerInput || key.toLowerCase().replace(/-/g, ' ') === lowerInput) {
      return key
    }
  }
  
  return null
}


import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  authenticateWithPrivateKey,
  getWalletAddress,
  type AuthTokens,
} from './pear-auth'

export interface BasketTradeParams {
  long: string[]  // Array of coin symbols (e.g., ['AI', 'ML'])
  short: string[] // Array of coin symbols (e.g., ['ETH'])
}

export interface BasketAsset {
  coin: string
  weight: number
}

export interface ExecuteBasketTradeResponse {
  orderId: string
  status: string
  message?: string
}

/**
 * Pear Protocol Builder Address
 * All trades are routed to this address and it must be approved before trading
 * See: https://docs.pearprotocol.io/api-integration/access-management/builder-code
 */
export const PEAR_BUILDER_ADDRESS = '0xA47D4d99191db54A4829cdf3de2417E527c3b042'

/**
 * Pear Protocol API Client
 * Real implementation for Pear Protocol API basket trade execution
 * 
 * ✅ Ported from working Python implementation (test/pear_client.py)
 * - Uses APITRADER client ID (matches Python version)
 * - Automatic authentication before trades
 * - Real JWT token-based authentication
 */
export class PearClient {
  private client: AxiosInstance
  private clientId: string
  private apiUrl: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private privateKey: string | null = null
  private walletAddress: string | null = null

  constructor() {
    // Use APITRADER like the working Python version
    this.clientId = process.env.PEAR_CLIENT_ID || 'APITRADER'
    this.apiUrl = process.env.NEXT_PUBLIC_PEAR_API_URL || 'https://hl-v2.pearprotocol.io'
    
    // Get private key from environment (matches Python: WALLET_PRIVATE_KEY)
    this.privateKey = process.env.PEAR_WALLET_PRIVATE_KEY || null
    if (this.privateKey) {
      // Remove quotes if present
      if ((this.privateKey.startsWith('"') && this.privateKey.endsWith('"')) ||
          (this.privateKey.startsWith("'") && this.privateKey.endsWith("'"))) {
        this.privateKey = this.privateKey.slice(1, -1)
      }
      this.walletAddress = getWalletAddress(this.privateKey)
      console.log(`Pear Client initialized with wallet: ${this.walletAddress}`)
    }

    console.log(`Pear Client initialized with API URL: ${this.apiUrl}`)
    console.log(`Client ID: ${this.clientId}`)

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': this.clientId,
        // Add Bearer token if we have one
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      },
    })
  }

  /**
   * Parse trade response to extract order ID and status
   */
  private _parseTradeResponse(responseData: any): ExecuteBasketTradeResponse {
    // Handle different possible response formats
    let orderId: string
    let status: string

    if (responseData.orderId) {
      orderId = responseData.orderId
    } else if (responseData.id) {
      orderId = responseData.id
    } else if (responseData.order_id) {
      orderId = responseData.order_id
    } else {
      // Fallback: use transaction hash or any identifier
      orderId = responseData.txHash || responseData.hash || 'unknown'
    }

    status = responseData.status || responseData.state || 'submitted'

    return {
      orderId,
      status,
      message: responseData.message || 'Trade executed successfully',
    }
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string, refreshToken?: string): void {
    this.accessToken = token
    if (refreshToken) {
      this.refreshToken = refreshToken
    }
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Ensure we have a valid access token
   * If no token or expired, authenticate using private key
   */
  private async ensureAuthenticated(): Promise<void> {
    // If we have a token, assume it's valid (in production, check expiration)
    if (this.accessToken) {
      return
    }

    // Need to authenticate
    if (!this.privateKey) {
      throw new Error(
        'PEAR_WALLET_PRIVATE_KEY is required in .env.local for authentication'
      )
    }

    if (!this.walletAddress) {
      throw new Error('Wallet address could not be derived from private key')
    }

    console.log('No access token found. Authenticating...')
    const tokens = await authenticateWithPrivateKey(
      this.walletAddress,
      this.privateKey,
      this.clientId
    )

    this.setAccessToken(tokens.accessToken, tokens.refreshToken)
    console.log('✅ Authentication successful, token set')
  }

  /**
   * Check agent wallet status
   * Returns agent wallet info if it exists
   */
  async checkAgentWallet(): Promise<any> {
    await this.ensureAuthenticated()
    try {
      const response = await this.client.get('/agentWallet')
      const data = response.data
      console.log('Raw agent wallet response:', JSON.stringify(data, null, 2))
      
      // If response is empty object, the wallet exists but may need approval
      if (data && Object.keys(data).length === 0) {
        console.warn('⚠️ Agent wallet exists but appears empty/unapproved')
        console.warn('⚠️ You may need to approve it. Check if there\'s an approval endpoint.')
      }
      
      return data
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.warn('⚠️ Agent wallet not found. You may need to create one.')
          return null
        }
        console.error('Error checking agent wallet:', {
          status: error.response?.status,
          data: error.response?.data,
        })
      }
      throw error
    }
  }

  /**
   * Get agent wallet approval message (if wallet exists but needs approval)
   * This might be a separate endpoint or part of the wallet creation flow
   */
  async getAgentWalletApprovalMessage(): Promise<any> {
    await this.ensureAuthenticated()
    try {
      // Try common approval message endpoints
      const endpoints = [
        '/agentWallet/approval',
        '/agentWallet/approval-message',
        '/agentWallet/message',
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.get(endpoint)
          console.log(`Found approval message at ${endpoint}:`, JSON.stringify(response.data, null, 2))
          return response.data
        } catch (e: any) {
          // Continue to next endpoint
          if (axios.isAxiosError(e) && e.response?.status !== 404) {
            console.warn(`Error checking ${endpoint}:`, e.response?.status)
          }
        }
      }
      
      console.warn('⚠️ Could not find approval message endpoint. Wallet may need manual approval.')
      return null
    } catch (error: any) {
      console.error('Error getting approval message:', error)
      return null
    }
  }

  /**
   * Create agent wallet
   * Returns the approval message that needs to be signed
   */
  async createAgentWallet(): Promise<any> {
    await this.ensureAuthenticated()
    
    // First check if wallet already exists
    const existingWallet = await this.checkAgentWallet()
    if (existingWallet !== null && existingWallet !== undefined) {
      const isEmpty = Object.keys(existingWallet || {}).length === 0
      if (!isEmpty) {
        console.log('Agent wallet already exists. It may need approval.')
        return { exists: true, wallet: existingWallet, needsApproval: true }
      }
    }
    
    try {
      console.log('Creating agent wallet...')
      // POST /agentWallet - The API rejects empty body with application/json content-type
      // Use a raw axios request without the default Content-Type header
      const response = await axios.post(
        `${this.apiUrl}/agentWallet`,
        undefined, // No body
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Client-Id': this.clientId,
            // Don't set Content-Type - let server handle it without JSON header
            'Content-Type': undefined,
          },
          transformRequest: [], // Disable default JSON transformation
        }
      )
      const data = response.data
      console.log('Agent wallet creation response:', JSON.stringify(data, null, 2))
      return data
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        }
        console.error('Error creating agent wallet:', JSON.stringify(errorDetails, null, 2))
        
        // If 400, provide more helpful error message with full details
        if (error.response?.status === 400) {
          const errorData = error.response?.data
          const errorMsg = typeof errorData === 'string' 
            ? errorData 
            : JSON.stringify(errorData)
          throw new Error(`Agent wallet creation failed (400): ${errorMsg}`)
        }
      }
      throw error
    }
  }

  /**
   * Execute a basket trade through Pear Protocol
   * @param basket - Object with long and short asset arrays
   * @param notional - Notional value in USD (default: $10)
   * @returns Order ID and status from Pear Protocol
   */
  async executeBasketTrade(
    basket: BasketTradeParams,
    notional: number = 10
  ): Promise<ExecuteBasketTradeResponse> {
    // Ensure we have a valid access token before making authenticated requests
    await this.ensureAuthenticated()
    try {
      // Validate basket
      // According to Pear Protocol API docs, one of longAssets or shortAssets can be empty
      if ((!basket.long || basket.long.length === 0) && (!basket.short || basket.short.length === 0)) {
        throw new Error('At least one of long or short assets must be provided')
      }

      // Normalize coin symbols (remove /USD, /USDC, etc.)
      const normalizeCoin = (symbol: string): string => {
        return symbol.split('/')[0].trim().toUpperCase()
      }

      // Build long assets with equal weights if not specified
      const longAssets: BasketAsset[] = (basket.long || []).map((coin, index) => {
        const normalizedCoin = normalizeCoin(coin)
        // Distribute weights equally
        const weight = 1.0 / (basket.long?.length || 1)
        return { coin: normalizedCoin, weight }
      })

      // Build short assets with equal weights
      const shortAssets: BasketAsset[] = (basket.short || []).map((coin, index) => {
        const normalizedCoin = normalizeCoin(coin)
        // Distribute weights equally
        const weight = 1.0 / (basket.short?.length || 1)
        return { coin: normalizedCoin, weight }
      })

      // Verify weights sum to 1.0 (approximately, due to floating point)
      // Only check if the array is not empty
      if (longAssets.length > 0) {
        const longWeightSum = longAssets.reduce((sum, asset) => sum + asset.weight, 0)
        if (Math.abs(longWeightSum - 1.0) > 0.01) {
          throw new Error(`Long assets weights must sum to 1.0, got ${longWeightSum}`)
        }
      }
      if (shortAssets.length > 0) {
        const shortWeightSum = shortAssets.reduce((sum, asset) => sum + asset.weight, 0)
        if (Math.abs(shortWeightSum - 1.0) > 0.01) {
          throw new Error(`Short assets weights must sum to 1.0, got ${shortWeightSum}`)
        }
      }

      // Build request payload according to Pear Protocol API specification
      // POST /positions expects: executionType, leverage, usdValue, slippage, longAssets, shortAssets
      // Note: Builder code (0xA47D4d99191db54A4829cdf3de2417E527c3b042) must be approved before trades
      // See: https://docs.pearprotocol.io/api-integration/access-management/builder-code
      
      // Convert assets to use 'asset' field instead of 'coin' (API requirement)
      const longAssetsFormatted = longAssets.map(({ coin, weight }) => ({
        asset: coin, // Use 'asset' instead of 'coin'
        weight,
      }))
      
      const shortAssetsFormatted = shortAssets.map(({ coin, weight }) => ({
        asset: coin, // Use 'asset' instead of 'coin'
        weight,
      }))

      // Check agent wallet before trading (helps diagnose 500 errors)
      const agentWallet = await this.checkAgentWallet()
      const isEmptyWallet = !agentWallet || Object.keys(agentWallet).length === 0
      
      if (isEmptyWallet) {
        console.warn('⚠️ Agent wallet is empty or not found. This may cause 500 errors.')
        console.warn('⚠️ You may need to:')
        console.warn('   1. Create an agent wallet via POST /agentWallet')
        console.warn('   2. Approve the agent wallet with your wallet signature')
        console.warn('   3. Approve the builder code (0xA47D4d99191db54A4829cdf3de2417E527c3b042)')
      } else {
        console.log('Agent wallet details:', JSON.stringify(agentWallet, null, 2))
        const status = (agentWallet.status || (agentWallet.isApproved ? 'APPROVED' : 'UNKNOWN')) as string
        console.log(`Agent wallet status: ${status}`)
        if (status !== 'APPROVED' && !agentWallet.isApproved) {
          console.warn(`⚠️ Agent wallet may not be approved. Status: ${status}`)
        }
      }

      // Build payload - check if vaultAddress is needed from agent wallet
      const agentAddress = agentWallet?.address || agentWallet?.agentAddress
      
      // If agent wallet is empty, try a simpler long-only trade first
      // This helps diagnose if the issue is with basket complexity or agent wallet
      const useSimpleTrade = isEmptyWallet && longAssetsFormatted.length > 0
      
      const payload: any = {
        executionType: 'MARKET', // or 'TWAP' for time-weighted
        leverage: 1, // Default 1x leverage
        usdValue: notional, // Must be a number, not a string, and >= 1
        slippage: 0.05, // Between 0.001 and 0.1 (5% default)
        longAssets: useSimpleTrade 
          ? [longAssetsFormatted[0]] // Try just the first asset if agent wallet is empty
          : longAssetsFormatted,
        shortAssets: useSimpleTrade 
          ? [] // No shorts for simple test
          : shortAssetsFormatted,
        // Builder code is included automatically by Pear Protocol if approved
      }
      
      if (useSimpleTrade) {
        console.log('⚠️ Using simplified trade (long-only, single asset) due to empty agent wallet')
        console.log('⚠️ This is a diagnostic test. Full basket trades require agent wallet approval.')
      }
      
      // Add agent address if available (may be required for some endpoints)
      if (agentAddress) {
        console.log(`Using agent address: ${agentAddress}`)
        // Note: Some endpoints may require agentAddress or vaultAddress
        // Uncomment if needed: payload.agentAddress = agentAddress
      }

      // Use the correct endpoint from Pear Protocol API documentation
      // POST /positions is the correct endpoint for basket trades
      const endpoint = '/positions'
      
      console.log(`Executing basket trade on endpoint: ${endpoint}`)
      console.log('Trade payload:', JSON.stringify(payload, null, 2))
      
      try {
        const response = await this.client.post(endpoint, payload)
        console.log('Trade response:', JSON.stringify(response.data, null, 2))
        return this._parseTradeResponse(response.data)
      } catch (error: any) {
        // Enhanced error logging for debugging
        if (axios.isAxiosError(error)) {
          console.error('Trade execution error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            requestPayload: payload, // Include payload in error log
          })
        }
        throw error
      }
    } catch (error) {
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        const errorMessage = axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message

        console.error('Pear Protocol API Error:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        })

        throw new Error(
          `Pear Protocol API error: ${axiosError.response?.status || 'Unknown'} - ${errorMessage}`
        )
      }

      // Handle other errors
      throw error instanceof Error
        ? error
        : new Error('Unknown error executing basket trade')
    }
  }
}

// Export a singleton instance
// Note: Instantiated at module load time, which is fine for API routes
// The error.tsx and global-error.tsx files handle any initialization errors gracefully
export const pearClient = new PearClient()

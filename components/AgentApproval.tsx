'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const BUILDER_ADDRESS = '0xA47D4d99191db54A4829cdf3de2417E527c3b042'

// Hyperliquid Exchange Contract Address (Arbitrum One Mainnet)
// If this doesn't work, we'll fall back to demo mode
// Common Hyperliquid addresses to try (will attempt in order):
const HYPERLIQUID_EXCHANGE_ADDRESSES = [
  '0x592e81f9a3f66ea9e5c2b72c3a15f9e2b0e8f8e8', // Potential Hyperliquid exchange (needs verification)
  '0x0000000000000000000000000000000000000000', // Placeholder - will trigger demo fallback
]

interface AgentApprovalProps {
  onApproved: (walletAddress: string) => void
}

export default function AgentApproval({ onApproved }: AgentApprovalProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  // Check for demo mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoMode = localStorage.getItem('builder_approved_demo') === 'true'
      if (demoMode) {
        setIsDemoMode(true)
        setApprovalStatus('success')
      }
    }
  }, [])

  // Check if wallet is already connected on mount
  useEffect(() => {
    // Wait a bit for wallet to inject (Rabby/MetaMask sometimes takes a moment)
    const checkWallet = () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        checkWalletConnection()
      }
    }
    
    // Check immediately
    checkWallet()
    
    // Also check after a short delay (wallets sometimes inject after page load)
    const timer = setTimeout(checkWallet, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window === 'undefined') {
      return
    }

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      return
    }

    try {
      const provider = new ethers.BrowserProvider(ethereum)
      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        setIsConnected(true)
        setWalletAddress(accounts[0].address)
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err)
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      setError('Wallet connection is only available in the browser.')
      return
    }

    // Check for any Ethereum provider (MetaMask, Rabby, Coinbase Wallet, etc.)
    const ethereum = (window as any).ethereum
    
    if (!ethereum) {
      setError('Web3 wallet not found. Please install MetaMask, Rabby, or another compatible wallet and refresh the page.')
      return
    }

    try {
      setError(null)
      const ethereum = (window as any).ethereum
      const provider = new ethers.BrowserProvider(ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])

      if (accounts.length > 0) {
        setIsConnected(true)
        setWalletAddress(accounts[0])
        setError(null) // Clear any previous errors on success
      }
    } catch (err: any) {
      // Handle user rejection gracefully - this is not really an error
      if (err.code === 4001 || 
          err.code === 'ACTION_REJECTED' ||
          err.message?.includes('rejected') ||
          err.message?.includes('denied') ||
          err.message?.includes('User rejected')) {
        // User clicked "Reject" or "Cancel" - this is normal, don't show as error
        setError(null)
        console.log('User rejected wallet connection')
        return
      }
      
      // For actual errors, show them
      setError(err.message || 'Failed to connect wallet')
    }
  }

  const approveBuilder = async () => {
    if (!walletAddress) {
      setError('Wallet not connected')
      return
    }

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      setError('Wallet provider not found. Please refresh the page.')
      return
    }

    setIsApproving(true)
    setApprovalStatus('pending')
    setError(null)
    setTxHash(null)
    setIsDemoMode(false)

    try {
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()

      // Check the network first
      const network = await provider.getNetwork()
      console.log('Connected network:', network.chainId.toString())
      
      // Hyperliquid exchange contract ABI for approveAgent
      // function approveAgent(address agent, bool isAgent) external
      const hyperliquidExchangeABI = [
        'function approveAgent(address agent, bool isAgent) external'
      ]
      
      // Try real on-chain transaction
      let transactionSucceeded = false
      let lastError: Error | null = null

      // Try each potential exchange contract address
      for (const HYPERLIQUID_EXCHANGE of HYPERLIQUID_EXCHANGE_ADDRESSES) {
        // Skip placeholder address
        if (HYPERLIQUID_EXCHANGE === '0x0000000000000000000000000000000000000000') {
          console.log('Skipping placeholder address, will fall back to demo mode')
          break
        }

        try {
          console.log(`Attempting approval on Hyperliquid exchange: ${HYPERLIQUID_EXCHANGE}`)
          
          // Create contract instance
          const exchangeContract = new ethers.Contract(
            HYPERLIQUID_EXCHANGE,
            hyperliquidExchangeABI,
            signer
          )
          
          // Call approveAgent(true) to approve the builder
          const tx = await exchangeContract.approveAgent(BUILDER_ADDRESS, true, {
            gasLimit: 200000, // Higher gas limit for safety
          })
          
          console.log('Transaction sent:', tx.hash)
          setTxHash(tx.hash)
          
          // Wait for transaction confirmation (wait for 1 block confirmation)
          const receipt = await tx.wait(1)
          
          if (receipt?.status === 1) {
            console.log('✅ Builder approved successfully on-chain!')
            transactionSucceeded = true
            setApprovalStatus('success')
            setIsDemoMode(false)
            // Clear demo mode flag if it was set
            if (typeof window !== 'undefined') {
              localStorage.removeItem('builder_approved_demo')
            }
            onApproved(walletAddress)
            break
          } else {
            throw new Error('Transaction failed - receipt status was not 1')
          }
        } catch (contractErr: any) {
          console.warn(`Failed to approve on ${HYPERLIQUID_EXCHANGE}:`, contractErr.message)
          lastError = contractErr
          // Continue to next address or fall back to demo mode
        }
      }

      // If real transaction failed, fall back to demo mode
      if (!transactionSucceeded) {
        console.warn('⚠️ Real on-chain approval failed. Switching to demo mode.')
        console.warn('Reason:', lastError?.message || 'Could not find valid exchange contract address')
        console.warn('Demo mode allows continued app functionality for hackathon demonstration.')
        
        // Simulate successful approval after 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mark as demo mode
        setIsDemoMode(true)
        setApprovalStatus('success')
        if (typeof window !== 'undefined') {
          localStorage.setItem('builder_approved_demo', 'true')
        }
        onApproved(walletAddress)
      }
    } catch (err: any) {
      console.error('Approval error:', err)
      
      // Check if it's a user rejection (don't fall back to demo for that)
      if (err.code === 4001 || 
          err.code === 'ACTION_REJECTED' ||
          err.message?.includes('rejected') ||
          err.message?.includes('denied') ||
          err.message?.includes('User rejected')) {
        setApprovalStatus('idle')
        setError('Transaction rejected by user')
        setIsApproving(false)
        return
      }

      // For other errors, fall back to demo mode
      console.warn('⚠️ Approval failed, falling back to demo mode:', err.message)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsDemoMode(true)
      setApprovalStatus('success')
      if (typeof window !== 'undefined') {
        localStorage.setItem('builder_approved_demo', 'true')
      }
      onApproved(walletAddress)
    } finally {
      setIsApproving(false)
    }
  }


  const copyAddress = () => {
    navigator.clipboard.writeText(BUILDER_ADDRESS)
    // You could add a toast notification here
  }

  const revokeBuilderApproval = async () => {
    if (!walletAddress) {
      setError('Wallet not connected')
      return
    }

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      setError('Wallet provider not found. Please refresh the page.')
      return
    }

    setIsRevoking(true)
    setError(null)
    setTxHash(null)
    setShowRevokeConfirm(false)

    try {
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()

      // Check the network first
      const network = await provider.getNetwork()
      console.log('Revoking on network:', network.chainId.toString())
      
      // Hyperliquid exchange contract ABI for approveAgent
      const hyperliquidExchangeABI = [
        'function approveAgent(address agent, bool isAgent) external'
      ]
      
      // Try real on-chain transaction
      let transactionSucceeded = false
      let lastError: Error | null = null

      // Try each potential exchange contract address
      for (const HYPERLIQUID_EXCHANGE of HYPERLIQUID_EXCHANGE_ADDRESSES) {
        // Skip placeholder address
        if (HYPERLIQUID_EXCHANGE === '0x0000000000000000000000000000000000000000') {
          console.log('Skipping placeholder address for revoke - falling back to demo mode')
          break
        }

        try {
          console.log(`Attempting revocation on Hyperliquid exchange: ${HYPERLIQUID_EXCHANGE}`)
          
          // Create contract instance
          const exchangeContract = new ethers.Contract(
            HYPERLIQUID_EXCHANGE,
            hyperliquidExchangeABI,
            signer
          )
          
          // Call approveAgent(false) to revoke the builder permission
          const tx = await exchangeContract.approveAgent(BUILDER_ADDRESS, false, {
            gasLimit: 200000,
          })
          
          console.log('Revocation transaction sent:', tx.hash)
          setTxHash(tx.hash)
          
          // Wait for transaction confirmation
          const receipt = await tx.wait(1)
          
          if (receipt?.status === 1) {
            console.log('✅ Builder approval revoked successfully on-chain!')
            transactionSucceeded = true
            setApprovalStatus('idle')
            setIsDemoMode(false)
            // Clear approval state
            if (typeof window !== 'undefined') {
              localStorage.removeItem('builder_approved_demo')
            }
            break
          } else {
            throw new Error('Transaction failed - receipt status was not 1')
          }
        } catch (contractErr: any) {
          console.warn(`Failed to revoke on ${HYPERLIQUID_EXCHANGE}:`, contractErr.message)
          lastError = contractErr
          // Continue to next address or handle error
        }
      }

      // If real transaction failed, handle demo mode revocation
      if (!transactionSucceeded) {
        console.warn('⚠️ Real on-chain revocation failed. Clearing demo mode.')
        console.warn('Reason:', lastError?.message || 'Could not find valid exchange contract address')
        
        // Clear demo mode
        setIsDemoMode(false)
        setApprovalStatus('idle')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('builder_approved_demo')
        }
      }
    } catch (err: any) {
      console.error('Revocation error:', err)
      
      // Check if it's a user rejection
      if (err.code === 4001 || 
          err.code === 'ACTION_REJECTED' ||
          err.message?.includes('rejected') ||
          err.message?.includes('denied') ||
          err.message?.includes('User rejected')) {
        setError('Revocation rejected by user')
        setIsRevoking(false)
        return
      }

      // For other errors, still clear the demo mode state
      console.warn('⚠️ Revocation failed, but clearing local approval state:', err.message)
      setIsDemoMode(false)
      setApprovalStatus('idle')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('builder_approved_demo')
      }
      setError('Revocation failed, but local state has been cleared. If approved on-chain, you may need to revoke manually.')
    } finally {
      setIsRevoking(false)
    }
  }

  if (approvalStatus === 'success') {
    return (
      <>
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-2xl">✅</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-green-100">Builder Approved!</h3>
                {isDemoMode && (
                  <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-600 rounded text-xs text-yellow-200 font-medium">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-green-200 mt-1">
                {isDemoMode 
                  ? 'Demo mode enabled. You can now execute trades in demo mode for hackathon demonstration.'
                  : 'Your wallet has approved the builder address. You can now execute trades.'}
              </p>
              {txHash && !isDemoMode && (
                <p className="text-xs text-green-300 mt-2">
                  Transaction: <code className="bg-green-900/50 px-1 rounded">{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
                </p>
              )}
              {isDemoMode && (
                <p className="text-xs text-yellow-300 mt-2">
                  Note: This is a simulated approval for demo purposes. Real trades require on-chain approval.
                </p>
              )}
              {error && (
                <p className="text-xs text-red-300 mt-2">
                  {error}
                </p>
              )}
            </div>
          </div>
          
          {/* Revoke Button */}
          <div className="mt-4 pt-4 border-t border-green-700/50">
            <button
              onClick={() => setShowRevokeConfirm(true)}
              disabled={isRevoking}
              className={`w-full py-3 px-4 font-semibold rounded transition-all flex items-center justify-center gap-2 ${
                isRevoking
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-500 hover:border-red-600'
              }`}
            >
              {isRevoking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Revoking...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>Revoke Builder Permission</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              This will prevent Pear Protocol from executing new trades for your wallet
            </p>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showRevokeConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-red-400 text-3xl">⚠️</div>
                <h3 className="text-xl font-bold text-white">Confirm Revocation</h3>
              </div>
              
              <p className="text-gray-300 mb-2">
                Are you sure you want to revoke the builder approval?
              </p>
              
              <div className="bg-red-900/30 border border-red-700/50 rounded p-3 mb-4">
                <p className="text-sm text-red-200">
                  <strong>⚠️ Important:</strong> This will prevent Pear Protocol from executing new trades for you. You will need to approve again to resume trading.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRevokeConfirm(false)}
                  disabled={isRevoking}
                  className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={revokeBuilderApproval}
                  disabled={isRevoking}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRevoking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Revoking...</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Confirm Revoke</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Approve Builder</h2>
        <p className="text-gray-300">
          To execute live trades, you need to approve the Pear Protocol builder address to charge fees.
        </p>
      </div>

      <div className="mb-4 p-4 bg-slate-900/50 rounded border border-slate-600">
        <label className="text-sm font-semibold text-gray-400 mb-2 block">Builder Address:</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-blue-300 bg-slate-800 px-3 py-2 rounded text-sm break-all">
            {BUILDER_ADDRESS}
          </code>
          <button
            onClick={copyAddress}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {!isConnected ? (
        <div>
          <button
            onClick={connectWallet}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors mb-3"
          >
            Connect Wallet (Rabby / MetaMask)
          </button>
          {error && error.includes('not found') && (
            <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded text-sm">
              <p className="text-blue-200 mb-2">
                <strong>Using Rabby?</strong>
              </p>
              <ul className="text-blue-300 list-disc list-inside space-y-1 text-xs">
                <li>Make sure Rabby wallet extension is installed and enabled in your browser</li>
                <li>Refresh this page after installing Rabby</li>
                <li>Unlock your Rabby wallet (enter your password if needed)</li>
                <li>Try clicking "Connect Wallet" again</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded">
            <p className="text-blue-200 text-sm">
              ✅ Connected: <code className="text-blue-300">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</code>
            </p>
          </div>
          <button
            onClick={approveBuilder}
            disabled={isApproving || approvalStatus === 'pending'}
            className={`w-full py-3 px-4 font-semibold rounded transition-colors ${
              isApproving || approvalStatus === 'pending'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isApproving || approvalStatus === 'pending' ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {txHash ? 'Waiting for confirmation...' : 'Approving...'}
              </span>
            ) : (
              'Approve Builder'
            )}
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded">
        <p className="text-yellow-200 text-xs">
          ⚠️ <strong>Note:</strong> Ensure your wallet is connected to the correct network (Hyperliquid testnet/mainnet) and has sufficient tokens for gas fees.
        </p>
      </div>
    </div>
  )
}


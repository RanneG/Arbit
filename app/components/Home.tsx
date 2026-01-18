'use client'

import { useState } from 'react'
import WalletConnect from './WalletConnect'
import './styles/Home.css'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isDispersing, setIsDispersing] = useState(false)

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address || null)
  }

  const handleLogoClick = () => {
    setIsDispersing(true)
    // Reset animation after it completes
    setTimeout(() => {
      setIsDispersing(false)
    }, 1500) // Match animation duration
  }


  return (
    <div className="home-screen">
      <div className="home-content">
        {/* Logo Section */}
        <div className="logo-container">
          <div 
            className={`cards-container ${isDispersing ? 'dispersing' : ''}`}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            {/* Back Card */}
            <div className={`trading-card card-back ${isDispersing ? 'disperse-back' : ''}`}>
              <div className="bitcoin-symbol">₿</div>
            </div>
            {/* Middle Card */}
            <div className={`trading-card card-middle ${isDispersing ? 'disperse-middle' : ''}`}></div>
            {/* Front Card with A */}
            <div className={`trading-card card-front ${isDispersing ? 'disperse-front' : ''}`}>
              <div className="logo-letter">A</div>
            </div>
          </div>
          <h1 className="logo-text" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>ARBIT</h1>
          <p className="tagline">Trading Cards</p>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to ARBIT</h2>
          <p className="welcome-text">
            Collect, trade, and master trading card strategies. Learn crypto trading concepts while building your ultimate collection.
          </p>
        </div>

        {/* Wallet Connection Section - Centered */}
        <div className="wallet-connect-section">
          <WalletConnect onConnected={handleWalletConnected} />
        </div>
      </div>
    </div>
  )
}

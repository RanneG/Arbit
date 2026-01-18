'use client'

/**
 * Trade Confirmation Page
 * Displays trade execution results and order details
 */

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import './confirmation.css'

function TradeConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [notional, setNotional] = useState<string | null>(null)
  const [pair, setPair] = useState<string | null>(null)

  useEffect(() => {
    const oid = searchParams.get('orderId')
    const not = searchParams.get('notional')
    const p = searchParams.get('pair')

    setOrderId(oid)
    setNotional(not)
    setPair(p)

    if (!oid) {
      router.push('/trade')
    }
  }, [searchParams, router])

  if (!orderId) {
    return (
      <div className="confirmation-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className="success-icon">✓</div>
          <h1>Trade Executed Successfully</h1>
        </div>

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value">{orderId}</span>
          </div>

          {pair && (
            <div className="detail-row">
              <span className="detail-label">Pair:</span>
              <span className="detail-value">{pair}</span>
            </div>
          )}

          {notional && (
            <div className="detail-row">
              <span className="detail-label">Notional Value:</span>
              <span className="detail-value">${parseFloat(notional).toFixed(2)}</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-success">Confirmed</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link href="/trade" className="action-button primary">
            New Trade
          </Link>
          <Link href="/portfolio" className="action-button secondary">
            View Portfolio
          </Link>
        </div>

        <div className="confirmation-note">
          <p>
            Your trade has been submitted to the Pear Protocol. 
            The order will be processed shortly and will appear in your portfolio.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TradeConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="confirmation-container">
        <p>Loading...</p>
      </div>
    }>
      <TradeConfirmationContent />
    </Suspense>
  )
}

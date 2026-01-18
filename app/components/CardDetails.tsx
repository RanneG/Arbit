'use client'

import { useRouter } from 'next/navigation'
import Card from './Card'
import { Card as CardType } from '@/types/Card'
import './styles/CardDetails.css'

interface CardDetailsProps {
  card: CardType
}

export default function CardDetails({ card }: CardDetailsProps) {
  const router = useRouter()


  return (
    <div className="screen-container details-screen">
      <button className="back-button" onClick={() => router.back()}>
        ← Back
      </button>

      <div className="card-display">
        <Card card={card} size="large" />
      </div>
    </div>
  )
}

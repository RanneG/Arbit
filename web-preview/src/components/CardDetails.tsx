import React from 'react';
import Card from './Card';
import { Card as CardType, Rarity } from '../types/Card';
import './CardDetails.css';

interface CardDetailsProps {
  card: CardType;
  onBack: () => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ card, onBack }) => {
  const getRarityColors = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 'linear-gradient(135deg, #FFD700, #FF8C00)';
      case Rarity.EPIC:
        return 'linear-gradient(135deg, #9B59B6, #8E44AD)';
      case Rarity.RARE:
        return 'linear-gradient(135deg, #3498DB, #2980B9)';
      case Rarity.UNCOMMON:
        return 'linear-gradient(135deg, #2ECC71, #27AE60)';
      case Rarity.COMMON:
        return 'linear-gradient(135deg, #95A5A6, #7F8C8D)';
      default:
        return 'linear-gradient(135deg, #34495E, #2C3E50)';
    }
  };

  return (
    <div className="screen-container details-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card-display">
        <Card card={card} size="large" />
      </div>

      <div className="action-container">
        <button
          className="action-button"
          style={{ background: getRarityColors(card.rarity) }}
          onClick={() => {
            // TODO: Implement trade functionality with backend
            alert('Trading functionality will be connected to backend!');
          }}
        >
          Trade Card
        </button>
      </div>
    </div>
  );
};

export default CardDetails;

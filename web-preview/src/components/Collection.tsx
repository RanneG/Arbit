import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Card as CardType, UserCollection } from '../types/Card';
import { mockCards } from '../data/mockCards';
import './Collection.css';

interface CollectionProps {
  onCardPress: (card: CardType) => void;
  onNavigateToGallery: () => void;
}

const Collection: React.FC<CollectionProps> = ({ onCardPress, onNavigateToGallery }) => {
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyWalletAddress = async () => {
    if (collection) {
      try {
        await navigator.clipboard.writeText(collection.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const walletAddress = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockCollection: UserCollection = {
        walletAddress,
        cards: mockCards.slice(0, 6),
        totalCards: 6,
        totalValue: mockCards.slice(0, 6).reduce((sum, card) => sum + (card.marketValue || 0), 0),
      };
      setCollection(mockCollection);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="screen-container">
        <div className="loading-container">
          <p className="loading-text">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection || collection.cards.length === 0) {
    return (
      <div className="screen-container">
        <div className="empty-container">
          <h2 className="empty-title">No Cards Yet</h2>
          <p className="empty-text">
            Start collecting space-themed cards to build your collection!
          </p>
          <button className="browse-button" onClick={onNavigateToGallery}>
            Browse Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="header">
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-label">Total Cards</div>
            <div className="stat-value">{collection.totalCards}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Collection Value</div>
            <div className="stat-value">${collection.totalValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="wallet-container">
          <div className="wallet-label">Wallet</div>
          <div className="wallet-address-container">
            <div className="wallet-address">
              {collection.walletAddress.slice(0, 6)}...{collection.walletAddress.slice(-4)}
            </div>
            <button className="copy-button" onClick={copyWalletAddress}>
              <span className="copy-icon">{copied ? '✓' : '📋'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {collection.cards.map((card) => (
          <Card key={card.id} card={card} onPress={() => onCardPress(card)} size="small" />
        ))}
      </div>
    </div>
  );
};

export default Collection;

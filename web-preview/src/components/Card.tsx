import React, { useState, useEffect } from 'react';
import { Card as CardType, Rarity } from '../types/Card';
import './Card.css';

interface CardProps {
  card: CardType;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ card, onPress, size = 'medium' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(card.imageUrl || null);
  
  // Reset image error when card changes
  useEffect(() => {
    setImageError(false);
    setImageSrc(card.imageUrl || null);
  }, [card.imageUrl]);
  const getRarityColors = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 'linear-gradient(135deg, #FFD700, #FF8C00, #FF4500)';
      case Rarity.EPIC:
        return 'linear-gradient(135deg, #9B59B6, #8E44AD, #6C3483)';
      case Rarity.RARE:
        return 'linear-gradient(135deg, #3498DB, #2980B9, #1F618D)';
      case Rarity.UNCOMMON:
        return 'linear-gradient(135deg, #2ECC71, #27AE60, #1E8449)';
      case Rarity.COMMON:
        return 'linear-gradient(135deg, #95A5A6, #7F8C8D, #566573)';
      default:
        return 'linear-gradient(135deg, #34495E, #2C3E50, #1A252F)';
    }
  };

  const getRarityEmoji = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return '👑'; // Crown for legendary
      case Rarity.EPIC:
        return '💜'; // Purple heart for epic
      case Rarity.RARE:
        return '💎'; // Diamond for rare
      case Rarity.UNCOMMON:
        return '✨'; // Sparkles for uncommon
      case Rarity.COMMON:
        return '⭐'; // Star for common
      default:
        return '⚪'; // White circle as fallback
    }
  };

  const getRarityLabel = (rarity: Rarity): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const getRarityNumber = (rarity: Rarity): number => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 5;
      case Rarity.EPIC:
        return 4;
      case Rarity.RARE:
        return 3;
      case Rarity.UNCOMMON:
        return 2;
      case Rarity.COMMON:
        return 1;
      default:
        return 0;
    }
  };

  const getSizeMultiplier = (): number => {
    switch (size) {
      case 'small':
        return 0.6;
      case 'large':
        return 1.8;
      default:
        return 1;
    }
  };

  const sizeMultiplier = getSizeMultiplier();
  const gradientStyle = {
    background: getRarityColors(card.rarity),
  };

  const cardStyle = {
    width: `${280 * sizeMultiplier}px`,
    height: `${392 * sizeMultiplier}px`,
    transition: 'all 0.3s ease',
  };

  const CardContent = (
    <div className="card-container" style={cardStyle}>
      <div className="card-gradient" style={gradientStyle}>
        <div className="card-border-glow"></div>
        <div className="card-content">
          <div className="rarity-badge">
            <span className="rarity-emoji">{getRarityEmoji(card.rarity)}</span>
            <span className="rarity-text">{getRarityLabel(card.rarity)}</span>
            <span className="rarity-number">#{getRarityNumber(card.rarity)}</span>
          </div>

          <div className="image-container">
            {card.imageUrl ? (
              <img 
                src={imageSrc || card.imageUrl} 
                alt={card.name} 
                className="card-image"
                style={{ display: imageError ? 'none' : 'block' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const currentSrc = img.src;
                  
                  // Try PNG if JPG fails
                  if (currentSrc.includes('.jpg') && !currentSrc.includes('.png')) {
                    const pngUrl = currentSrc.replace('.jpg', '.png');
                    setImageSrc(pngUrl);
                    return;
                  }
                  
                  setImageError(true);
                }}
                onLoad={() => {
                  setImageError(false);
                }}
              />
            ) : null}
            <div className="placeholder-image" style={{ display: (!card.imageUrl || imageError) ? 'flex' : 'none' }}>
              <span className="placeholder-name">{card.name}</span>
              <span className="placeholder-subtitle">Image Coming Soon</span>
            </div>
            <div className="image-overlay"></div>
          </div>

          <div className="card-info">
            <div className="card-name">{card.name}</div>
            <div className="card-title">{card.title}</div>

            {/* Description - Show in preview, larger in detail view */}
            {card.description && (
              <div className={`description-container ${size === 'large' ? 'large-description' : 'preview-description'}`}>
                <p className={`description-text ${size === 'large' ? 'large-description-text' : ''}`}>{card.description}</p>
              </div>
            )}

            {/* Stats - Only show in large/detail view */}
            {size === 'large' && (
              <div className={`stats-container large-stats`}>
                {/* Top Row: Buy Up and Sell Down */}
                <div className="stat-row" title="Buy Up: Profit when prices rise">
                  <span className="stat-label large-stat-label">📈 Buy Up</span>
                  <span className="stat-value large-stat-value">{card.stats.longPosition}</span>
                </div>
                <div className="stat-row" title="Sell Down: Profit when prices fall">
                  <span className="stat-label large-stat-label">📉 Sell Down</span>
                  <span className="stat-value large-stat-value">{card.stats.shortPosition}</span>
                </div>
                {/* Bottom Row: Risk Power and Market Smarts */}
                <div className="stat-row" title="Risk Power: How much you can control with your money">
                  <span className="stat-label large-stat-label">⚖️ Risk Power</span>
                  <span className="stat-value large-stat-value">{card.stats.leverage}</span>
                </div>
                <div className="stat-row" title="Market Smarts: Understanding market trends">
                  <span className="stat-label large-stat-label">🧠 Market Smarts</span>
                  <span className="stat-value large-stat-value">{card.stats.marketIQ}</span>
                </div>
              </div>
            )}

            <div className={`faction-badge ${size === 'large' ? 'large-faction' : ''}`}>
              {card.faction.charAt(0).toUpperCase() + card.faction.slice(1)}
            </div>
          </div>
        </div>

        <div className="stars-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (onPress) {
    return (
      <div className="card-wrapper clickable" onClick={onPress}>
        {CardContent}
      </div>
    );
  }

  return <div className="card-wrapper">{CardContent}</div>;
};

export default Card;

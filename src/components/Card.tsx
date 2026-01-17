import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card as CardType, Rarity } from '../types/Card';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface CardProps {
  card: CardType;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ card, onPress, size = 'medium' }) => {
  const getRarityColors = (rarity: Rarity): string[] => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return ['#FFD700', '#FF8C00', '#FF4500'];
      case Rarity.EPIC:
        return ['#9B59B6', '#8E44AD', '#6C3483'];
      case Rarity.RARE:
        return ['#3498DB', '#2980B9', '#1F618D'];
      case Rarity.UNCOMMON:
        return ['#2ECC71', '#27AE60', '#1E8449'];
      case Rarity.COMMON:
        return ['#95A5A6', '#7F8C8D', '#566573'];
      default:
        return ['#34495E', '#2C3E50', '#1A252F'];
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
  const cardWidth = CARD_WIDTH * sizeMultiplier;
  const cardHeight = CARD_HEIGHT * sizeMultiplier;
  const gradientColors = getRarityColors(card.rarity);

  const CardContent = (
    <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Card Border Glow */}
        <View style={styles.borderGlow} />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Rarity Badge */}
          <View style={styles.rarityBadge}>
            <Text style={[
              styles.rarityEmoji,
              size === 'large' && styles.largeRarityEmoji
            ]}>{getRarityEmoji(card.rarity)}</Text>
            <Text style={[
              styles.rarityText,
              size === 'large' && styles.largeRarityText
            ]}>{getRarityLabel(card.rarity)}</Text>
            <Text style={styles.rarityNumber}>#{getRarityNumber(card.rarity)}</Text>
          </View>

          {/* Card Image */}
          <View style={[
            styles.imageContainer,
            size === 'large' && styles.largeImageContainer
          ]}>
            {card.imageUrl && (card.imageUrl.startsWith('http') || card.imageUrl.startsWith('https')) ? (
              <Image
                source={{ uri: card.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{card.name}</Text>
                <Text style={styles.placeholderSubtext}>Image Coming Soon</Text>
              </View>
            )}
            {/* Image Overlay Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={[
                styles.imageOverlay,
                size === 'large' && styles.largeImageOverlay
              ]}
            />
          </View>

          {/* Card Info */}
          <View style={[
            styles.cardInfo,
            size === 'large' && styles.largeCardInfo
          ]}>
            <Text style={[
              styles.cardName,
              size === 'large' && styles.largeCardName
            ]} numberOfLines={1}>
              {card.name}
            </Text>
            <Text style={[
              styles.cardTitle,
              size === 'large' && styles.largeCardTitle
            ]} numberOfLines={1}>
              {card.title}
            </Text>

            {/* Description - Show in preview, larger in detail view */}
            {card.description && (
              <View style={[
                styles.descriptionContainer,
                size === 'large' && styles.largeDescriptionContainer
              ]}>
                <Text style={[
                  styles.descriptionText,
                  size === 'large' && styles.largeDescriptionText
                ]} numberOfLines={size === 'large' ? undefined : 2}>
                  {card.description}
                </Text>
              </View>
            )}

            {/* Stats - Only show in large/detail view */}
            {size === 'large' && (
              <View style={[
                styles.statsContainer,
                styles.largeStatsContainer
              ]}>
                {/* Top Row: Buy Up and Sell Down */}
                <View style={[styles.statRow, styles.largeStatRow]}>
                  <Text style={styles.largeStatLabel}>📈 Buy Up</Text>
                  <Text style={styles.largeStatValue}>{card.stats.longPosition}</Text>
                </View>
                <View style={[styles.statRow, styles.largeStatRow]}>
                  <Text style={styles.largeStatLabel}>📉 Sell Down</Text>
                  <Text style={styles.largeStatValue}>{card.stats.shortPosition}</Text>
                </View>
                {/* Bottom Row: Risk Power and Market Smarts */}
                <View style={[styles.statRow, styles.largeStatRow]}>
                  <Text style={styles.largeStatLabel}>⚖️ Risk Power</Text>
                  <Text style={styles.largeStatValue}>{card.stats.leverage}</Text>
                </View>
                <View style={[styles.statRow, styles.largeStatRow]}>
                  <Text style={styles.largeStatLabel}>🧠 Market Smarts</Text>
                  <Text style={styles.largeStatValue}>{card.stats.marketIQ}</Text>
                </View>
              </View>
            )}

            {/* Faction Badge */}
            <View style={[
              styles.factionBadge,
              size === 'large' && styles.largeFactionBadge
            ]}>
              <Text style={[
                styles.factionText,
                size === 'large' && styles.largeFactionText
              ]}>
                {card.faction.charAt(0).toUpperCase() + card.faction.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stars decoration */}
        <View style={styles.starsContainer}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  // Large card adjustments
  largeCard: {
    // Image container gets more space in large cards
  },
  gradient: {
    flex: 1,
    padding: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  largeRarityEmoji: {
    fontSize: 18,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  largeRarityText: {
    fontSize: 18,
  },
  rarityNumber: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  imageContainer: {
    height: '55%',
    width: '100%',
    position: 'relative',
  },
  largeImageContainer: {
    height: '52%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  largeImageOverlay: {
    height: '25%',
  },
  cardInfo: {
    flex: 1,
    padding: 8,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    maxWidth: '100%',
    width: '100%',
  },
  largeCardInfo: {
    padding: 14,
    paddingHorizontal: 26,
    maxWidth: '100%',
    marginHorizontal: 0,
    width: '100%',
    boxSizing: 'border-box',
  },
  cardName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    paddingHorizontal: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  largeCardName: {
    fontSize: 20,
    paddingLeft: 19, // 0.5cm ≈ 19px
  },
  cardTitle: {
    color: '#aaa',
    fontSize: 8,
    marginBottom: 3,
    fontStyle: 'italic',
    paddingHorizontal: 0,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  largeCardTitle: {
    fontSize: 15,
    paddingLeft: 19, // Same position as heading 1 (0.5cm ≈ 19px)
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 2,
    width: '100%',
    gap: 1,
    maxWidth: '100%',
  },
  largeStatsContainer: {
    marginVertical: 6,
    gap: 6,
    paddingHorizontal: 2,
    maxWidth: '90%',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  statRow: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 16,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  largeStatRow: {
    width: '100%',
    minWidth: 'auto',
    maxWidth: '100%',
    marginBottom: 8,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 6,
    fontWeight: '500',
    flexShrink: 1,
    flex: 1,
    maxWidth: '60%',
    paddingRight: 2,
  },
  largeStatLabel: {
    fontSize: 11,
    maxWidth: '65%',
    paddingRight: 3,
  },
  statValue: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
    minWidth: 16,
    textAlign: 'right',
    flexShrink: 0,
    paddingLeft: 2,
  },
  largeStatValue: {
    fontSize: 12,
    minWidth: 24,
    paddingLeft: 3,
  },
  descriptionContainer: {
    marginTop: 3,
    marginBottom: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  largeDescriptionContainer: {
    marginTop: 6,
    marginBottom: 5,
    paddingVertical: 6,
    paddingHorizontal: 18,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'center',
  },
  descriptionText: {
    color: '#ccc',
    fontSize: 8,
    lineHeight: 11,
    textAlign: 'left',
    paddingHorizontal: 0,
  },
  largeDescriptionText: {
    fontSize: 15,
    lineHeight: 19,
    textAlign: 'left',
  },
  factionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  largeFactionBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginTop: 6,
    marginLeft: 19, // 0.5cm ≈ 19px
  },
  factionText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  largeFactionText: {
    fontSize: 12,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});

export default Card;

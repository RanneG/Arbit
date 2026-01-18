import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../components/Card';
import { Card as CardType, Rarity } from '../types/Card';

const { width } = Dimensions.get('window');

const CardDetailsScreen: React.FC = ({ route, navigation }: any) => {
  const { card }: { card: CardType } = route.params;

  const getRarityColors = (rarity: Rarity): string[] => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return ['#FFD700', '#FF8C00'];
      case Rarity.EPIC:
        return ['#9B59B6', '#8E44AD'];
      case Rarity.RARE:
        return ['#3498DB', '#2980B9'];
      case Rarity.UNCOMMON:
        return ['#2ECC71', '#27AE60'];
      case Rarity.COMMON:
        return ['#95A5A6', '#7F8C8D'];
      default:
        return ['#34495E', '#2C3E50'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Display */}
          <View style={styles.cardDisplay}>
            <Card card={card} size="large" />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Implement trade functionality
              // TODO: Implement trade functionality with backend
            }}
          >
            <LinearGradient
              colors={getRarityColors(card.rarity)}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Trade Card</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  tradingInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tradingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tradingLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  tradingValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  metadata: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  metadataValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CardDetailsScreen;

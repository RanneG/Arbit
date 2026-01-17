import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../components/Card';
import { Card as CardType, UserCollection } from '../types/Card';
import { cardApi } from '../services/api';
import { mockCards } from '../data/mockCards';

const CollectionScreen: React.FC = ({ navigation }: any) => {
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyWalletAddress = () => {
    if (collection) {
      Clipboard.setString(collection.walletAddress);
      setCopied(true);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // TODO: Replace with actual wallet address from wallet connection
  const walletAddress = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const data = await cardApi.getUserCollection(walletAddress);
      // setCollection(data);
      
      // Mock data for now
      const mockCollection: UserCollection = {
        walletAddress,
        cards: mockCards.slice(0, 6), // User owns first 6 cards
        totalCards: 6,
        totalValue: mockCards.slice(0, 6).reduce((sum, card) => sum + (card.marketValue || 0), 0),
      };
      setCollection(mockCollection);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (card: CardType) => {
    navigation.navigate('CardDetails', { card });
  };

  const renderCard = ({ item }: { item: CardType }) => (
    <View style={styles.cardWrapper}>
      <Card card={item} onPress={() => handleCardPress(item)} size="small" />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e', '#16213e']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading collection...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!collection || collection.cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e', '#16213e']}
          style={styles.gradient}
        >
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Cards Yet</Text>
            <Text style={styles.emptyText}>
              Start collecting space-themed cards to build your collection!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Gallery')}
            >
              <Text style={styles.browseButtonText}>Browse Cards</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Header Stats */}
        <View style={styles.header}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Cards</Text>
              <Text style={styles.statValue}>{collection.totalCards}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Collection Value</Text>
              <Text style={styles.statValue}>
                ${collection.totalValue.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.walletContainer}>
            <Text style={styles.walletLabel}>Wallet</Text>
            <View style={styles.walletAddressContainer}>
              <Text style={styles.walletAddress} numberOfLines={1}>
                {collection.walletAddress.slice(0, 6)}...
                {collection.walletAddress.slice(-4)}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyWalletAddress}
                activeOpacity={0.7}
              >
                <Text style={styles.copyIcon}>{copied ? '✓' : '📋'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cards Grid */}
        <FlatList
          data={collection.cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 4,
  },
  walletContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletAddress: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  copyIcon: {
    fontSize: 16,
  },
  listContent: {
    padding: 10,
    paddingBottom: 100, // Extra padding for tab bar
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CollectionScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../components/Card';
import { Card as CardType, Rarity, Faction } from '../types/Card';
import { mockCards } from '../data/mockCards';
import { cardApi } from '../services/api';

const CardGalleryScreen: React.FC = ({ navigation }: any) => {
  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [filteredCards, setFilteredCards] = useState<CardType[]>(mockCards);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call when backend is ready
    // loadCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [selectedRarity, selectedFaction, searchQuery, cards]);

  const loadCards = async () => {
    try {
      const data = await cardApi.getAllCards();
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
      // Fallback to mock data
      setCards(mockCards);
    }
  };

  const filterCards = () => {
    let filtered = [...cards];

    if (selectedRarity) {
      filtered = filtered.filter((card) => card.rarity === selectedRarity);
    }

    if (selectedFaction) {
      filtered = filtered.filter((card) => card.faction === selectedFaction);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCards(filtered);
  };

  const handleCardPress = (card: CardType) => {
    navigation.navigate('CardDetails', { card });
  };

  const renderCard = ({ item }: { item: CardType }) => (
    <View style={styles.cardWrapper}>
      <Card card={item} onPress={() => handleCardPress(item)} size="small" />
    </View>
  );

  const renderRarityFilter = (rarity: Rarity) => {
    const isSelected = selectedRarity === rarity;
    return (
      <TouchableOpacity
        key={rarity}
        style={[styles.filterButton, isSelected && styles.filterButtonActive]}
        onPress={() => setSelectedRarity(isSelected ? null : rarity)}
      >
        <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFactionFilter = (faction: Faction) => {
    const isSelected = selectedFaction === faction;
    return (
      <TouchableOpacity
        key={faction}
        style={[styles.filterButton, isSelected && styles.filterButtonActive]}
        onPress={() => setSelectedFaction(isSelected ? null : faction)}
      >
        <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
          {faction.charAt(0).toUpperCase() + faction.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Card Gallery</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Rarity:</Text>
            <View style={styles.filterRow}>
              {Object.values(Rarity).map(renderRarityFilter)}
            </View>
          </View>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Faction:</Text>
            <View style={styles.filterRow}>
              {Object.values(Faction).map(renderFactionFilter)}
            </View>
          </View>
        </View>

        {/* Cards Grid */}
        <FlatList
          data={filteredCards}
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
  filterText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
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
});

export default CardGalleryScreen;

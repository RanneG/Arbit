'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from './Card'
import { Card as CardType, Rarity, Faction } from '@/types/Card'
import { mockCards } from '@/lib/mockCards'
import './styles/CardGallery.css'

export default function CardGallery() {
  const router = useRouter()
  const [cards] = useState<CardType[]>(mockCards)
  const [filteredCards, setFilteredCards] = useState<CardType[]>(mockCards)
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null)
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)

  useEffect(() => {
    filterCards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRarity, selectedFaction, searchQuery])

  const filterCards = () => {
    let filtered = [...cards]

    if (selectedRarity) {
      filtered = filtered.filter((card) => card.rarity === selectedRarity)
    }

    if (selectedFaction) {
      filtered = filtered.filter((card) => card.faction === selectedFaction)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCards(filtered)
  }

  const handleCardPress = (card: CardType) => {
    router.push(`/card/${card.id}`)
  }

  const renderRarityFilter = (rarity: Rarity) => {
    const isSelected = selectedRarity === rarity
    return (
      <button
        key={rarity}
        className={`filter-button ${isSelected ? 'active' : ''}`}
        onClick={() => setSelectedRarity(isSelected ? null : rarity)}
      >
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
      </button>
    )
  }

  const renderFactionFilter = (faction: Faction) => {
    const isSelected = selectedFaction === faction
    return (
      <button
        key={faction}
        className={`filter-button ${isSelected ? 'active' : ''}`}
        onClick={() => setSelectedFaction(isSelected ? null : faction)}
      >
        {faction.charAt(0).toUpperCase() + faction.slice(1)}
      </button>
    )
  }

  return (
    <div className="screen-container">
      <div className="header">
        <div className="header-title-container">
          <h1 className="header-title">Card Gallery</h1>
          <div className="info-button-container">
            <button
              className="info-button"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              aria-label="Information about card gallery"
            >
              <span className="info-icon">i</span>
            </button>
            {showInfoTooltip && (
              <div className="info-tooltip">
                These are the possible cards obtainable in the game.
              </div>
            )}
          </div>
        </div>
        <p className="header-subtitle">
          {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filters-container">
        <div className="filter-section">
          <label className="filter-label">Rarity:</label>
          <div className="filter-row">
            {Object.values(Rarity).map(renderRarityFilter)}
          </div>
        </div>
        <div className="filter-section">
          <label className="filter-label">Faction:</label>
          <div className="filter-row">
            {Object.values(Faction).map(renderFactionFilter)}
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {filteredCards.map((card) => (
          <Card key={card.id} card={card} onPress={() => handleCardPress(card)} size="small" />
        ))}
      </div>
    </div>
  )
}

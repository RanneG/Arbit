import React, { useState } from 'react';
import Home from './components/Home';
import CardGallery from './components/CardGallery';
import CardDetails from './components/CardDetails';
import Collection from './components/Collection';
import Help from './components/Help';
import { Card } from './types/Card';
import { mockCards } from './data/mockCards';
import './App.css';

type Screen = 'home' | 'gallery' | 'collection' | 'details' | 'help';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Handle browser back/forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') setCurrentScreen('home');
      else if (path === '/gallery') setCurrentScreen('gallery');
      else if (path === '/collection') setCurrentScreen('collection');
      else if (path === '/help') setCurrentScreen('help');
      else if (path.startsWith('/card/')) {
        const cardId = path.split('/card/')[1];
        const card = mockCards.find(c => c.id === cardId);
        if (card) {
          setSelectedCard(card);
          setCurrentScreen('details');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial load

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToScreen = (screen: Screen, card?: Card) => {
    setCurrentScreen(screen);
    if (card) {
      setSelectedCard(card);
      // Update URL for card details
      window.history.pushState({}, '', `/card/${card.id}`);
    } else {
      // Update URL for other screens
      const path = screen === 'home' ? '/' : `/${screen}`;
      window.history.pushState({}, '', path);
    }
  };

  const handleCardPress = (card: Card) => {
    navigateToScreen('details', card);
  };

  const handleBack = () => {
    navigateToScreen('gallery');
    setSelectedCard(null);
  };

  return (
    <div className="app">
      {currentScreen === 'home' && (
        <Home 
          onNavigateToGallery={() => navigateToScreen('gallery')} 
          onNavigateToCollection={() => navigateToScreen('collection')}
          onNavigateToHelp={() => navigateToScreen('help')}
        />
      )}
      {currentScreen === 'gallery' && (
        <CardGallery 
          onCardPress={handleCardPress} 
          onNavigateToCollection={() => navigateToScreen('collection')} 
        />
      )}
      {currentScreen === 'collection' && (
        <Collection 
          onCardPress={handleCardPress} 
          onNavigateToGallery={() => navigateToScreen('gallery')} 
        />
      )}
      {currentScreen === 'details' && selectedCard && (
        <CardDetails card={selectedCard} onBack={handleBack} />
      )}
      {currentScreen === 'help' && (
        <Help />
      )}
      
      {/* Bottom Navigation */}
      {currentScreen !== 'details' && (
        <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
          <button
            className={`nav-button ${currentScreen === 'home' ? 'active' : ''}`}
            onClick={() => navigateToScreen('home')}
            aria-label="Home"
          >
            <span className="nav-icon" aria-hidden="true">🏠</span>
            <span className="nav-label">Home</span>
          </button>
          <button
            className={`nav-button ${currentScreen === 'gallery' ? 'active' : ''}`}
            onClick={() => navigateToScreen('gallery')}
            aria-label="Gallery"
          >
            <span className="nav-icon" aria-hidden="true">🃏</span>
            <span className="nav-label">Gallery</span>
          </button>
          <button
            className={`nav-button ${currentScreen === 'collection' ? 'active' : ''}`}
            onClick={() => navigateToScreen('collection')}
            aria-label="Collection"
          >
            <span className="nav-icon" aria-hidden="true">📚</span>
            <span className="nav-label">Collection</span>
          </button>
          <button
            className={`nav-button ${currentScreen === 'help' ? 'active' : ''}`}
            onClick={() => navigateToScreen('help')}
            aria-label="Help"
          >
            <span className="nav-icon" aria-hidden="true">❓</span>
            <span className="nav-label">Help</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;

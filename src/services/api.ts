import axios from 'axios';
import { Card, UserCollection } from '../types/Card';

// TODO: Replace with your backend API URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-backend-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Card-related API endpoints
export const cardApi = {
  // Get all cards
  getAllCards: async (): Promise<Card[]> => {
    const response = await api.get('/cards');
    return response.data;
  },

  // Get card by ID
  getCardById: async (id: string): Promise<Card> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Get user's collection
  getUserCollection: async (walletAddress: string): Promise<UserCollection> => {
    const response = await api.get(`/users/${walletAddress}/cards`);
    return response.data;
  },

  // Get cards by rarity
  getCardsByRarity: async (rarity: string): Promise<Card[]> => {
    const response = await api.get(`/cards?rarity=${rarity}`);
    return response.data;
  },

  // Get cards by faction
  getCardsByFaction: async (faction: string): Promise<Card[]> => {
    const response = await api.get(`/cards?faction=${faction}`);
    return response.data;
  },
};

// Hyperliquid API integration (to be implemented by backend)
export const hyperliquidApi = {
  // Get market data for a trading pair
  getMarketData: async (pair: string) => {
    const response = await api.get(`/hyperliquid/market/${pair}`);
    return response.data;
  },

  // Get user's trading positions
  getUserPositions: async (walletAddress: string) => {
    const response = await api.get(`/hyperliquid/positions/${walletAddress}`);
    return response.data;
  },
};

// Pear API integration (to be implemented by backend)
export const pearApi = {
  // Execute pair trade via Pear
  executePairTrade: async (data: {
    walletAddress: string;
    longPair: string;
    shortPair: string;
    amount: number;
  }) => {
    const response = await api.post('/pear/pair-trade', data);
    return response.data;
  },

  // Get pair trade status
  getPairTradeStatus: async (tradeId: string) => {
    const response = await api.get(`/pear/trade/${tradeId}`);
    return response.data;
  },
};

// Wallet/authentication endpoints
export const authApi = {
  // Connect wallet
  connectWallet: async (walletAddress: string, signature: string) => {
    const response = await api.post('/auth/connect', {
      walletAddress,
      signature,
    });
    return response.data;
  },

  // Verify wallet connection
  verifyConnection: async (walletAddress: string) => {
    const response = await api.get(`/auth/verify/${walletAddress}`);
    return response.data;
  },
};

export default api;

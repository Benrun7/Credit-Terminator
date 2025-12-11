import axios from 'axios';
import { CreditCard, PayoffProjection, CalculationResult, PaymentStrategy } from '@shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Cards
  getCards: async (): Promise<CreditCard[]> => {
    const response = await api.get('/cards');
    return response.data;
  },

  getCardById: async (id: string): Promise<CreditCard> => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  createCard: async (card: Omit<CreditCard, 'id'>): Promise<CreditCard> => {
    const response = await api.post('/cards', card);
    return response.data;
  },

  updateCard: async (id: string, updates: Partial<CreditCard>): Promise<CreditCard> => {
    const response = await api.put(`/cards/${id}`, updates);
    return response.data;
  },

  deleteCard: async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },

  // Calculations
  calculateProjection: async (strategy: PaymentStrategy): Promise<PayoffProjection> => {
    const response = await api.post('/calculations/projection', { strategy });
    return response.data;
  },

  compareStrategies: async (options: { totalMonthlyPayment?: number; strategies?: PaymentStrategy[] }): Promise<CalculationResult> => {
    const response = await api.post('/calculations/compare', options);
    return response.data;
  },
};

export { apiClient as api };


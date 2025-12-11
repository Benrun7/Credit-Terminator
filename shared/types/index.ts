// Common types shared between client and server

export interface CreditCard {
  id: string;
  name: string;
  balance: number; // текущий баланс
  interestRate: number; // процентная ставка (% годовых)
  minPayment: number; // минимальный платёж
  paymentDate: number; // день месяца для платежа (1-31)
  gracePeriod?: number; // grace period в днях
  currency?: string; // валюта (по умолчанию RUB)
}

export interface PaymentStrategy {
  type: 'minimum' | 'snowball' | 'avalanche' | 'hybrid' | 'custom';
  totalMonthlyPayment?: number; // для стратегий с фиксированным платежом
  customPayments?: Record<string, number>; // для custom стратегии: cardId -> amount
}

export interface MonthlyProjection {
  month: number; // номер месяца (0 = текущий месяц)
  date: string; // дата в формате YYYY-MM
  cards: Record<string, {
    balance: number;
    payment: number;
    interest: number;
    principal: number;
  }>;
  totalBalance: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
}

export interface PayoffProjection {
  projections: MonthlyProjection[];
  totalMonths: number;
  payoffDate: string; // дата полного закрытия
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  efficiency: number; // K_efficiency (0-100%)
}

export interface StrategyComparison {
  strategy: PaymentStrategy;
  projection: PayoffProjection;
  savings?: number; // экономия по сравнению с baseline
  monthsDiff?: number; // разница в месяцах по сравнению с baseline
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  cards: CreditCard[];
  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  baseline: PayoffProjection;
  strategies: StrategyComparison[];
  recommendations: string[];
}


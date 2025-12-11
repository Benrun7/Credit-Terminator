// Common constants

export const PAYMENT_STRATEGIES = {
  MINIMUM: 'minimum',
  SNOWBALL: 'snowball',
  AVALANCHE: 'avalanche',
  HYBRID: 'hybrid',
  CUSTOM: 'custom',
} as const;

export const CURRENCY = {
  RUB: 'RUB',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const DEFAULT_CURRENCY = CURRENCY.RUB;

// Максимальное количество месяцев для прогноза
export const MAX_PROJECTION_MONTHS = 120; // 10 лет

// Минимальный процент для расчета эффективности
export const MIN_EFFICIENCY_THRESHOLD = 30;




import {
  CreditCard,
  PaymentStrategy,
  MonthlyProjection,
  PayoffProjection,
  StrategyComparison,
  CalculationResult,
} from '../../../shared/types/index.js';

export class CalculationService {
  /**
   * Рассчитывает прогноз погашения для заданной стратегии
   */
  static calculateProjection(
    cards: CreditCard[],
    strategy: PaymentStrategy,
    startDate: Date = new Date()
  ): PayoffProjection {
    const projections: MonthlyProjection[] = [];
    let month = 0;
    let currentBalances = new Map<string, number>(
      cards.map(card => [card.id, card.balance])
    );

    const monthlyPayments = this.calculateMonthlyPayments(cards, strategy);

    while (this.hasActiveDebt(currentBalances) && month < 120) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);

      const projection: MonthlyProjection = {
        month,
        date: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
        cards: {},
        totalBalance: 0,
        totalPayment: 0,
        totalInterest: 0,
        totalPrincipal: 0,
      };

      // Рассчитываем для каждой карты
      for (const card of cards) {
        const currentBalance = currentBalances.get(card.id) || 0;
        if (currentBalance <= 0) {
          continue;
        }

        const payment = monthlyPayments.get(card.id) || 0;
        const monthlyRate = card.interestRate / 100 / 12; // месячная ставка
        const interest = currentBalance * monthlyRate;
        const principal = Math.max(0, Math.min(payment - interest, currentBalance));
        const newBalance = currentBalance - principal;

        projection.cards[card.id] = {
          balance: currentBalance,
          payment,
          interest,
          principal,
        };

        projection.totalBalance += currentBalance;
        projection.totalPayment += payment;
        projection.totalInterest += interest;
        projection.totalPrincipal += principal;

        currentBalances.set(card.id, newBalance);
      }

      projections.push(projection);
      month++;

      // Проверяем, есть ли прогресс
      if (month > 1 && projection.totalPrincipal === 0) {
        // Нет прогресса, возможно недостаточно платежей
        break;
      }
    }

    const totalInterestPaid = projections.reduce((sum, p) => sum + p.totalInterest, 0);
    const totalPrincipalPaid = projections.reduce((sum, p) => sum + p.totalPrincipal, 0);
    const efficiency = this.calculateEfficiency(projections);

    const lastProjection = projections[projections.length - 1];
    let payoffDate: string;
    if (lastProjection && lastProjection.totalBalance <= 0.01) {
      // Если долг полностью погашен в последнем месяце, используем дату этого месяца
      payoffDate = lastProjection.date + '-01';
    } else if (lastProjection) {
      // Иначе следующий месяц
      payoffDate = this.getNextMonthDate(lastProjection.date);
    } else {
      payoffDate = startDate.toISOString().split('T')[0];
    }

    return {
      projections,
      totalMonths: month,
      payoffDate,
      totalInterestPaid,
      totalPrincipalPaid,
      efficiency,
    };
  }

  /**
   * Рассчитывает ежемесячные платежи для каждой карты согласно стратегии
   */
  private static calculateMonthlyPayments(
    cards: CreditCard[],
    strategy: PaymentStrategy
  ): Map<string, number> {
    const payments = new Map<string, number>();

    switch (strategy.type) {
      case 'minimum':
        cards.forEach(card => {
          payments.set(card.id, card.minPayment);
        });
        break;

      case 'snowball': {
        // Сортируем по балансу (от меньшего к большему)
        const sortedCards = [...cards].sort((a, b) => a.balance - b.balance);
        const totalAvailable = strategy.totalMonthlyPayment || this.sumMinPayments(cards);
        const minPaymentsTotal = this.sumMinPayments(cards);
        const extra = Math.max(0, totalAvailable - minPaymentsTotal);

        // Сначала ставим все минимальные платежи
        cards.forEach(card => {
          payments.set(card.id, card.minPayment);
        });

        // Затем extra деньги идём по порядку от меньшего баланса к большему
        let remaining = extra;
        for (const card of sortedCards) {
          if (remaining <= 0) break;
          if (card.balance > 0) {
            const additionalPayment = Math.min(remaining, card.balance);
            payments.set(card.id, payments.get(card.id)! + additionalPayment);
            remaining -= additionalPayment;
          }
        }
        break;
      }

      case 'avalanche': {
        // Сортируем по процентной ставке (от большей к меньшей)
        const sortedCards = [...cards].sort((a, b) => b.interestRate - a.interestRate);
        const totalAvailable = strategy.totalMonthlyPayment || this.sumMinPayments(cards);
        const minPaymentsTotal = this.sumMinPayments(cards);
        const extra = Math.max(0, totalAvailable - minPaymentsTotal);

        // Сначала ставим все минимальные платежи
        cards.forEach(card => {
          payments.set(card.id, card.minPayment);
        });

        // Затем extra деньги идём по порядку от большей ставки к меньшей
        let remaining = extra;
        for (const card of sortedCards) {
          if (remaining <= 0) break;
          if (card.balance > 0) {
            const additionalPayment = Math.min(remaining, card.balance);
            payments.set(card.id, payments.get(card.id)! + additionalPayment);
            remaining -= additionalPayment;
          }
        }
        break;
      }

      case 'hybrid': {
        // Комбинация: сначала минимумы, потом extra по Avalanche
        const totalAvailable = strategy.totalMonthlyPayment || this.sumMinPayments(cards);
        const minPaymentsTotal = this.sumMinPayments(cards);
        const extra = Math.max(0, totalAvailable - minPaymentsTotal);

        const sortedCards = [...cards].sort((a, b) => b.interestRate - a.interestRate);
        let remaining = extra;

        cards.forEach(card => {
          payments.set(card.id, card.minPayment);
        });

        for (const card of sortedCards) {
          if (remaining <= 0) break;
          const currentBalance = card.balance;
          if (currentBalance > 0) {
            const additionalPayment = Math.min(remaining, currentBalance);
            payments.set(card.id, payments.get(card.id)! + additionalPayment);
            remaining -= additionalPayment;
          }
        }
        break;
      }

      case 'custom':
        cards.forEach(card => {
          const customPayment = strategy.customPayments?.[card.id];
          payments.set(card.id, customPayment ?? card.minPayment);
        });
        break;
    }

    return payments;
  }

  /**
   * Сравнивает различные стратегии
   */
  static compareStrategies(
    cards: CreditCard[],
    strategies: PaymentStrategy[]
  ): CalculationResult {
    const baseline = this.calculateProjection(cards, { type: 'minimum' });
    const comparisons: StrategyComparison[] = [];

    for (const strategy of strategies) {
      const projection = this.calculateProjection(cards, strategy);
      const savings = baseline.totalInterestPaid - projection.totalInterestPaid;
      const monthsDiff = baseline.totalMonths - projection.totalMonths;

      comparisons.push({
        strategy,
        projection,
        savings: Math.max(0, savings),
        monthsDiff: Math.max(0, monthsDiff),
      });
    }

    const recommendations = this.generateRecommendations(cards, baseline, comparisons);

    return {
      baseline,
      strategies: comparisons,
      recommendations,
    };
  }

  /**
   * Рассчитывает эффективность стратегии (K_efficiency)
   */
  private static calculateEfficiency(projections: MonthlyProjection[]): number {
    if (projections.length === 0) return 0;

    let totalPrincipal = 0;
    let totalPayment = 0;

    for (const projection of projections) {
      totalPrincipal += projection.totalPrincipal;
      totalPayment += projection.totalPayment;
    }

    if (totalPayment === 0) return 0;

    return Math.round((totalPrincipal / totalPayment) * 100);
  }

  /**
   * Генерирует рекомендации на основе сравнения стратегий
   */
  private static generateRecommendations(
    cards: CreditCard[],
    baseline: PayoffProjection,
    comparisons: StrategyComparison[]
  ): string[] {
    const recommendations: string[] = [];

    const bestStrategy = comparisons.reduce((best, current) => {
      if (!best) return current;
      const currentScore = (current.savings || 0) + (current.monthsDiff || 0) * 1000;
      const bestScore = (best.savings || 0) + (best.monthsDiff || 0) * 1000;
      return currentScore > bestScore ? current : best;
    }, null as StrategyComparison | null);

    if (bestStrategy && bestStrategy.savings && bestStrategy.savings > 0) {
      recommendations.push(
        `Стратегия "${this.getStrategyName(bestStrategy.strategy.type)}" может сэкономить ${Math.round(bestStrategy.savings)}₽ и сократить срок на ${bestStrategy.monthsDiff || 0} месяцев`
      );
    }

    const efficiency = baseline.efficiency;
    if (efficiency < 50) {
      recommendations.push(
        `Текущая эффективность (КПД) составляет ${efficiency}%. Большая часть платежей уходит на проценты. Рассмотрите увеличение платежей для повышения эффективности.`
      );
    }

    // Находим карту с самой высокой ставкой
    const highestRateCard = cards.reduce((highest, card) => {
      return card.interestRate > (highest?.interestRate || 0) ? card : highest;
    }, null as CreditCard | null);

    if (highestRateCard && highestRateCard.balance > 0) {
      const monthlyInterest = highestRateCard.balance * (highestRateCard.interestRate / 100 / 12);
      if (monthlyInterest > highestRateCard.minPayment * 0.5) {
        recommendations.push(
          `Карта "${highestRateCard.name}" имеет высокую процентную ставку (${highestRateCard.interestRate}%). Рекомендуется приоритетное погашение.`
        );
      }
    }

    return recommendations;
  }

  private static getStrategyName(type: PaymentStrategy['type']): string {
    const names: Record<PaymentStrategy['type'], string> = {
      minimum: 'Минимальные платежи',
      snowball: 'Snowball (от меньшего к большему)',
      avalanche: 'Avalanche (от большей ставки)',
      hybrid: 'Hybrid (комбинированная)',
      custom: 'Пользовательская',
    };
    return names[type];
  }

  private static hasActiveDebt(balances: Map<string, number>): boolean {
    return Array.from(balances.values()).some(balance => balance > 0.01);
  }

  private static sumMinPayments(cards: CreditCard[]): number {
    return cards.reduce((sum, card) => sum + card.minPayment, 0);
  }

  private static getNextMonthDate(dateStr: string): string {
    const [year, month] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1); // month is 0-indexed in Date
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  }
}


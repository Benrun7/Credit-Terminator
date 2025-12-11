import { useState } from 'react';
import { CreditCard, CalculationResult, PayoffProjection } from '@shared/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StrategyComparison.css';
import { api } from '../utils/api';

interface StrategyComparisonProps {
  cards: CreditCard[];
  comparison: CalculationResult | null;
  projection: PayoffProjection | null;
  onCalculate: (totalMonthlyPayment?: number) => void;
}

export default function StrategyComparison({
  cards,
  comparison,
  projection,
  onCalculate,
}: StrategyComparisonProps) {
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    const amount = parseFloat(totalMonthlyPayment);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму ежемесячного платежа');
      return;
    }

    setLoading(true);
    try {
      await onCalculate(amount);
    } catch (error) {
      console.error('Failed to calculate strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparison
    ? [
        {
          name: 'Минимальные',
          months: comparison.baseline.totalMonths,
          interest: Math.round(comparison.baseline.totalInterestPaid),
        },
        ...comparison.strategies.map(s => ({
          name: getStrategyName(s.strategy.type),
          months: s.projection.totalMonths,
          interest: Math.round(s.projection.totalInterestPaid),
        })),
      ]
    : [];

  return (
    <div className="strategy-comparison">
      <div className="strategy-input">
        <h2>Сравнение стратегий погашения</h2>
        <p>
          Введите сумму, которую вы готовы платить ежемесячно, чтобы увидеть сравнение различных
          стратегий погашения
        </p>
        <div className="input-group">
          <label htmlFor="monthly-payment">Ежемесячный платёж (₽)</label>
          <div className="input-with-button">
            <input
              id="monthly-payment"
              type="number"
              step="100"
              min="0"
              value={totalMonthlyPayment}
              onChange={(e) => setTotalMonthlyPayment(e.target.value)}
              placeholder={`Минимум: ${cards.reduce((sum, c) => sum + c.minPayment, 0).toLocaleString('ru-RU')} ₽`}
            />
            <button onClick={handleCalculate} disabled={loading || !totalMonthlyPayment}>
              {loading ? 'Расчёт...' : 'Сравнить стратегии'}
            </button>
          </div>
        </div>
      </div>

      {comparison && (
        <>
          <div className="strategy-summary">
            <h3>Сравнение результатов</h3>
            <div className="summary-cards">
              {comparison.strategies.map((strategy, idx) => (
                <div key={idx} className="strategy-card">
                  <div className="strategy-card-header">
                    <h4>{getStrategyName(strategy.strategy.type)}</h4>
                    {strategy.savings && strategy.savings > 0 && (
                      <span className="savings-badge">
                        Экономия: {Math.round(strategy.savings).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                  <div className="strategy-card-details">
                    <div className="detail-row">
                      <span>Срок погашения:</span>
                      <strong>{strategy.projection.totalMonths} месяцев</strong>
                    </div>
                    <div className="detail-row">
                      <span>Всего процентов:</span>
                      <strong>
                        {Math.round(strategy.projection.totalInterestPaid).toLocaleString('ru-RU')} ₽
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Эффективность:</span>
                      <strong>{strategy.projection.efficiency}%</strong>
                    </div>
                    {strategy.monthsDiff && strategy.monthsDiff > 0 && (
                      <div className="detail-row highlight">
                        <span>Быстрее на:</span>
                        <strong>{strategy.monthsDiff} месяцев</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="strategy-chart">
            <h3>Визуальное сравнение</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="months"
                  fill="#667eea"
                  name="Месяцев до погашения"
                />
                <Bar
                  yAxisId="right"
                  dataKey="interest"
                  fill="#ff6b6b"
                  name="Процентов всего (₽)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {comparison.recommendations.length > 0 && (
            <div className="recommendations">
              <h3>💡 Рекомендации</h3>
              <ul>
                {comparison.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!comparison && !loading && (
        <div className="empty-comparison">
          <p>Введите сумму ежемесячного платежа и нажмите "Сравнить стратегии"</p>
        </div>
      )}
    </div>
  );
}

function getStrategyName(type: string): string {
  const names: Record<string, string> = {
    minimum: 'Минимальные платежи',
    snowball: 'Snowball',
    avalanche: 'Avalanche',
    hybrid: 'Hybrid',
    custom: 'Пользовательская',
  };
  return names[type] || type;
}


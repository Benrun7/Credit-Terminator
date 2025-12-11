import { useState, useEffect } from 'react';
import { CreditCard, PayoffProjection, CalculationResult } from '@shared/types';
import CardsList from './components/CardsList';
import CardForm from './components/CardForm';
import ProjectionView from './components/ProjectionView';
import StrategyComparison from './components/StrategyComparison';
import { api } from './utils/api';
import './App.css';

function App() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'projection' | 'strategies'>('cards');
  const [projection, setProjection] = useState<PayoffProjection | null>(null);
  const [comparison, setComparison] = useState<CalculationResult | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await api.getCards();
      setCards(data);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardAdded = async (card: Omit<CreditCard, 'id'>) => {
    try {
      const newCard = await api.createCard(card);
      setCards([...cards, newCard]);
    } catch (error) {
      console.error('Failed to add card:', error);
      throw error;
    }
  };

  const handleCardUpdated = async (id: string, updates: Partial<CreditCard>) => {
    try {
      const updated = await api.updateCard(id, updates);
      setCards(cards.map(c => c.id === id ? updated : c));
      await recalculate();
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  };

  const handleCardDeleted = async (id: string) => {
    try {
      await api.deleteCard(id);
      setCards(cards.filter(c => c.id !== id));
      await recalculate();
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  };

  const recalculate = async () => {
    if (cards.length === 0) {
      setProjection(null);
      setComparison(null);
      return;
    }

    try {
      const proj = await api.calculateProjection({ type: 'minimum' });
      setProjection(proj);
    } catch (error) {
      console.error('Failed to calculate projection:', error);
    }
  };

  const handleCalculateStrategies = async (totalMonthlyPayment?: number) => {
    try {
      const result = await api.compareStrategies({ totalMonthlyPayment });
      setComparison(result);
      setProjection(result.baseline);
      setActiveTab('strategies');
    } catch (error) {
      console.error('Failed to compare strategies:', error);
    }
  };

  useEffect(() => {
    recalculate();
  }, [cards]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💳 Credit Terminator</h1>
        <p>Динамический планировщик погашения кредитных карт</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'cards' ? 'active' : ''}
          onClick={() => setActiveTab('cards')}
        >
          📋 Мои карты
        </button>
        <button
          className={activeTab === 'projection' ? 'active' : ''}
          onClick={() => setActiveTab('projection')}
          disabled={cards.length === 0}
        >
          📊 Прогноз
        </button>
        <button
          className={activeTab === 'strategies' ? 'active' : ''}
          onClick={() => setActiveTab('strategies')}
          disabled={cards.length === 0}
        >
          🎯 Стратегии
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'cards' && (
          <div className="cards-tab">
            <CardForm onCardAdded={handleCardAdded} />
            <CardsList
              cards={cards}
              onCardUpdated={handleCardUpdated}
              onCardDeleted={handleCardDeleted}
            />
          </div>
        )}

        {activeTab === 'projection' && projection && (
          <ProjectionView projection={projection} cards={cards} />
        )}

        {activeTab === 'strategies' && (
          <StrategyComparison
            cards={cards}
            comparison={comparison}
            projection={projection}
            onCalculate={handleCalculateStrategies}
          />
        )}

        {cards.length === 0 && (
          <div className="empty-state">
            <p>Добавьте вашу первую кредитную карту, чтобы начать планирование</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          ⚠️ Disclaimer: Данные расчеты носят информационный характер и не являются финансовой консультацией.
          Все данные хранятся локально и не передаются третьим лицам.
        </p>
      </footer>
    </div>
  );
}

export default App;


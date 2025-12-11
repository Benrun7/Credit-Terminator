import { useState } from 'react';
import { CreditCard } from '@shared/types';
import './CardForm.css';

interface CardFormProps {
  onCardAdded: (card: Omit<CreditCard, 'id'>) => Promise<void>;
}

export default function CardForm({ onCardAdded }: CardFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    interestRate: '',
    minPayment: '',
    paymentDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.balance || !formData.interestRate || !formData.minPayment) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      await onCardAdded({
        name: formData.name,
        balance: parseFloat(formData.balance),
        interestRate: parseFloat(formData.interestRate),
        minPayment: parseFloat(formData.minPayment),
        paymentDate: parseInt(formData.paymentDate) || 1,
        currency: 'RUB',
      });

      // Reset form
      setFormData({
        name: '',
        balance: '',
        interestRate: '',
        minPayment: '',
        paymentDate: '',
      });
      setIsExpanded(false);
    } catch (error) {
      alert('Ошибка при добавлении карты. Попробуйте еще раз.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        className="card-form-toggle"
        onClick={() => setIsExpanded(true)}
      >
        + Добавить кредитную карту
      </button>
    );
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Добавить кредитную карту</h2>
        <button
          type="button"
          className="form-close-btn"
          onClick={() => setIsExpanded(false)}
        >
          ×
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Название карты *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Сбербанк Visa"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="balance">Текущий баланс (₽) *</label>
          <input
            id="balance"
            type="number"
            step="0.01"
            min="0"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            placeholder="50000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="interestRate">Процентная ставка (% годовых) *</label>
          <input
            id="interestRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="24.9"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="minPayment">Минимальный платёж (₽/мес) *</label>
          <input
            id="minPayment"
            type="number"
            step="0.01"
            min="0"
            value={formData.minPayment}
            onChange={(e) => setFormData({ ...formData, minPayment: e.target.value })}
            placeholder="5000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="paymentDate">День платежа (1-31)</label>
          <input
            id="paymentDate"
            type="number"
            min="1"
            max="31"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            placeholder="15"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="btn-secondary"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Добавление...' : 'Добавить карту'}
        </button>
      </div>
    </form>
  );
}


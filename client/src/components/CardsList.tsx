import { CreditCard } from '@shared/types';
import './CardsList.css';

interface CardsListProps {
  cards: CreditCard[];
  onCardUpdated: (id: string, updates: Partial<CreditCard>) => void;
  onCardDeleted: (id: string) => void;
}

export default function CardsList({ cards, onCardUpdated, onCardDeleted }: CardsListProps) {
  if (cards.length === 0) {
    return (
      <div className="cards-list-empty">
        <p>У вас пока нет добавленных карт</p>
      </div>
    );
  }

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const totalMinPayment = cards.reduce((sum, card) => sum + card.minPayment, 0);

  return (
    <div className="cards-list">
      <div className="cards-summary">
        <div className="summary-item">
          <span className="summary-label">Всего карт:</span>
          <span className="summary-value">{cards.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Общий долг:</span>
          <span className="summary-value">{totalBalance.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Минимальные платежи:</span>
          <span className="summary-value">{totalMinPayment.toLocaleString('ru-RU')} ₽/мес</span>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onUpdate={onCardUpdated}
            onDelete={onCardDeleted}
          />
        ))}
      </div>
    </div>
  );
}

interface CardItemProps {
  card: CreditCard;
  onUpdate: (id: string, updates: Partial<CreditCard>) => void;
  onDelete: (id: string) => void;
}

function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const monthlyInterest = card.balance * (card.interestRate / 100 / 12);
  const principalFromMin = Math.max(0, card.minPayment - monthlyInterest);

  return (
    <div className="card-item">
      <div className="card-header">
        <h3>{card.name}</h3>
        <button
          className="card-delete-btn"
          onClick={() => {
            if (confirm(`Удалить карту "${card.name}"?`)) {
              onDelete(card.id);
            }
          }}
          title="Удалить карту"
        >
          ×
        </button>
      </div>

      <div className="card-details">
        <div className="card-detail">
          <span className="detail-label">Баланс:</span>
          <span className="detail-value">{card.balance.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">Ставка:</span>
          <span className="detail-value">{card.interestRate}% годовых</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">Мин. платёж:</span>
          <span className="detail-value">{card.minPayment.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">День платежа:</span>
          <span className="detail-value">{card.paymentDate} число</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">Проценты/мес:</span>
          <span className="detail-value warning">
            {monthlyInterest.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </span>
        </div>
        <div className="card-detail">
          <span className="detail-label">Погашение/мес:</span>
          <span className="detail-value success">
            {principalFromMin.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </span>
        </div>
      </div>

      <button
        className="card-edit-btn"
        onClick={() => {
          const name = prompt('Название карты:', card.name);
          if (name && name !== card.name) {
            onUpdate(card.id, { name });
          }

          const balance = prompt('Баланс (₽):', card.balance.toString());
          if (balance !== null) {
            const balanceNum = parseFloat(balance);
            if (!isNaN(balanceNum)) {
              onUpdate(card.id, { balance: balanceNum });
            }
          }

          const rate = prompt('Процентная ставка (% годовых):', card.interestRate.toString());
          if (rate !== null) {
            const rateNum = parseFloat(rate);
            if (!isNaN(rateNum)) {
              onUpdate(card.id, { interestRate: rateNum });
            }
          }

          const minPayment = prompt('Минимальный платёж (₽):', card.minPayment.toString());
          if (minPayment !== null) {
            const minPaymentNum = parseFloat(minPayment);
            if (!isNaN(minPaymentNum)) {
              onUpdate(card.id, { minPayment: minPaymentNum });
            }
          }

          const paymentDate = prompt('День платежа (1-31):', card.paymentDate.toString());
          if (paymentDate !== null) {
            const paymentDateNum = parseInt(paymentDate);
            if (!isNaN(paymentDateNum) && paymentDateNum >= 1 && paymentDateNum <= 31) {
              onUpdate(card.id, { paymentDate: paymentDateNum });
            }
          }
        }}
      >
        ✏️ Редактировать
      </button>
    </div>
  );
}




import { PayoffProjection, CreditCard } from '@shared/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ProjectionView.css';

interface ProjectionViewProps {
  projection: PayoffProjection;
  cards: CreditCard[];
}

export default function ProjectionView({ projection, cards }: ProjectionViewProps) {
  let accumulatedInterest = 0;
  const chartData = projection.projections.map(p => {
    accumulatedInterest += p.totalInterest;
    return {
      month: p.date,
      'Общий долг': Math.round(p.totalBalance),
      'Выплачено процентов': Math.round(accumulatedInterest),
    };
  });

  const totalInterestPaid = projection.totalInterestPaid;

  return (
    <div className="projection-view">
      <div className="projection-summary">
        <div className="summary-card">
          <div className="summary-card-icon">📅</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Дата закрытия</div>
            <div className="summary-card-value">
              {new Date(projection.payoffDate).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">⏱️</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Срок погашения</div>
            <div className="summary-card-value">{projection.totalMonths} месяцев</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">💰</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Всего процентов</div>
            <div className="summary-card-value">
              {Math.round(totalInterestPaid).toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">⚡</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Эффективность (КПД)</div>
            <div className="summary-card-value">{projection.efficiency}%</div>
          </div>
        </div>
      </div>

      <div className="projection-chart">
        <h3>График погашения долга</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={100}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Общий долг"
              stroke="#667eea"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="projection-table">
        <h3>Детальный прогноз по месяцам</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Месяц</th>
                <th>Общий долг</th>
                <th>Платёж</th>
                <th>Проценты</th>
                <th>Погашение</th>
              </tr>
            </thead>
            <tbody>
              {projection.projections.slice(0, 24).map((p, idx) => (
                <tr key={idx}>
                  <td>{p.date}</td>
                  <td>{Math.round(p.totalBalance).toLocaleString('ru-RU')} ₽</td>
                  <td>{Math.round(p.totalPayment).toLocaleString('ru-RU')} ₽</td>
                  <td className="warning">
                    {Math.round(p.totalInterest).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="success">
                    {Math.round(p.totalPrincipal).toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projection.projections.length > 24 && (
            <p className="table-note">
              Показаны первые 24 месяца из {projection.projections.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


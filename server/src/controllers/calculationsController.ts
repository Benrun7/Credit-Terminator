import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { CalculationService } from '../services/calculationService.js';
import { PaymentStrategy } from '../../../shared/types/index.js';

const DEFAULT_USER_ID = 'default-user';

export class CalculationsController {
  static calculateProjection(req: Request, res: Response) {
    try {
      const { strategy } = req.body;
      const cards = UserModel.getAllCards(DEFAULT_USER_ID);

      if (cards.length === 0) {
        return res.status(400).json({ error: 'No cards found. Please add cards first.' });
      }

      const projection = CalculationService.calculateProjection(
        cards,
        strategy || { type: 'minimum' }
      );

      res.json(projection);
    } catch (error) {
      console.error('Calculation error:', error);
      res.status(500).json({ error: 'Failed to calculate projection' });
    }
  }

  static compareStrategies(req: Request, res: Response) {
    try {
      const { strategies, totalMonthlyPayment } = req.body;
      const cards = UserModel.getAllCards(DEFAULT_USER_ID);

      if (cards.length === 0) {
        return res.status(400).json({ error: 'No cards found. Please add cards first.' });
      }

      // Если не указаны стратегии, генерируем стандартный набор
      let strategiesToCompare: PaymentStrategy[] = strategies || [
        { type: 'minimum' },
        { type: 'avalanche', totalMonthlyPayment: totalMonthlyPayment || undefined },
        { type: 'snowball', totalMonthlyPayment: totalMonthlyPayment || undefined },
        { type: 'hybrid', totalMonthlyPayment: totalMonthlyPayment || undefined },
      ].filter(s => s.totalMonthlyPayment !== undefined || s.type === 'minimum');

      const result = CalculationService.compareStrategies(cards, strategiesToCompare);

      res.json(result);
    } catch (error) {
      console.error('Strategy comparison error:', error);
      res.status(500).json({ error: 'Failed to compare strategies' });
    }
  }
}


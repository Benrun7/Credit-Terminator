import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { CreditCard } from '../../../shared/types/index.js';

const DEFAULT_USER_ID = 'default-user';

export class CardsController {
  static getAllCards(req: Request, res: Response) {
    try {
      const cards = UserModel.getAllCards(DEFAULT_USER_ID);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get cards' });
    }
  }

  static getCardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cards = UserModel.getAllCards(DEFAULT_USER_ID);
      const card = cards.find(c => c.id === id);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.json(card);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get card' });
    }
  }

  static createCard(req: Request, res: Response) {
    try {
      const cardData = req.body;
      const card = UserModel.addCard(DEFAULT_USER_ID, cardData);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create card' });
    }
  }

  static updateCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const card = UserModel.updateCard(DEFAULT_USER_ID, id, updates);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.json(card);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update card' });
    }
  }

  static deleteCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = UserModel.deleteCard(DEFAULT_USER_ID, id);

      if (!deleted) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete card' });
    }
  }
}


import { Router } from 'express';
import { CardsController } from '../controllers/cardsController.js';

const router = Router();

router.get('/', CardsController.getAllCards);
router.get('/:id', CardsController.getCardById);
router.post('/', CardsController.createCard);
router.put('/:id', CardsController.updateCard);
router.delete('/:id', CardsController.deleteCard);

export default router;




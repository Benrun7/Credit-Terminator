import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards.js';
import calculationsRouter from './routes/calculations.js';
import { UserModel } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cards', cardsRouter);
app.use('/api/calculations', calculationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Инициализация и запуск сервера
async function startServer() {
  try {
    // Инициализируем хранилище пользователей
    await UserModel.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


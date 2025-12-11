import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardsRouter from './routes/cards.js';
import calculationsRouter from './routes/calculations.js';

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


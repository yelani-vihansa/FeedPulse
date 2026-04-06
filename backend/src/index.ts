import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedbackRoutes';
import authRoutes from './routes/authRoutes';
import { createDefaultAdmin } from './controllers/authController';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await createDefaultAdmin();
    app.listen(4000, () => console.log('✅ Backend running on http://localhost:4000'));
  })
  .catch(err => console.error('❌ MongoDB error:', err));
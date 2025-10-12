import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import errorHandler from './middlewares/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Gasless Voting API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/users', userRoutes);

// 404 handler (catch-all)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

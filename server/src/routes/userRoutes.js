import express from 'express';
import { getUserStats, getUserVotes } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stats', authenticate, getUserStats);
router.get('/votes', authenticate, getUserVotes);

export default router;
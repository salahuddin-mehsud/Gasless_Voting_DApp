import express from 'express';
import { 
  createPoll, 
  getPolls, 
  getPoll, 
  vote, 
  getUserPolls 
} from '../controllers/pollController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { validatePollCreation, validateVote } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', authenticate, validatePollCreation, createPoll);
router.get('/', optionalAuth, getPolls);
router.get('/user', authenticate, getUserPolls);
router.get('/:id', optionalAuth, getPoll);
router.post('/:id/vote', authenticate, validateVote, vote);

export default router;
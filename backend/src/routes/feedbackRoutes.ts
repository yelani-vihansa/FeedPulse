import { Router } from 'express';
import {
	createFeedback,
	deleteFeedback,
	getAllFeedback,
	getFeedbackById,
	getFeedbackSummary,
	getStats,
	updateFeedbackStatus
} from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';
import { feedbackSubmissionLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', feedbackSubmissionLimiter, createFeedback);
router.get('/', authenticate, getAllFeedback);
router.get('/stats', authenticate, getStats);
router.get('/summary', authenticate, getFeedbackSummary);
router.get('/:id', authenticate, getFeedbackById);
router.patch('/:id', authenticate, updateFeedbackStatus);
router.delete('/:id', authenticate, deleteFeedback);

export default router;
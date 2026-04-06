import rateLimit from 'express-rate-limit';

export const feedbackSubmissionLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		data: null,
		error: 'RATE_LIMIT_EXCEEDED',
		message: 'Too many submissions from this IP. Please try again in an hour.'
	}
});


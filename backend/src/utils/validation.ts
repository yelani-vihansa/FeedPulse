const emailRegex = /^\S+@\S+\.\S+$/;

const normalizeText = (value: unknown) => {
	if (typeof value !== 'string') {
		return '';
	}
	return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
};

export const sanitizeFeedbackInput = (payload: Record<string, unknown>) => {
	return {
		title: normalizeText(payload.title),
		description: normalizeText(payload.description),
		category: normalizeText(payload.category),
		submitterName: normalizeText(payload.submitterName),
		submitterEmail: normalizeText(payload.submitterEmail).toLowerCase()
	};
};

export const validateFeedbackInput = (payload: {
	title: string;
	description: string;
	category: string;
	submitterEmail?: string;
}) => {
	if (!payload.title) {
		return 'Title is required';
	}
	if (payload.title.length > 120) {
		return 'Title must be less than or equal to 120 characters';
	}
	if (!payload.description || payload.description.length < 20) {
		return 'Description must be at least 20 characters';
	}

	const allowedCategories = ['Bug', 'Feature Request', 'Improvement', 'Other'];
	if (!allowedCategories.includes(payload.category)) {
		return 'Invalid category';
	}

	if (payload.submitterEmail && !emailRegex.test(payload.submitterEmail)) {
		return 'Invalid email format';
	}

	return null;
};

export const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}
	return Math.min(Math.floor(parsed), max);
};


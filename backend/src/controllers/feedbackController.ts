import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import { analyzeFeedback } from '../services/geminiService';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { parsePositiveInt, sanitizeFeedbackInput, validateFeedbackInput } from '../utils/validation';

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const sanitized = sanitizeFeedbackInput(req.body || {});
    const validationError = validateFeedbackInput(sanitized);

    if (validationError) {
      return sendError(res, validationError, 400, 'VALIDATION_ERROR');
    }

    const feedback = new Feedback(sanitized);
    await feedback.save();
    
    // Run AI in background
    analyzeFeedback(feedback.title, feedback.description).then(async (analysis) => {
      if (analysis) {
        await Feedback.findByIdAndUpdate(feedback._id, {
          ai_category: analysis.category,
          ai_sentiment: analysis.sentiment,
          ai_priority: analysis.priority_score,
          ai_summary: analysis.summary,
          ai_tags: analysis.tags,
          ai_processed: true
        });
      }
    });
    
    return sendSuccess(res, feedback, 'Feedback submitted', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to submit feedback', 500, message);
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 10, 100);

    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query: Record<string, any> = {};
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ai_summary: { $regex: search, $options: 'i' } }
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      date: { createdAt: sortOrder },
      priority: { ai_priority: sortOrder, createdAt: -1 },
      sentiment: { ai_sentiment: sortOrder, createdAt: -1 }
    };

    const sort = sortMap[sortBy] || sortMap.date;
    const skip = (page - 1) * limit;

    const [feedback, total] = await Promise.all([
      Feedback.find(query).sort(sort).skip(skip).limit(limit),
      Feedback.countDocuments(query)
    ]);

    return sendSuccess(res, {
      items: feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Feedback fetched');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to fetch feedback', 500, message);
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const status = typeof req.body.status === 'string' ? req.body.status : '';
    const allowed = ['New', 'In Review', 'Resolved'];
    if (!allowed.includes(status)) {
      return sendError(res, 'Invalid status', 400, 'VALIDATION_ERROR');
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return sendError(res, 'Feedback not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, feedback, 'Status updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to update status', 500, message);
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const allFeedback = await Feedback.find({}, { ai_priority: 1, ai_tags: 1, status: 1 });
    const total = allFeedback.length;
    const open = allFeedback.filter((item) => item.status !== 'Resolved').length;

    const priorities = allFeedback
      .map((item) => item.ai_priority)
      .filter((value): value is number => typeof value === 'number');
    const averagePriority = priorities.length
      ? Number((priorities.reduce((a, b) => a + b, 0) / priorities.length).toFixed(1))
      : 0;

    const tagCounts = new Map<string, number>();
    allFeedback.forEach((item) => {
      (item.ai_tags || []).forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    let mostCommonTag = '';
    let maxCount = 0;
    tagCounts.forEach((count, tag) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonTag = tag;
      }
    });

    return sendSuccess(res, { total, open, averagePriority, mostCommonTag }, 'Stats fetched');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to fetch stats', 500, message);
  }
};

export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return sendError(res, 'Feedback not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, feedback, 'Feedback fetched');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to fetch feedback', 500, message);
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return sendError(res, 'Feedback not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id: req.params.id }, 'Feedback deleted');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to delete feedback', 500, message);
  }
};

export const getFeedbackSummary = async (_req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const last7Days = await Feedback.find({ createdAt: { $gte: since } }, { ai_tags: 1, ai_summary: 1, title: 1 });

    const themeCounts = new Map<string, number>();
    last7Days.forEach((item) => {
      (item.ai_tags || []).forEach((tag: string) => {
        const key = tag.trim();
        if (key) {
          themeCounts.set(key, (themeCounts.get(key) || 0) + 1);
        }
      });
    });

    const topThemes = [...themeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, count }));

    const summaryText = topThemes.length
      ? `Top themes this week: ${topThemes.map((item) => `${item.theme} (${item.count})`).join(', ')}`
      : 'No AI themes available for the last 7 days.';

    return sendSuccess(res, { topThemes, summary: summaryText, totalFeedbackInWindow: last7Days.length }, 'Summary generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 'Failed to generate summary', 500, message);
  }
};
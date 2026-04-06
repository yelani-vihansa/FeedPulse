import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 20 },
  category: { type: String, enum: ['Bug', 'Feature Request', 'Improvement', 'Other'], required: true },
  status: { type: String, enum: ['New', 'In Review', 'Resolved'], default: 'New' },
  submitterName: { type: String, trim: true, default: '' },
  submitterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
    validate: {
      validator: (value: string) => !value || /^\S+@\S+\.\S+$/.test(value),
      message: 'Invalid email format'
    }
  },
  ai_category: { type: String, enum: ['Bug', 'Feature Request', 'Improvement', 'Other'] },
  ai_sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
  ai_priority: { type: Number, min: 1, max: 10 },
  ai_summary: { type: String, default: '' },
  ai_tags: { type: [String], default: [] },
  ai_processed: { type: Boolean, default: false }
}, { timestamps: true });

feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ ai_priority: -1 });
feedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
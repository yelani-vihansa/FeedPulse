'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Feature Request',
    submitterName: '',
    submitterEmail: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 120) newErrors.title = 'Title must be less than 120 characters';
    if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (formData.submitterEmail && !/\S+@\S+\.\S+/.test(formData.submitterEmail)) {
      newErrors.submitterEmail = 'Invalid email format';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus('error');
      setStatusMessage('Please fix the highlighted fields and try again.');
      return;
    }

    setStatus('submitting');
    try {
      await axios.post(`${apiBaseUrl}/api/feedback`, formData, { timeout: 10000 });
      setStatus('success');
      setStatusMessage('Thank you! Your feedback has been submitted successfully.');
      setFormData({ title: '', description: '', category: 'Feature Request', submitterName: '', submitterEmail: '' });
      setErrors({});
    } catch (error) {
      let message = 'Failed to submit feedback. Please try again later.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
      }
      setStatus('error');
      setStatusMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Share Your Feedback</h1>
            <p className="text-gray-600">Help us improve our product with your suggestions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of your feedback"
                maxLength={120}
              />
              <div className="flex justify-between mt-1">
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                <p className="text-gray-500 text-sm ml-auto">{formData.title.length}/120</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Please provide detailed information about your feedback..."
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                <p className="text-gray-500 text-sm ml-auto">{formData.description.length}/20 minimum characters</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Bug</option>
                <option>Feature Request</option>
                <option>Improvement</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={formData.submitterEmail}
                  onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
                {errors.submitterEmail && <p className="text-red-500 text-sm mt-1">{errors.submitterEmail}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>

            {status === 'submitting' && (
              <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
                Submitting your feedback...
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                {statusMessage}
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {statusMessage || 'Failed to submit feedback. Please try again later.'}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
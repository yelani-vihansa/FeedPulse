'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Feedback {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  ai_sentiment: string;
  ai_priority: number;
  ai_summary: string;
  createdAt: string;
  submitterName?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, averagePriority: 0, mostCommonTag: '' });
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      router.replace('/login');
      return;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters, sortBy, sortOrder, page]);

  const fetchData = async () => {
    setRefreshing(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [feedbackRes, statsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit,
            category: filters.category || undefined,
            status: filters.status || undefined,
            search: filters.search || undefined,
            sortBy,
            sortOrder
          }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setFeedback(feedbackRes.data?.data?.items || []);
      setPagination(feedbackRes.data?.data?.pagination || { page, limit, total: 0, totalPages: 0 });
      setStats(statsRes.data?.data || { total: 0, open: 0, averagePriority: 0, mostCommonTag: '' });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback((current) => current.map((item) => item._id === id ? { ...item, status: newStatus } : item));
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update feedback status.');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Neutral': return 'bg-gray-100 text-gray-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 font-bold';
    if (priority >= 5) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">FeedPulse Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Feedback</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Open Items</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Avg Priority Score</p>
            <p className="text-3xl font-bold text-blue-600">{stats.averagePriority.toFixed(1)}/10</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
            <p className="text-gray-500 text-sm">Most Common Tag</p>
            <p className="text-2xl font-bold text-gray-900">{stats.mostCommonTag || 'N/A'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search title or summary"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option>Bug</option>
              <option>Feature Request</option>
              <option>Improvement</option>
              <option>Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option>New</option>
              <option>In Review</option>
              <option>Resolved</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'sentiment')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="sentiment">Sort by Sentiment</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {refreshing && (
            <div className="px-6 py-3 text-sm text-blue-600 border-b border-gray-200">Refreshing feedback…</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedback.map((item: Feedback) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      {item.ai_summary && (
                        <div className="text-sm text-gray-500 mt-1">{item.ai_summary}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(item.ai_sentiment)}`}>
                        {item.ai_sentiment || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getPriorityColor(item.ai_priority)}>
                        {item.ai_priority ? `${item.ai_priority}/10` : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option>New</option>
                        <option>In Review</option>
                        <option>Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {feedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No feedback submissions yet. Submit some feedback from the homepage!
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total items
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
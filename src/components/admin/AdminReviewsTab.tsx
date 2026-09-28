import React, { useState, useEffect } from 'react';
import { Star, Trash2, Search, MessageSquare, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';
import { api } from '../../services/api';

interface AdminReviewsTabProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ onNotify }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReviews();
      setReviews(res.reviews || []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to remove this customer review?')) return;
    setDeletingId(reviewId);
    try {
      await api.deleteAdminReview(productId, reviewId);
      onNotify('Review moderated and removed successfully');
      setReviews(prev => prev.filter(r => r.review.id !== reviewId));
    } catch (err: any) {
      onNotify(err.message || 'Error removing review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter(item => {
    const r = item.review;
    const p = item.product;
    const matchesSearch =
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      p.name?.toLowerCase().includes(search.toLowerCase());

    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-950 flex items-center gap-2">
            <span>Customer Reviews Moderation</span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-sans font-medium">
              {reviews.length} Total
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Review customer impressions, verify genuine patronage, and moderate inappropriate feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer, comment, product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 w-64"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
          No customer reviews matching filter criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {filteredReviews.map(item => {
              const { product, review } = item;
              return (
                <div key={review.id} className="p-6 flex flex-col md:flex-row items-start justify-between gap-6 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900">{product.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">ID: {product.id}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-200'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-semibold text-zinc-700 ml-1">
                          {review.rating}.0 / 5.0
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-zinc-700 leading-relaxed font-serif italic max-w-2xl bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        "{review.comment}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                        <span>By: <strong>{review.userName}</strong></span>
                        <span>·</span>
                        <span>{new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(product.id, review.id)}
                      disabled={deletingId === review.id}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-rose-100"
                      title="Moderate and remove review"
                    >
                      {deletingId === review.id ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

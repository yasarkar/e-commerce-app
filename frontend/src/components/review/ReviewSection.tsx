import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../../api/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { CreateReviewRequest, ProductRating, Review, UpdateReviewRequest } from '../../types';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { Star, MessageSquare, Pencil } from 'lucide-react';

interface ReviewSectionProps {
  productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const [reviewsResponse, ratingResponse] = await Promise.all([
        reviewService.getProductReviews(productId),
        reviewService.getProductRating(productId),
      ]);
      setReviews(reviewsResponse.data);
      setRating(ratingResponse.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }, [productId]);

  const loadReviewedState = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await reviewService.checkReviewed(productId);
      setHasReviewed(response.data.reviewed);
    } catch (error) {
      // Kullanıcı giriş yapmamışsa veya hata oluşursa sessizce geç
      console.error('Error checking review state:', error);
    }
  }, [isAuthenticated, productId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        await loadReviews();
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [loadReviews]);

  useEffect(() => {
    loadReviewedState();
  }, [loadReviewedState]);

  const handleCreate = async (data: { rating: number; title?: string; comment: string }) => {
    try {
      const request: CreateReviewRequest = { productId, ...data };
      await reviewService.createReview(request);
      setShowForm(false);
      setHasReviewed(true);
      showToast('success', 'Yorumunuz başarıyla eklendi');
      await loadReviews();
      await loadReviewedState();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: { rating: number; title?: string; comment: string }) => {
    if (!editingReview) return;
    try {
      const request: UpdateReviewRequest = { ...data };
      await reviewService.updateReview(editingReview.id, request);
      setEditingReview(null);
      setShowForm(false);
      showToast('success', 'Yorumunuz güncellendi');
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };

  const handleDelete = async (review: Review) => {
    const confirmed = window.confirm('Yorumunuzu silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      await reviewService.deleteReview(review.id);
      setHasReviewed(false);
      showToast('info', 'Yorumunuz silindi');
      await loadReviews();
      await loadReviewedState();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  // Puan dağılımını yüzdeye çevir (çubuk genişliği için)
  const getDistributionPercentage = (count: number) => {
    if (!rating || rating.totalReviews === 0) return 0;
    return Math.round((count / rating.totalReviews) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Ürün Yorumları
        </h2>
        {isAuthenticated && !hasReviewed && !showForm && !editingReview && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <Star className="w-4 h-4" />
            Yorum Yap
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel: Puan Özeti */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {rating && rating.totalReviews > 0 ? (
              <>
                <div className="text-center">
                  <div className="text-5xl font-black text-slate-900">
                    {rating.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <StarRating rating={rating.averageRating} size={20} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {rating.totalReviews} değerlendirme
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = rating.ratingDistribution[star] || 0;
                    const percentage = getDistributionPercentage(count);
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 w-6 shrink-0">
                          {star} ★
                        </span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl font-black text-slate-300">—</div>
                <p className="text-sm text-slate-500 mt-3">
                  Bu ürüne henüz değerlendirme yapılmadı.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  İlk değerlendirmeyi siz yapın!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Panel: Yorum Listesi + Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Yorum formu gösterimi */}
          {showForm && isAuthenticated && !hasReviewed && !editingReview && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Değerlendirmenizi Yazın</h3>
              <ReviewForm
                initialRating={0}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Düzenleme formu gösterimi */}
          {showForm && editingReview && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Yorumunuzu Düzenleyin</h3>
              <ReviewForm
                initialRating={editingReview.rating}
                initialTitle={editingReview.title || ''}
                initialComment={editingReview.comment}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setEditingReview(null);
                  setShowForm(false);
                }}
                isEditing
              />
            </div>
          )}

          {/* Giriş yapılmamışsa uyarı */}
          {!isAuthenticated && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-600">
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-semibold"
                >
                  Giriş yapın
                </Link>{' '}
                veya{' '}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:text-indigo-500 font-semibold"
                >
                  kayıt olun
                </Link>{' '}
                — yorum yapmak için giriş yapmanız gerekmektedir.
              </p>
            </div>
          )}

          {/* Zaten yorum yapıldıysa bilgi */}
          {isAuthenticated && hasReviewed && !showForm && !editingReview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  ✓ Bu ürüne zaten yorum yaptınız.
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Yorumunuzu düzenleyebilir veya silebilirsiniz.
                </p>
              </div>
              {!editingReview && (
                <button
                  onClick={() => {
                    const own = reviews.find((r) => r.isOwner);
                    if (own) handleEdit(own);
                  }}
                  className="inline-flex items-center gap-2 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Düzenle
                </button>
              )}
            </div>
          )}

          {/* Yorum listesi */}
          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">
                Henüz yorum bulunmuyor.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={isAuthenticated ? handleEdit : undefined}
                onDelete={isAuthenticated ? handleDelete : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
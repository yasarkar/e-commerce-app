import React from 'react';
import type { Review } from '../../types';
import { StarRating } from './StarRating';
import { Pencil, Trash2 } from 'lucide-react';

interface ReviewCardProps {
    review: Review;
    onEdit?: (review: Review) => void;
    onDelete?: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
    // Tarihi Türkçe formatında göster
    const formattedDate = new Date(review.createdAt).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const initial = review.userFullName ? review.userFullName.charAt(0).toUpperCase() : '?';

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar: baş harf */}
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                        {initial}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{review.userFullName}</span>
                            <StarRating rating={review.rating} size={14} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
                    </div>
                </div>

                {/* Kendi yorumuysa Düzenle / Sil butonları */}
                {review.isOwner && (onEdit || onDelete) && (
                    <div className="flex items-center gap-1 shrink-0">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(review)}
                                title="Düzenle"
                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(review)}
                                title="Sil"
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {review.title && (
                <p className="mt-3 font-bold text-slate-900 text-sm">{review.title}</p>
            )}
            <p className="mt-1 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {review.comment}
            </p>
        </div>
    );
};

export default ReviewCard;
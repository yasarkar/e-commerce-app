import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { Star, X } from 'lucide-react';

interface ReviewFormProps {
    initialRating?: number;
    initialTitle?: string;
    initialComment?: string;
    onSubmit: (data: { rating: number; title?: string; comment: string }) => Promise<void>;
    onCancel?: () => void;
    isEditing?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
    initialRating = 0,
    initialTitle = '',
    initialComment = '',
    onSubmit,
    onCancel,
    isEditing = false,
}) => {
    const [rating, setRating] = useState(initialRating);
    const [title, setTitle] = useState(initialTitle);
    const [comment, setComment] = useState(initialComment);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Düzenleme modunda mevcut değerler ile formu doldur
    useEffect(() => {
        setRating(initialRating);
        setTitle(initialTitle);
        setComment(initialComment);
    }, [initialRating, initialTitle, initialComment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (rating < 1 || rating > 5) {
            setError('Lütfen bir yıldız puanı seçin (1-5 arası).');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Yorum en az 10 karakter olmalıdır.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ rating, title: title.trim() || undefined, comment: comment.trim() });
        } catch {
            setError('Yorum kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">Puanınız:</span>
                    <StarRating rating={rating} size={28} interactive onChange={setRating} />
                </div>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                        İptal
                    </button>
                )}
            </div>

            <div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    placeholder="Başlık (opsiyonel)"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
            </div>

            <div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Yorumunuzu yazın (en az 10 karakter)..."
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-400">
                        {comment.trim().length < 10
                            ? `${10 - comment.trim().length} karakter daha yazın`
                            : 'Yorumunuz yayınlanmaya hazır'}
                    </p>
                    <p className="text-xs text-slate-400">{comment.length}/1000</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-4 py-2.5">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                    <Star className="w-4 h-4" />
                    {isSubmitting
                        ? 'Gönderiliyor...'
                        : isEditing
                            ? 'Güncelle'
                            : 'Yorum Yap'}
                </button>
                {isEditing && !onCancel && (
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5 transition-colors cursor-pointer"
                    >
                        Vazgeç
                    </button>
                )}
            </div>
        </form>
    );
};

export default ReviewForm;
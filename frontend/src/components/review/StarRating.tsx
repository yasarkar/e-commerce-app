import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;               // 0-5 arası değer (ondalık olabilir)
  size?: number;                // Yıldız boyutu (px)
  interactive?: boolean;        // Etkileşimli mod (hover + tıklama ile puan seçme)
  onChange?: (rating: number) => void;
  showValue?: boolean;          // Yanında sayısal değeri göster
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  interactive = false,
  onChange,
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating ?? rating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating - fullStars >= 0.5 && !interactive;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars;
          const isHalf = star === fullStars + 1 && hasHalfStar;
          const isHovered = interactive && hoverRating !== null && star <= hoverRating;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onClick={() => handleClick(star)}
              className={`relative inline-flex items-center justify-center focus:outline-none ${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              }`}
              style={{ width: size, height: size }}
              aria-label={`${star} yıldız`}
            >
              {/* Arka plan (boş yıldız) */}
              <Star
                className={`absolute inset-0 m-auto transition-colors ${
                  isHovered || isFull ? 'text-amber-400' : 'text-slate-300'
                }`}
                style={{ width: size, height: size }}
              />
              {/* Yarım yıldız gösterimi */}
              {isHalf && !interactive && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: size / 2 }}>
                  <Star
                    className="text-amber-400 fill-current"
                    style={{ width: size, height: size }}
                  />
                </div>
              )}
              {/* Etkileşimli modda dolu yıldız */}
              {interactive && isHovered && (
                <Star
                  className="absolute inset-0 m-auto text-amber-400 fill-current"
                  style={{ width: size, height: size }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm font-semibold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
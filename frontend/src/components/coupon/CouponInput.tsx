import React, { useState } from 'react';
import { couponService } from '../../api/couponService';
import { useToast } from '../../context/ToastContext';
import type { CouponValidation } from '../../types';
import { Tag, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface CouponInputProps {
  cartTotal: number;
  onCouponApplied: (coupon: CouponValidation) => void;
  onCouponRemoved: () => void;
  appliedCoupon: CouponValidation | null;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}) => {
  const { showToast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setIsApplying(true);
    setErrorMessage(null);
    try {
      const response = await couponService.validateCoupon(code, cartTotal);
      if (response.data.valid) {
        onCouponApplied(response.data);
        setCouponCode('');
        showToast('success', response.data.message);
      } else {
        setErrorMessage(response.data.message);
        showToast('error', response.data.message);
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      const errorData = error.response?.data;
      const message = errorData?.message || 'Kupon doğrulanırken bir hata oluştu.';
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const handleRemove = () => {
    onCouponRemoved();
    setErrorMessage(null);
    setCouponCode('');
  };

  if (appliedCoupon) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-4 flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-600">Kupon Uygulandı <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-emerald-600 font-bold">
              {appliedCoupon.code}
            </span></p>
            <p className="text-xs text-slate-500">
              {appliedCoupon.message}<span className="font-bold text-emerald-600"></span>
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0 p-1"
          title="Kuponu Kaldır"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kupon kodunuzu girin"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 px-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm uppercase"
          disabled={isApplying}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying || !couponCode.trim()}
          className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-sm shrink-0"
        >
          {isApplying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Tag className="w-4 h-4" />
              <span>Uygula</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 flex items-start space-x-2.5 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
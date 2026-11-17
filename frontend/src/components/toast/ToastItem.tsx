import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type Toast } from '../../context/ToastContext';

interface ToastItemProps {
  toast: Toast;
}

const toastStyles = {
  success: {
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    bar: 'bg-emerald-500',
    title: 'Başarılı',
  },
  error: {
    border: 'border-red-500',
    iconBg: 'bg-red-50',
    icon: 'text-red-600',
    bar: 'bg-red-500',
    title: 'Hata',
  },
  warning: {
    border: 'border-amber-400',
    iconBg: 'bg-amber-50',
    icon: 'text-amber-500',
    bar: 'bg-amber-400',
    title: 'Uyarı',
  },
  info: {
    border: 'border-blue-500',
    iconBg: 'bg-blue-50',
    icon: 'text-blue-600',
    bar: 'bg-blue-500',
    title: 'Bilgi',
  },
} as const;

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

export const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(toast.duration);
  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startProgress = () => {
    startTimeRef.current = Date.now();
    // İlerleme çubuğu: 50ms aralıklarla kalan süreye göre genişlik güncellenir
    progressTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingRef.current - elapsed);
      setProgress((remaining / toast.duration) * 100);
    }, 50);
  };

  const pauseTimer = () => {
    if (isPaused) return;
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimers();
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (!isPaused) return;
    setIsPaused(false);
    startProgress();
    timerRef.current = window.setTimeout(handleClose, remainingRef.current);
  };

  const handleClose = () => {
    clearTimers();
    setIsLeaving(true);
    leaveTimerRef.current = window.setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  useEffect(() => {
    startProgress();
    timerRef.current = window.setTimeout(handleClose, toast.duration);

    return () => {
      clearTimers();
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      className={`relative bg-white border border-slate-200 border-l-4 ${styles.border} rounded-lg shadow-lg overflow-hidden pointer-events-auto max-w-sm w-full
        ${isLeaving ? 'toast-fade-out' : 'toast-slide-in'}`}
      role="alert"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`shrink-0 ${styles.iconBg} rounded-full p-1.5 ${styles.icon}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-slate-900">{styles.title}</p>
          <p className="text-[13px] text-slate-600 mt-0.5 leading-snug break-words">{toast.message}</p>
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 -mr-1 -mt-1"
          title="Kapat"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full ${styles.bar} transition-[width] duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
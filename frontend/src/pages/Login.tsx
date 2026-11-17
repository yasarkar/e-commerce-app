import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, LogIn, AlertCircle } from 'lucide-react';
import type { ErrorResponse } from '../types';

const loginSchema = z.object({
  email: z.string().min(1, 'E-posta adresi gereklidir').email('Geçersiz e-posta adresi'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setValidationErrors(null);
    setIsSubmitting(true);
    try {
      const response = await login(data);
      const isAdmin = response.user.role === 'ROLE_ADMIN';
      showToast('success', `Hoş geldiniz, ${response.user.firstName}!`);
      navigate(isAdmin ? '/admin' : '/');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        setErrorMessage(errorData.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
        if (errorData.validationErrors) {
          setValidationErrors(errorData.validationErrors);
        }
      } else {
        setErrorMessage('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-full text-white shadow-lg shadow-indigo-500/30 mb-3">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Giriş Yap</h2>
          <p className="text-slate-500 text-sm mt-1">TeknoPazar'a hoş geldiniz!</p>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hata oluştu</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-slate-500 text-sm font-semibold mb-2" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              placeholder="ornek@eposta.com"
              {...register('email')}
              className={`w-full bg-slate-900 border ${
                errors.email ? 'border-red-500' : 'border-slate-700'
              } rounded-lg py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
            />
            {errors.email && (
              <span className="text-red-550 text-xs mt-1 block">{errors.email.message}</span>
            )}
            {validationErrors?.email && (
              <span className="text-red-550 text-xs mt-1 block">{validationErrors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-slate-500 text-sm font-semibold mb-2" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full bg-slate-900 border ${
                errors.password ? 'border-red-500' : 'border-slate-700'
              } rounded-lg py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
            />
            {errors.password && (
              <span className="text-red-550 text-xs mt-1 block">{errors.password.message}</span>
            )}
            {validationErrors?.password && (
              <span className="text-red-550 text-xs mt-1 block">{validationErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 cursor-pointer mt-6"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
};
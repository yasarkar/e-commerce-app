import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import type { ErrorResponse } from '../types';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    email: z.string().min(1, 'E-posta adresi gereklidir').email('Geçersiz e-posta adresi'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string().min(6, 'Şifre doğrulama en az 6 karakter olmalıdır'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setValidationErrors(null);
    setIsSubmitting(true);
    try {
      await registerUser(data);
      setSuccessMessage('Kayıt işleminiz başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsunuz...');
      showToast('success', 'Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        const errorData = error.response.data as ErrorResponse;
        setErrorMessage(errorData.message || 'Kayıt yapılamadı. Girdiğiniz bilgileri kontrol edin.');
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
    <div className="min-h-screen bg-slate-955 text-slate-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-full text-white shadow-lg shadow-indigo-500/30 mb-3">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kayıt Ol</h2>
          <p className="text-slate-500 text-sm mt-1">TeknoPazar ailesine katılarak alışverişe başlayın</p>
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

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start space-x-3 text-green-700 text-sm">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Başarılı</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="firstName">
                Ad
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Ahmet"
                {...formRegister('firstName')}
                className={`w-full bg-slate-900 border ${
                  errors.firstName ? 'border-red-500' : 'border-slate-700'
                } rounded-lg py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
              />
              {errors.firstName && (
                <span className="text-red-550 text-xs mt-1 block">{errors.firstName.message}</span>
              )}
              {validationErrors?.firstName && (
                <span className="text-red-550 text-xs mt-1 block">{validationErrors.firstName}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="lastName">
                Soyad
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Yılmaz"
                {...formRegister('lastName')}
                className={`w-full bg-slate-900 border ${
                  errors.lastName ? 'border-red-500' : 'border-slate-700'
                } rounded-lg py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
              />
              {errors.lastName && (
                <span className="text-red-550 text-xs mt-1 block">{errors.lastName.message}</span>
              )}
              {validationErrors?.lastName && (
                <span className="text-red-550 text-xs mt-1 block">{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              placeholder="ornek@eposta.com"
              {...formRegister('email')}
              className={`w-full bg-slate-900 border ${
                errors.email ? 'border-red-500' : 'border-slate-700'
              } rounded-lg py-2 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
            />
            {errors.email && (
              <span className="text-red-550 text-xs mt-1 block">{errors.email.message}</span>
            )}
            {validationErrors?.email && (
              <span className="text-red-550 text-xs mt-1 block">{validationErrors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...formRegister('password')}
              className={`w-full bg-slate-900 border ${
                errors.password ? 'border-red-500' : 'border-slate-700'
              } rounded-lg py-2 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
            />
            {errors.password && (
              <span className="text-red-550 text-xs mt-1 block">{errors.password.message}</span>
            )}
            {validationErrors?.password && (
              <span className="text-red-550 text-xs mt-1 block">{validationErrors.password}</span>
            )}
          </div>

          <div>
            <label className="block text-slate-500 text-sm font-semibold mb-1.5" htmlFor="confirmPassword">
              Şifre Doğrulama
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...formRegister('confirmPassword')}
              className={`w-full bg-slate-900 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
              } rounded-lg py-2 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
            />
            {errors.confirmPassword && (
              <span className="text-red-550 text-xs mt-1 block">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 cursor-pointer mt-6 text-sm"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Kayıt Ol</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Zaten üye misiniz?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
};
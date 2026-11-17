import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-750 text-slate-500 py-8 px-6 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div>
          <Link to="/" className="shrink-0 flex items-center mr-4">
            <img src="/assets/TeknoPazar-Icon.svg" alt="TeknoPazar" className="h-9 w-auto" />
          </Link>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} Tüm Hakları Saklıdır.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-indigo-600 transition-colors">Gizlilik Politikası</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Kullanım Koşulları</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">İletişim</a>
        </div>
      </div>
    </footer>
  );
};

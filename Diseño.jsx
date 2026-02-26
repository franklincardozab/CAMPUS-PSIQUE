import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, User, Award, MessageCircle } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', icon: Home, label: 'Inicio' },
    { name: 'Progress', icon: Award, label: 'Progreso' },
  ];

  const isActive = (name) => {
    const url = createPageUrl(name);
    return location.pathname === url || location.pathname === url + '/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
      
      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 
        md:hidden z-50 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ name, icon: Icon, label }) => (
            <Link
              key={name}
              to={createPageUrl(name)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                ${isActive(name) 
                  ? 'text-violet-600' 
                  : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className={`w-6 h-6 ${isActive(name) ? 'text-violet-600' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
}
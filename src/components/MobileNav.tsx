import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, HelpCircle, BarChart3, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/') && location.pathname === '/'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* 2. Subjects */}
        <Link
          to="/subjects"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/subjects') || isActive('/subject') || isActive('/chapter') || isActive('/playlist') || isActive('/class')
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Subjects</span>
        </Link>

        {/* 3. Question Bank */}
        <Link
          to="/question-bank"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/question-bank')
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bank</span>
        </Link>

        {/* Clear Buddy Floating / Accessible Badge */}
        <Link
          to="/clear-buddy"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/clear-buddy')
              ? 'text-indigo-600 font-bold'
              : 'text-indigo-600/80 hover:text-indigo-700'
          }`}
          title="Clear Buddy AI"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-indigo-600">Buddy</span>
        </Link>

        {/* 4. Progress */}
        <Link
          to="/progress"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/progress')
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Progress</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to={currentUser ? "/profile" : "/login"}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            isActive('/profile') || isActive('/login')
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{currentUser ? 'Profile' : 'Sign In'}</span>
        </Link>
      </div>
    </div>
  );
};

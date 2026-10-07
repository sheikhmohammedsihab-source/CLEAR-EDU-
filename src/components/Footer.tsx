import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, Youtube, Shield } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              <strong className="text-slate-700">CLEAR</strong> = Curated Learning, Education &amp; Accessible Resources.
              We organize the best educational classes into a distraction-free, sequential curriculum so students never get lost in recommendation algorithms, Shorts, or noise.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Curriculum
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/subjects" className="hover:text-indigo-600 transition-colors">
                  All Subjects
                </Link>
              </li>
              <li>
                <Link to="/subject/physics" className="hover:text-indigo-600 transition-colors">
                  Physics (পদার্থবিজ্ঞান)
                </Link>
              </li>
              <li>
                <Link to="/subject/chemistry" className="hover:text-indigo-600 transition-colors">
                  Chemistry (রসায়ন)
                </Link>
              </li>
              <li>
                <Link to="/subject/higher-math" className="hover:text-indigo-600 transition-colors">
                  Higher Mathematics
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Ethics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Content &amp; Ethics
            </h4>
            <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
              <div className="flex items-start gap-2">
                <Youtube className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Plays via official YouTube embedded player without alterations.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ad-free navigation flow with zero user-distraction feeds.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} {APP_NAME}. Curated Learning, Education & Accessible Resources.</p>
          <p className="flex items-center gap-1">
            Built for distraction-free academic excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  Flame,
  Award,
  Zap,
  Shield,
  Crown,
  BookOpen,
  Layers,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  HelpCircle,
  Check,
  Star,
  Trophy,
  Clock,
  Compass,
  Lock,
  ChevronRight,
  Info,
  X,
  Share2
} from 'lucide-react';
import type { UserBadge, BadgeCategory } from '../types';

interface UserBadgesSectionProps {
  badges: UserBadge[];
  streakDays: number;
  unlockedCount: number;
  totalCount: number;
  totalWatchSeconds: number;
}

export const UserBadgesSection: React.FC<UserBadgesSectionProps> = ({
  badges,
  streakDays,
  unlockedCount,
  totalCount,
  totalWatchSeconds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);
  const [activeBadgeModal, setActiveBadgeModal] = useState<UserBadge | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Icon mapping helper
  const renderBadgeIcon = (iconName: string, className = 'w-6 h-6 text-white') => {
    switch (iconName) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'HelpCircle':
        return <HelpCircle className={className} />;
      case 'Check':
        return <Check className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const filteredBadges = badges.filter((b) => {
    if (filterUnlockedOnly && !b.unlocked) return false;
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    return true;
  });

  // Find next nearest locked badge to motivate student
  const nextTargetBadge = badges.find((b) => !b.unlocked);

  const formatHoursMinutes = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handleShareBadge = (badge: UserBadge) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🏆 I just earned the "${badge.name}" (${badge.bnName}) badge on CLEAR EDU! Studying without the noise for SSC 2026.`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stat Bar */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>SSC Achievement &amp; Streaks</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Learning Badges &amp; Milestones
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Celebrate your consistency! Earn trophies by maintaining daily study streaks, completing course lessons, and mastering chapter exams without social distractions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Streak */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                <span className="text-xl sm:text-2xl font-extrabold">{streakDays}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300">Days Streak</span>
            </div>

            {/* Badges Count */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <Award className="w-4 h-4" />
                <span className="text-xl sm:text-2xl font-extrabold">
                  {unlockedCount}
                  <span className="text-xs text-slate-400 font-normal">/{totalCount}</span>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300">Earned</span>
            </div>

            {/* Watch Time */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-400 mb-0.5">
                <Clock className="w-4 h-4" />
                <span className="text-base sm:text-lg font-extrabold truncate">
                  {formatHoursMinutes(totalWatchSeconds)}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300">Focus Time</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Banner */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Overall Achievement Progress</span>
              <span className="font-bold text-amber-300">
                {Math.round((unlockedCount / totalCount) * 100)}% Completed
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {nextTargetBadge && (
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <span className="text-slate-400">Next in reach:</span>
              <span className="font-bold text-white flex items-center gap-1">
                {nextTargetBadge.name} ({nextTargetBadge.progressLabel})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Controls & Categories Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            onClick={() => setSelectedCategory('STREAK')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'STREAK'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Streaks</span>
          </button>
          <button
            onClick={() => setSelectedCategory('COURSES')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'COURSES'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses</span>
          </button>
          <button
            onClick={() => setSelectedCategory('EXAMS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'EXAMS'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Exams</span>
          </button>
          <button
            onClick={() => setSelectedCategory('FOCUS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'FOCUS'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus Time</span>
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer self-start sm:self-auto select-none">
          <input
            type="checkbox"
            checked={filterUnlockedOnly}
            onChange={(e) => setFilterUnlockedOnly(e.target.checked)}
            className="rounded text-indigo-600"
          />
          <span>Show Unlocked Only ({unlockedCount})</span>
        </label>
      </div>

      {/* 3. Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;
          const progressPercent = Math.min(
            100,
            Math.round((badge.currentProgress / badge.maxProgress) * 100)
          );

          return (
            <div
              key={badge.id}
              onClick={() => setActiveBadgeModal(badge)}
              className={`rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isUnlocked
                  ? 'bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-md'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-80 hover:opacity-100 hover:bg-white'
              }`}
            >
              <div>
                {/* Header: Icon + Status Pill */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.gradient} text-white`
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? (
                      renderBadgeIcon(badge.icon, 'w-7 h-7 text-white')
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                      <Lock className="w-3 h-3 text-slate-400" />
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Title & Bengali */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {badge.bnName}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className={isUnlocked ? 'text-emerald-600' : 'text-slate-500'}>
                    {isUnlocked ? 'Completed' : 'In Progress'}
                  </span>
                  <span className="text-slate-600 font-mono text-[10px]">
                    {badge.progressLabel}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-emerald-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Badge Detail & Celebration Modal */}
      {activeBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setActiveBadgeModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Medallion */}
            <div className="flex justify-center pt-2">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl ${
                  activeBadgeModal.unlocked
                    ? `bg-gradient-to-br ${activeBadgeModal.gradient} text-white ring-4 ring-amber-300/30`
                    : 'bg-slate-100 text-slate-400 ring-4 ring-slate-100'
                }`}
              >
                {activeBadgeModal.unlocked ? (
                  renderBadgeIcon(activeBadgeModal.icon, 'w-12 h-12 text-white')
                ) : (
                  <Lock className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>

            {/* Title & Bengali */}
            <div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wider bg-indigo-50 text-indigo-700">
                {activeBadgeModal.category} ACHIEVER
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeBadgeModal.name}
              </h2>
              <p className="text-sm font-bold text-indigo-600 mt-0.5">
                {activeBadgeModal.bnName}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-3">
              {activeBadgeModal.description}
            </p>

            {/* Progress Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Requirement</span>
                <span className="text-indigo-600">{activeBadgeModal.progressLabel}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    activeBadgeModal.unlocked ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (activeBadgeModal.currentProgress / activeBadgeModal.maxProgress) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {activeBadgeModal.unlocked
                  ? '🎉 Congratulations! You have successfully earned and verified this milestone.'
                  : 'Keep learning consistently without opening social media to unlock this badge.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              {activeBadgeModal.unlocked && (
                <button
                  onClick={() => handleShareBadge(activeBadgeModal)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Achievement'}</span>
                </button>
              )}

              <button
                onClick={() => setActiveBadgeModal(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

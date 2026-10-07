import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  LogOut,
  Sparkles,
  ArrowRight,
  PlayCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, getClasses, getSubjects, getExamAttempts, getChapters } from '../lib/database';
import { ProgressBar } from '../components/ProgressBar';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { UserBadgesSection } from '../components/UserBadgesSection';
import { evaluateUserBadges } from '../lib/badges';
import { getYouTubeThumbnailUrl } from '../lib/youtube';
import type { ClassItem, Subject, Chapter, UserProgressMap, QuestionAttempt } from '../types';

export const Profile: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [examAttempts, setExamAttempts] = useState<QuestionAttempt[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfileData() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [classList, subjectList, chapterList, attempts, progress] = await Promise.all([
          getClasses(),
          getSubjects(),
          getChapters(),
          getExamAttempts(currentUser.uid),
          getUserProgress(currentUser.uid),
        ]);

        if (!isMounted) return;

        setClasses(classList);
        setSubjects(subjectList);
        setChapters(chapterList);
        setExamAttempts(attempts);
        setUserProgress(progress);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfileData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <EmptyState
        title="Please Sign In"
        description="Sign in to view your learning progress, completed classes, and study history."
        actionText="Sign In"
        actionLink="/login"
      />
    );
  }

  if (loading) {
    return <Loading text="Loading your learning records..." />;
  }

  // Filter completed classes
  const completedClasses = classes.filter((c) => userProgress[c.id]?.completed);

  // Recently watched classes (last 5)
  const recentlyWatchedClasses = Object.entries(userProgress)
    .filter(([_, data]) => data.lastWatchedAt)
    .sort((a, b) => (b[1].lastWatchedAt || 0) - (a[1].lastWatchedAt || 0))
    .slice(0, 5)
    .map(([classId]) => classes.find((c) => c.id === classId))
    .filter((c): c is ClassItem => Boolean(c));

  const totalClassesCount = classes.filter((c) => c.published !== false).length;

  // Evaluate user badges & streaks
  const badgesData = evaluateUserBadges({
    userProgress,
    classes,
    examAttempts,
    chapters,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const createdDate = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active';

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-2xl border-2 border-indigo-100 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-100">
                {(currentUser.displayName || currentUser.email || 'S')[0].toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentUser.displayName || 'CLEAR Student'}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {createdDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-center">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold text-center transition-colors shadow-xs"
              >
                Admin CMS
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Overall Curriculum Progress
            </h3>
            <ProgressBar
              completed={completedClasses.length}
              total={totalClassesCount}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* User Badges & Learning Achievements */}
      <UserBadgesSection
        badges={badgesData.badges}
        streakDays={badgesData.streakDays}
        unlockedCount={badgesData.unlockedCount}
        totalCount={badgesData.totalCount}
        totalWatchSeconds={badgesData.totalWatchSeconds}
      />

      {/* Grid: Recently Studied & Completed Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Studied */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recently Studied</span>
            </h2>
            <span className="text-xs text-slate-400">Last 5 classes</span>
          </div>

          {recentlyWatchedClasses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-xs text-slate-500">
              You haven't watched any classes yet. Pick a subject to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {recentlyWatchedClasses.map((item) => {
                const isCompleted = userProgress[item.id]?.completed;
                return (
                  <Link
                    key={item.id}
                    to={`/class/${item.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3.5"
                  >
                    <div className="relative aspect-video w-20 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={getYouTubeThumbnailUrl(item.youtubeId, 'mq')}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase mb-0.5">
                        <span>Class #{item.classNumber}</span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">{item.teacher}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>

                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Classes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Classes</span>
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {completedClasses.length} Completed
            </span>
          </div>

          {completedClasses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-xs text-slate-500">
              No classes marked complete yet. Click "Mark as Complete" after finishing a lecture.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {completedClasses.map((item) => (
                <Link
                  key={item.id}
                  to={`/class/${item.id}`}
                  className="group bg-white rounded-2xl border border-emerald-100 p-3.5 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase mb-0.5">
                      <span>Class #{item.classNumber}</span>
                      <span>•</span>
                      <span className="text-slate-400 truncate">{item.teacher}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-600 group-hover:underline shrink-0">
                    Review
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

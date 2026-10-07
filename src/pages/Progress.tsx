import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  PlayCircle,
  Sparkles,
  BarChart3,
  Bookmark,
  Award,
  RotateCcw,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import {
  getUserProgress,
  getClasses,
  getSubjects,
  getChapters,
  getBookmarks,
  getExamAttempts,
} from '../lib/database';
import { formatResumePosition, formatDuration, getYouTubeThumbnailUrl } from '../lib/youtube';
import { ProgressBar } from '../components/ProgressBar';
import { SubjectIcon } from '../components/SubjectIcon';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type { ClassItem, Subject, Chapter, UserProgressMap, BookmarkMap, QuestionAttempt } from '../types';

export const Progress: React.FC = () => {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [bookmarks, setBookmarks] = useState<BookmarkMap>({});
  const [examAttempts, setExamAttempts] = useState<QuestionAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProgressData() {
      try {
        setLoading(true);
        const effectiveUid = currentUser?.uid || 'guest';
        const [allClasses, allSubjects, allChapters, prog, bmarks, attempts] = await Promise.all([
          getClasses(),
          getSubjects(),
          getChapters(),
          getUserProgress(effectiveUid),
          getBookmarks(effectiveUid),
          getExamAttempts(effectiveUid),
        ]);

        if (!isMounted) return;
        setClasses(allClasses.filter((c) => c.published !== false));
        setSubjects(allSubjects.filter((s) => s.published !== false));
        setChapters(allChapters.filter((c) => c.published !== false));
        setUserProgress(prog);
        setBookmarks(bmarks);
        setExamAttempts(attempts);
      } catch (err) {
        console.error('Error loading progress page:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProgressData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return <Loading text="Aggregating your academic progress metrics..." />;
  }

  const totalClasses = classes.length;
  const completedClasses = classes.filter((c) => userProgress[c.id]?.completed);
  const inProgressClasses = classes.filter((c) => {
    const prog = userProgress[c.id];
    return prog && !prog.completed && prog.positionSeconds > 10;
  });

  // Calculate subjects started
  const subjectsStarted = subjects.filter((s) => {
    const subjectClasses = classes.filter((c) => c.subjectId === s.id);
    return subjectClasses.some((c) => userProgress[c.id]);
  });

  // Exam metrics
  const passedExams = examAttempts.filter((a) => a.passed);
  const avgScore =
    examAttempts.length > 0
      ? Math.round(examAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / examAttempts.length)
      : 0;

  const chaptersMap = new Map<string, Chapter>(chapters.map((c) => [c.id, c]));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Learning Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Study Progress &amp; Assessment Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track completed lectures, uninterrupted resume points, and verified chapter exam scores.
        </p>
      </div>

      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Showing local device learning progress. Sign in to synchronize your progress across devices.</span>
          </div>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Sign In to Sync
          </Link>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            CLASSES COMPLETED
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {completedClasses.length}
            </span>
            <span className="text-xs text-slate-400">/ {totalClasses}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Verified completed lessons</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            IN PROGRESS
          </span>
          <span className="text-3xl font-extrabold text-indigo-600">
            {inProgressClasses.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-2">Active resume points</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            EXAMS PASSED
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {passedExams.length}
            </span>
            <span className="text-xs text-slate-400">/ {examAttempts.length} tests</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Avg. Score: {avgScore}%</p>
        </div>

        <Link
          to="/saved"
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              SAVED CLASSES
            </span>
            <span className="text-3xl font-extrabold text-amber-600">
              {Object.keys(bookmarks).length}
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1 mt-2">
            View Bookmarks <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Global Curriculum Progress Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Overall SSC Curriculum Progress</h2>
            <p className="text-xs text-slate-500">
              {completedClasses.length} of {totalClasses} classes completed across all subjects.
            </p>
          </div>
          <span className="text-sm font-extrabold text-indigo-600">
            {totalClasses > 0 ? Math.round((completedClasses.length / totalClasses) * 100) : 0}%
          </span>
        </div>
        <ProgressBar completed={completedClasses.length} total={totalClasses} size="lg" showText={false} />
      </div>

      {/* Exam Assessment History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Chapter Exam Performance</span>
          </h2>
          <Link
            to="/question-bank"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Practice Question Bank <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {examAttempts.length === 0 ? (
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No exam attempts yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Finish chapter lectures to unlock official MCQ assessments and earn chapter mastery badges.
            </p>
            <Link
              to="/subjects"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Start Studying
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examAttempts.slice(0, 6).map((att) => {
              const chap = att.chapterId ? chaptersMap.get(att.chapterId) : null;
              const isMastered = att.mastered || att.percentage >= 85;

              return (
                <div
                  key={att.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isMastered
                            ? 'bg-amber-100 text-amber-800'
                            : att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isMastered ? 'MASTERED (85%+)' : att.passed ? 'PASSED' : 'RETAKE SUGGESTED'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(att.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {chap?.name || att.chapterId}
                    </h3>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {att.percentage}%
                      </span>
                      <span className="text-xs text-slate-500">
                        ({att.score} / {att.totalMarks} marks)
                      </span>
                    </div>

                    {att.weakTopics && att.weakTopics.length > 0 && (
                      <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                        Weak topics: {att.weakTopics.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/exam/${att.id}/result`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <span>View Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/clear-buddy?subject=${encodeURIComponent(chap?.subjectId || '')}&chapter=${encodeURIComponent(chap?.name || '')}&score=${att.percentage}&weakTopics=${encodeURIComponent(att.weakTopics?.join(',') || '')}`}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Review with AI</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-Progress Classes Section with Interruption-Friendly Resume */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Continue In-Progress Lectures</span>
          </h2>
          <span className="text-xs text-slate-500">
            {inProgressClasses.length} unfinished {inProgressClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {inProgressClasses.length === 0 ? (
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 text-center text-xs text-slate-500">
            No lectures currently in progress. Start a class from your subjects!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressClasses.map((item) => {
              const prog = userProgress[item.id];
              const posSec = prog?.positionSeconds || 0;
              const durSec = prog?.durationSeconds || item.durationSeconds || 0;
              const percent = durSec > 0 ? Math.min(100, Math.round((posSec / durSec) * 100)) : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative aspect-video w-28 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={getYouTubeThumbnailUrl(item.youtubeId, 'mq')}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                        Class #{item.classNumber} • {item.teacher}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="mt-2 text-[11px] text-slate-500 font-medium">
                        Resume from <strong className="text-indigo-600 font-bold">{formatResumePosition(posSec)}</strong>
                        {durSec > 0 && <span> / {formatDuration(durSec)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Watch Progress: {percent}%</span>
                      <span className="text-[10px] text-slate-400 italic">Watch progress, not mastery</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>

                    <Link
                      to={`/class/${item.id}`}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue from {formatResumePosition(posSec)}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject-by-Subject Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Subject Milestones
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const subjectClasses = classes.filter((c) => c.subjectId === sub.id);
            const subCompleted = subjectClasses.filter((c) => userProgress[c.id]?.completed).length;

            return (
              <Link
                key={sub.id}
                to={`/subject/${sub.id}`}
                className="group bg-white rounded-3xl border border-slate-200/90 p-5 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <SubjectIcon iconName={sub.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {subCompleted} / {subjectClasses.length}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <ProgressBar completed={subCompleted} total={subjectClasses.length} size="sm" showText={false} />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{subjectClasses.length} total lessons</span>
                    <span className="text-indigo-600 font-semibold group-hover:underline">Explore</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Play,
  Award,
  Sparkles,
  Book,
  ExternalLink,
  HelpCircle,
  Lock,
  Unlock
} from 'lucide-react';
import {
  getChapter,
  getSubject,
  getClasses,
  getPlaylists,
  getUserProgress,
  getChapterProgress,
  getChapterExamConfig,
  getBooks,
  evaluateAndSyncChapterCompletion
} from '../lib/database';
import { formatDuration, formatResumePosition, getYouTubeThumbnailUrl } from '../lib/youtube';
import { ProgressBar } from '../components/ProgressBar';
import { ResumeBadge } from '../components/ResumeBadge';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type {
  Chapter,
  Subject,
  Playlist,
  ClassItem,
  UserProgressMap,
  ChapterProgress,
  ChapterExamConfig,
  Book as BookType
} from '../types';

export const ChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { currentUser, isAdmin } = useAuth();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress | null>(null);
  const [examConfig, setExamConfig] = useState<ChapterExamConfig | null>(null);
  const [textbook, setTextbook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!chapterId) return;
      try {
        setLoading(true);
        const chap = await getChapter(chapterId);
        if (!chap) {
          if (isMounted) setLoading(false);
          return;
        }

        const [subj, plist, classList, config, booksList] = await Promise.all([
          getSubject(chap.subjectId),
          getPlaylists(chap.subjectId, chapterId),
          getClasses(chapterId),
          getChapterExamConfig(chapterId),
          getBooks(chap.subjectId),
        ]);

        if (!isMounted) return;

        setChapter(chap);
        setSubject(subj);
        setPlaylists(plist.filter((p) => p.published !== false));
        setClasses(classList.filter((c) => c.published !== false));
        setExamConfig(config);
        setTextbook(booksList.length > 0 ? booksList[0] : null);

        if (currentUser) {
          const [progress, initialProg] = await Promise.all([
            getUserProgress(currentUser.uid),
            getChapterProgress(currentUser.uid, chapterId),
          ]);

          if (!isMounted) return;
          setUserProgress(progress);
          setChapterProgress(initialProg);

          // Evaluate and auto-sync chapter completion & exam unlock
          const syncResult = await evaluateAndSyncChapterCompletion(currentUser.uid, chapterId);
          if (syncResult && isMounted) {
            const updatedProg = await getChapterProgress(currentUser.uid, chapterId);
            setChapterProgress(updatedProg);
          }
        }
      } catch (err) {
        console.error('Error loading chapter page:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [chapterId, currentUser]);

  if (loading) {
    return <Loading text="Loading chapter curriculum & classes..." />;
  }

  if (!chapter) {
    return (
      <EmptyState
        title="Chapter Not Found"
        description="The chapter requested does not exist or may have been unlisted."
        actionText="Back to Subjects"
        actionLink="/subjects"
      />
    );
  }

  const completedCount = classes.filter((c) => userProgress[c.id]?.completed).length;
  const isAllClassesCompleted = classes.length > 0 && completedCount >= classes.length;
  const nextUpClass = classes.find((c) => !userProgress[c.id]?.completed) || classes[0];
  const nextClassProgress = nextUpClass ? userProgress[nextUpClass.id] : null;

  const isExamUnlocked = isAllClassesCompleted || Boolean(chapterProgress?.examUnlocked);
  const isMastered = Boolean(chapterProgress?.mastered);
  const isPassed = Boolean(chapterProgress?.examPassed);

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-1">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/subjects" className="hover:text-indigo-600 transition-colors">
          Subjects
        </Link>
        {subject && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to={`/subject/${subject.id}`} className="hover:text-indigo-600 transition-colors truncate">
              {subject.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate">{chapter.name}</span>
      </nav>

      {/* Chapter Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {subject && (
                <Link
                  to={`/subject/${subject.id}`}
                  className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {subject.name}
                </Link>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isMastered
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : isPassed
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isExamUnlocked
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    : completedCount > 0
                    ? 'bg-sky-100 text-sky-900'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isMastered
                  ? '★ Mastered'
                  : isPassed
                  ? '✓ Passed'
                  : isExamUnlocked
                  ? '⚡ Exam Unlocked'
                  : completedCount > 0
                  ? '▶ In Progress'
                  : '○ Not Started'}
              </span>

              {textbook && (
                <a
                  href={textbook.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Book className="w-3.5 h-3.5 text-indigo-600" />
                  <span>NCTB Textbook</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {chapter.name}
            </h1>

            {chapter.description && (
              <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
                {chapter.description}
              </p>
            )}
          </div>

          {/* Quick Action Button */}
          {nextUpClass && (
            <Link
              to={`/class/${nextUpClass.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {nextClassProgress && nextClassProgress.positionSeconds > 10
                  ? `Resume Class #${nextUpClass.classNumber} (${formatResumePosition(nextClassProgress.positionSeconds)})`
                  : completedCount > 0
                  ? 'Continue Next Lesson'
                  : 'Start Chapter'}
              </span>
            </Link>
          )}
        </div>

        {/* Progress bar */}
        {currentUser && classes.length > 0 && (
          <div className="pt-4 border-t border-slate-100 max-w-md">
            <ProgressBar completed={completedCount} total={classes.length} />
          </div>
        )}
      </div>

      {/* 2. AUTOMATIC CHAPTER TEST UNLOCKED BANNER */}
      {isExamUnlocked && examConfig && examConfig.enabled !== false && (
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold shrink-0 shadow-md">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 font-bold text-[11px] mb-1">
                <span>All Required Lessons Completed!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Chapter Test Unlocked
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
                {examConfig.questionCount} Authenticated MCQs • {Math.round(examConfig.durationSeconds / 60)} Minutes • {examConfig.passMark}% Pass Mark
              </p>
            </div>
          </div>

          <Link
            to={`/exam/${chapter.id}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02]"
          >
            <span>Start Chapter Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. Classes roadmap list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Structured Class Sequence
          </h2>
          <Link
            to={`/clear-buddy?subject=${encodeURIComponent(subject?.name || '')}&chapter=${encodeURIComponent(chapter.name)}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Clear Buddy about this chapter
          </Link>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No classes added to this chapter yet"
            description={
              isAdmin
                ? "Click below to add video classes to this chapter."
                : "The video lectures are being curated for this chapter."
            }
            actionText={isAdmin ? "Add Class" : undefined}
            actionLink={isAdmin ? `/admin/classes/new?chapterId=${chapter.id}&subjectId=${chapter.subjectId}` : undefined}
          />
        ) : (
          <div className="space-y-3">
            {classes.map((cls, idx) => {
              const prog = userProgress[cls.id];
              const isCompleted = prog?.completed;
              const isNext = nextUpClass?.id === cls.id && !isCompleted;

              return (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className={`group p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : isNext
                      ? 'bg-indigo-50/40 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Class Order badge or checkmark */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isNext ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{cls.classNumber || idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail preview */}
                    <div className="relative aspect-video w-24 sm:w-28 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={getYouTubeThumbnailUrl(cls.youtubeId, 'mq')}
                        alt={cls.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white drop-shadow" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-0.5">
                        <span>Class {cls.classNumber}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-normal">{cls.teacher}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                        {cls.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          {cls.durationSeconds ? formatDuration(cls.durationSeconds) : (cls.duration || 'Lecture')}
                        </span>
                        {prog && <ResumeBadge progress={prog} size="sm" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {isCompleted ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-3 py-1 rounded-full">
                        Completed
                      </span>
                    ) : isNext ? (
                      <span className="text-xs font-bold text-white bg-indigo-600 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                        Up Next <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                        Start Class <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

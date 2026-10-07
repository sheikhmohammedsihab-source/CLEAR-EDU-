import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Layers,
  ChevronRight,
  ShieldCheck,
  Bookmark,
  BarChart3,
  Play,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getSubjects,
  getClasses,
  getChapters,
  getPlaylists,
  getUserProgress,
  getLiveClasses,
} from '../lib/database';
import { SubjectIcon } from '../components/SubjectIcon';
import { PlaylistCard } from '../components/PlaylistCard';
import { ProgressBar } from '../components/ProgressBar';
import { ResumeBadge } from '../components/ResumeBadge';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { getYouTubeThumbnailUrl, formatResumePosition, formatDuration } from '../lib/youtube';
import type { Subject, ClassItem, Chapter, Playlist, UserProgressMap, LiveClass } from '../types';

export const Home: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        setLoading(true);
        const [fetchedSubjects, fetchedChapters, fetchedPlaylists, fetchedClasses, fetchedLive] = await Promise.all([
          getSubjects(),
          getChapters(),
          getPlaylists(),
          getClasses(),
          getLiveClasses({ approvedOnly: true }),
        ]);

        if (!isMounted) return;

        setSubjects(fetchedSubjects.filter((s) => s.published !== false));
        setChapters(fetchedChapters.filter((c) => c.published !== false));
        setPlaylists(fetchedPlaylists.filter((p) => p.published !== false));
        setClasses(fetchedClasses.filter((cl) => cl.published !== false));
        setLiveClasses(fetchedLive);

        if (currentUser) {
          const progress = await getUserProgress(currentUser.uid);
          if (isMounted) setUserProgress(progress);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return <Loading text="Preparing your study space..." />;
  }

  const totalClassesCount = classes.length;
  const completedClassesCount = Object.values(userProgress).filter((p) => p.completed).length;

  // Continue Learning class
  let continueClass: ClassItem | null = null;
  if (currentUser && classes.length > 0) {
    const watchedEntries = Object.entries(userProgress)
      .filter(([_, data]) => data.lastWatchedAt)
      .sort((a, b) => (b[1].lastWatchedAt || 0) - (a[1].lastWatchedAt || 0));

    if (watchedEntries.length > 0) {
      const incompleteRecent = watchedEntries.find(([_, d]) => !d.completed);
      const targetId = incompleteRecent ? incompleteRecent[0] : watchedEntries[0][0];
      continueClass = classes.find((c) => c.id === targetId) || null;
    }

    if (!continueClass && classes.length > 0) {
      continueClass = classes[0];
    }
  }

  const continueClassProgress = continueClass ? userProgress[continueClass.id] : null;

  // Featured / Recommended Playlists
  const featuredPlaylists = playlists.filter((p) => p.featured || true).slice(0, 3);

  // Recommended classes: featured or first 4
  const recommendedClasses = classes.filter((c) => c.featured || true).slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO / WELCOME SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Curated Learning • Pure Academic Focus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Learn without the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-indigo-200">noise.</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            The best educational classes from YouTube, sequenced into structured courses and chapters.
            No recommendation rabbit holes, no Shorts distractions—just uninterrupted academic excellence.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Explore Curriculum
            </Link>

            {currentUser ? (
              <Link
                to="/progress"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                View Study Progress
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors"
              >
                Sign In to Save Progress
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs shadow-sm hover:bg-amber-300 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Quick Curriculum Counters */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-200">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-white font-bold text-base block">{subjects.length}</span>
              <span className="text-indigo-200/80">Subjects</span>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div>
              <span className="text-white font-bold text-base block">{playlists.length}</span>
              <span className="text-indigo-200/80">Courses</span>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div>
              <span className="text-white font-bold text-base block">{classes.length}</span>
              <span className="text-indigo-200/80">Classes</span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="font-semibold text-amber-300">SSC Curriculum</span>
            <span className="block text-[11px] text-indigo-200/70">Secondary School Certificate</span>
          </div>
        </div>
      </section>

      {/* 2. LIVE BROADCASTS SPOTLIGHT */}
      {liveClasses.length > 0 && (
        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                    {liveClasses.some((l) => l.status === 'LIVE_NOW') ? '🔴 LIVE NOW' : 'UPCOMING'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Verified Bangladesh Educational Streams
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-white mt-1 line-clamp-1">
                  {liveClasses[0].title}
                </h2>

                <p className="text-xs text-slate-300 mt-0.5">
                  Hosted by <strong className="text-white">{liveClasses[0].sourceName}</strong>
                  {liveClasses[0].teacher ? ` • Teacher: ${liveClasses[0].teacher}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              <Link
                to="/live-classes"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Join Live Classroom</span>
              </Link>

              <Link
                to="/live-classes"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <span>All Live ({liveClasses.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. CONTINUE LEARNING WITH EXACT RESUME POSITION */}
      {currentUser && continueClass && (
        <section className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-5 sm:p-6 transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Continue Learning</h2>
            </div>
            {continueClassProgress && (
              <ResumeBadge progress={continueClassProgress} size="sm" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="relative aspect-video w-full sm:w-48 rounded-xl overflow-hidden shrink-0 bg-slate-900">
              <img
                src={getYouTubeThumbnailUrl(continueClass.youtubeId, 'hq')}
                alt={continueClass.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-white drop-shadow-md" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                <span>Class #{continueClass.classNumber}</span>
                <span>•</span>
                <span className="text-slate-500 font-normal">{continueClass.teacher}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                {continueClass.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {continueClass.description}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <Link
                  to={`/class/${continueClass.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {continueClassProgress && continueClassProgress.positionSeconds > 10
                      ? `Resume from ${formatResumePosition(continueClassProgress.positionSeconds)}`
                      : 'Continue Watching'}
                  </span>
                </Link>
                {continueClassProgress?.completed && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED COURSES / PLAYLISTS */}
      {featuredPlaylists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Curated Course Playlists
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Complete chapter pathways designed to take you from basics to board questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPlaylists.map((pl) => {
              const plClasses = classes.filter((c) => c.playlistId === pl.id);
              const subObj = subjects.find((s) => s.id === pl.subjectId);
              const chapObj = chapters.find((c) => c.id === pl.chapterId);

              return (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  classes={plClasses}
                  subject={subObj}
                  chapter={chapObj}
                  userProgress={userProgress}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 4. SUBJECTS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              SSC Academic Subjects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a subject to begin your structured chapter sequence.
            </p>
          </div>
          <Link
            to="/subjects"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects available yet"
            description={
              isAdmin
                ? "As an Admin, you can add subjects now or seed the standard SSC curriculum with 1-click."
                : "Subjects are being curated. Please check back shortly."
            }
            actionText={isAdmin ? "Open Admin CMS" : undefined}
            actionLink={isAdmin ? "/admin" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((subject) => {
              const subjectChapters = chapters.filter((c) => c.subjectId === subject.id);
              const subjectClasses = classes.filter((c) => c.subjectId === subject.id);
              const completedCount = subjectClasses.filter((c) => userProgress[c.id]?.completed).length;

              return (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="group bg-white rounded-3xl border border-slate-200/90 p-5 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <SubjectIcon iconName={subject.icon} className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {subjectChapters.length} ch
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {subject.description || 'Structured academic curriculum and lessons.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{subjectClasses.length} curated classes</span>
                    {currentUser && subjectClasses.length > 0 && (
                      <span className="font-semibold text-indigo-600">
                        {completedCount}/{subjectClasses.length} done
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. RECOMMENDED / ESSENTIAL CLASSES */}
      {recommendedClasses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Recommended Classes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Fundamental lessons recommended by experienced educators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedClasses.map((item) => {
              const prog = userProgress[item.id];
              const isDone = prog?.completed;

              return (
                <Link
                  key={item.id}
                  to={`/class/${item.id}`}
                  className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={getYouTubeThumbnailUrl(item.youtubeId, 'hq')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-white/90 group-hover:scale-110 transition-transform drop-shadow" />
                    </div>
                    {item.durationSeconds && (
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    )}
                    {isDone && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                        Class #{item.classNumber}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="line-clamp-1">{item.teacher}</span>
                      <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                        Watch <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. PLATFORM ETHICS BANNER */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            Distraction-Free Architecture
          </span>
          <h3 className="text-2xl font-extrabold mt-1 text-white">
            Designed for 2-5 Hour Study Sessions
          </h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            YouTube hosts thousands of high-yield lectures, but its recommendation algorithms are built to distract.
            CLEAR EDU remembers your exact playback position across devices, attaches study slides &amp; PDFs, and guides you to the next lesson seamlessly.
          </p>
        </div>
      </section>
    </div>
  );
};

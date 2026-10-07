import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  User,
  Share2,
  Sparkles,
  Play
} from 'lucide-react';
import {
  getPlaylist,
  getSubject,
  getChapter,
  getClasses,
  getUserProgress,
} from '../lib/database';
import { formatDuration, formatResumePosition, getYouTubeThumbnailUrl } from '../lib/youtube';
import { ProgressBar } from '../components/ProgressBar';
import { ResumeBadge } from '../components/ResumeBadge';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type { Playlist, Subject, Chapter, ClassItem, UserProgressMap } from '../types';

export const PlaylistPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!playlistId) return;
      try {
        setLoading(true);
        const pl = await getPlaylist(playlistId);
        if (!pl) {
          if (isMounted) setLoading(false);
          return;
        }

        const [subj, chap, classList] = await Promise.all([
          getSubject(pl.subjectId),
          getChapter(pl.chapterId),
          getClasses(undefined, undefined, playlistId),
        ]);

        if (!isMounted) return;

        setPlaylist(pl);
        setSubject(subj);
        setChapter(chap);
        setClasses(classList.filter((c) => c.published !== false));

        if (currentUser) {
          const prog = await getUserProgress(currentUser.uid);
          if (isMounted) setUserProgress(prog);
        }
      } catch (err) {
        console.error('Error loading playlist:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [playlistId, currentUser]);

  if (loading) {
    return <Loading text="Loading curated learning playlist..." />;
  }

  if (!playlist) {
    return (
      <EmptyState
        title="Playlist Not Found"
        description="This playlist does not exist or may have been unlisted."
        actionText="Browse Subjects"
        actionLink="/subjects"
      />
    );
  }

  const totalClasses = classes.length;
  const completedClasses = classes.filter((c) => userProgress[c.id]?.completed);
  const completedCount = completedClasses.length;
  const totalDurationSeconds = classes.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

  // Distinct teachers in this playlist
  const teachers = Array.from(new Set(classes.map((c) => c.teacher).filter(Boolean)));

  // Identify next unfinished class
  const nextClass = classes.find((c) => !userProgress[c.id]?.completed) || classes[0];
  const nextClassProgress = nextClass ? userProgress[nextClass.id] : null;

  const handleContinuePlaylist = () => {
    if (nextClass) {
      navigate(`/class/${nextClass.id}`);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Navigation */}
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
        {chapter && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to={`/chapter/${chapter.id}`} className="hover:text-indigo-600 transition-colors truncate">
              {chapter.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate">{playlist.title}</span>
      </nav>

      {/* Playlist Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Thumbnail preview */}
          <div className="relative aspect-video w-full lg:w-80 rounded-2xl overflow-hidden bg-slate-900 shrink-0 shadow-md">
            {playlist.thumbnailUrl || (classes[0]?.youtubeId ? (
              <img
                src={playlist.thumbnailUrl || getYouTubeThumbnailUrl(classes[0].youtubeId, 'hq')}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : null)}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-white drop-shadow-md" />
            </div>
            {totalDurationSeconds > 0 && (
              <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(totalDurationSeconds)}</span>
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {subject && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {subject.name}
                  </span>
                )}
                {chapter && (
                  <span className="text-xs font-medium text-slate-500">
                    {chapter.name}
                  </span>
                )}
                {playlist.featured && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                    Featured Curriculum
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {playlist.title}
              </h1>

              {playlist.description && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {playlist.description}
                </p>
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL CLASSES</span>
                <span className="font-extrabold text-slate-900 text-base">{totalClasses} Lessons</span>
              </div>
              {totalDurationSeconds > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">COURSE DURATION</span>
                  <span className="font-extrabold text-slate-900 text-base">{formatDuration(totalDurationSeconds)}</span>
                </div>
              )}
              {teachers.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">INSTRUCTORS</span>
                  <span className="font-bold text-slate-800 text-xs">{teachers.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Progress & Continue Learning Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {nextClass && (
                <button
                  type="button"
                  onClick={handleContinuePlaylist}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {completedCount === totalClasses && totalClasses > 0
                      ? 'Watch Again from Start'
                      : nextClassProgress && nextClassProgress.positionSeconds > 10
                      ? `Continue Class #${nextClass.classNumber} from ${formatResumePosition(nextClassProgress.positionSeconds)}`
                      : `Continue Playlist (Class #${nextClass.classNumber})`}
                  </span>
                </button>
              )}

              {totalClasses > 0 && (
                <div className="w-full sm:w-64">
                  <ProgressBar completed={completedCount} total={totalClasses} size="md" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Class Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Curated Class Sequence
          </h2>
          <span className="text-xs text-slate-500">
            {completedCount} of {totalClasses} completed
          </span>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No classes added to this playlist yet"
            description="The instructor or admin has not populated this playlist yet."
          />
        ) : (
          <div className="space-y-3">
            {classes.map((cls, idx) => {
              const prog = userProgress[cls.id];
              const isDone = prog?.completed;
              const isUpNext = nextClass?.id === cls.id && !isDone;
              const hasPosition = prog && prog.positionSeconds > 5 && !isDone;

              return (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className={`group p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : isUpNext
                      ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Status Indicator */}
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                      {isDone ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isUpNext ? (
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          #{cls.classNumber || idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative aspect-video w-24 sm:w-28 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={getYouTubeThumbnailUrl(cls.youtubeId, 'mq')}
                        alt={cls.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white drop-shadow" />
                      </div>
                      {cls.durationSeconds && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-bold text-white px-1 py-0.2 rounded">
                          {formatDuration(cls.durationSeconds)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-0.5">
                        <span>Class #{cls.classNumber}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-normal">{cls.teacher}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {cls.title}
                      </h3>
                      {hasPosition && (
                        <div className="mt-1">
                          <ResumeBadge progress={prog} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isDone ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                        ✓ Completed
                      </span>
                    ) : isUpNext ? (
                      <span className="text-xs font-bold text-white bg-indigo-600 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                        Resume <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                        Watch <ChevronRight className="w-4 h-4" />
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

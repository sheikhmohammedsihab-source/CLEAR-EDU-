import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getSubject, getChapters, getPlaylists, getClasses, getUserProgress } from '../lib/database';
import { SubjectIcon } from '../components/SubjectIcon';
import { PlaylistCard } from '../components/PlaylistCard';
import { ProgressBar } from '../components/ProgressBar';
import { ResumeBadge } from '../components/ResumeBadge';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { getYouTubeThumbnailUrl, formatDuration } from '../lib/youtube';
import type { Subject, Chapter, Playlist, ClassItem, UserProgressMap } from '../types';

export const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSubjectData() {
      if (!subjectId) return;
      try {
        setLoading(true);
        const [subj, chapList, playList, classList] = await Promise.all([
          getSubject(subjectId),
          getChapters(subjectId),
          getPlaylists(subjectId),
          getClasses(undefined, subjectId),
        ]);

        if (!isMounted) return;

        setSubject(subj);
        setChapters(chapList.filter((c) => c.published !== false));
        setPlaylists(playList.filter((p) => p.published !== false));
        setClasses(classList.filter((cl) => cl.published !== false));

        if (currentUser) {
          const progress = await getUserProgress(currentUser.uid);
          if (isMounted) setUserProgress(progress);
        }
      } catch (err) {
        console.error('Failed to load subject:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubjectData();
    return () => {
      isMounted = false;
    };
  }, [subjectId, currentUser]);

  if (loading) {
    return <Loading text="Loading subject curriculum..." />;
  }

  if (!subject) {
    return (
      <EmptyState
        title="Subject Not Found"
        description="The requested subject could not be located or may have been unlisted."
        actionText="Back to Subjects"
        actionLink="/subjects"
      />
    );
  }

  const completedClasses = classes.filter((c) => userProgress[c.id]?.completed);

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-1">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/subjects" className="hover:text-indigo-600 transition-colors">
          Subjects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate">{subject.name}</span>
      </nav>

      {/* Subject Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <SubjectIcon iconName={subject.icon} className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                SSC Curriculum
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {playlists.length} {playlists.length === 1 ? 'Course' : 'Courses'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.name}
            </h1>

            {subject.description && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
                {subject.description}
              </p>
            )}

            {currentUser && classes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 max-w-md">
                <ProgressBar
                  completed={completedClasses.length}
                  total={classes.length}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Subject Playlists (if any) */}
      {playlists.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Curated Course Playlists</span>
            </h2>
            <span className="text-xs text-slate-500">
              {playlists.length} structured courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.map((pl) => {
              const plClasses = classes.filter((c) => c.playlistId === pl.id);
              const chap = chapters.find((c) => c.id === pl.chapterId);

              return (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  classes={plClasses}
                  subject={subject}
                  chapter={chap}
                  userProgress={userProgress}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Chapters & Class Roadmap */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Chapters &amp; Lessons</h2>
          <span className="text-xs text-slate-500">
            Study in sequential order for best results
          </span>
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No chapters available yet"
            description={
              isAdmin
                ? "You can add chapters to this subject in the Admin CMS."
                : "Chapters for this subject are currently being organized."
            }
            actionText={isAdmin ? "Add Chapter" : undefined}
            actionLink={isAdmin ? `/admin/chapters?subject=${subject.id}` : undefined}
          />
        ) : (
          <div className="space-y-5">
            {chapters.map((chapter, idx) => {
              const chapterClasses = classes.filter((c) => c.chapterId === chapter.id);
              const chapterPlaylists = playlists.filter((p) => p.chapterId === chapter.id);
              const chapterCompleted = chapterClasses.filter((c) => userProgress[c.id]?.completed).length;
              const isAllDone = chapterClasses.length > 0 && chapterCompleted === chapterClasses.length;

              return (
                <div
                  key={chapter.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* Chapter Title Bar */}
                  <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <Link
                          to={`/chapter/${chapter.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base"
                        >
                          {chapter.name}
                        </Link>
                        {chapter.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {chapterPlaylists.length > 0 && (
                        <Link
                          to={`/playlist/${chapterPlaylists[0].id}`}
                          className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Course Playlist
                        </Link>
                      )}

                      {currentUser && chapterClasses.length > 0 && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          isAllDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {chapterCompleted} / {chapterClasses.length} Completed
                        </span>
                      )}

                      <Link
                        to={`/chapter/${chapter.id}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Chapter View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Chapter Classes List */}
                  <div className="p-4 sm:p-5">
                    {chapterClasses.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No classes added to this chapter yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {chapterClasses.map((item) => {
                          const prog = userProgress[item.id];
                          const isCompleted = prog?.completed;

                          return (
                            <Link
                              key={item.id}
                              to={`/class/${item.id}`}
                              className={`group p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                                isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                                  : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20'
                              }`}
                            >
                              <div className="relative aspect-video w-24 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                                <img
                                  src={getYouTubeThumbnailUrl(item.youtubeId, 'mq')}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <PlayCircle className="w-6 h-6 text-white drop-shadow" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase mb-0.5">
                                  <span>Class #{item.classNumber}</span>
                                  <span>•</span>
                                  <span className="text-slate-500 font-normal truncate">
                                    {item.teacher}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                  {item.title}
                                </h4>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">
                                    {item.durationSeconds ? formatDuration(item.durationSeconds) : (item.duration || 'Video lecture')}
                                  </span>
                                  {isCompleted ? (
                                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                    </span>
                                  ) : prog && prog.positionSeconds > 5 ? (
                                    <ResumeBadge progress={prog} size="sm" />
                                  ) : (
                                    <span className="text-[11px] font-semibold text-indigo-600 group-hover:underline">
                                      Watch
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

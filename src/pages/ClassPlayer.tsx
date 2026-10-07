import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  User,
  Clock,
  Share2,
  ExternalLink,
  Play,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  FileText,
  Copy,
  Check,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getClass,
  getChapter,
  getSubject,
  getClasses,
  getPlaylist,
  getResources,
  getProgress,
  savePlaybackProgress,
  markClassComplete,
  getBookmarks,
  saveBookmark,
  removeBookmark,
  getUserProgress,
  evaluateAndSyncChapterCompletion,
} from '../lib/database';
import { formatDuration, formatResumePosition } from '../lib/youtube';
import { VideoPlayer } from '../components/VideoPlayer';
import { ResourceList } from '../components/ResourceList';
import { ResumeBadge } from '../components/ResumeBadge';
import { StudyTimer } from '../components/StudyTimer';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type {
  ClassItem,
  Chapter,
  Subject,
  Playlist,
  ClassResource,
  ClassProgress,
  UserProgressMap,
  BookmarkMap
} from '../types';

export const ClassPlayer: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentClass, setCurrentClass] = useState<ClassItem | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [siblingClasses, setSiblingClasses] = useState<ClassItem[]>([]);
  const [resources, setResources] = useState<ClassResource[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<UserProgressMap>({});
  const [currentProgress, setCurrentProgress] = useState<ClassProgress | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Local Browser Storage Note-Taking Feature
  const [notes, setNotes] = useState<string>('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saved'>('idle');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    if (!classId) return;
    try {
      const stored = localStorage.getItem(`clearedu_notes_${classId}`);
      setNotes(stored || '');
      setNoteStatus('idle');
      setShowConfirmClear(false);
    } catch (e) {
      console.warn('Could not read notes from storage:', e);
    }
  }, [classId]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    if (!classId) return;
    try {
      localStorage.setItem(`clearedu_notes_${classId}`, val);
      setNoteStatus('saved');
    } catch (err) {
      console.warn('Could not save notes:', err);
    }
  };

  const handleCopyNotes = () => {
    if (!notes.trim()) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(notes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    }
  };

  const handleConfirmClearNotes = () => {
    if (!classId) return;
    try {
      localStorage.removeItem(`clearedu_notes_${classId}`);
      setNotes('');
      setNoteStatus('idle');
      setShowConfirmClear(false);
    } catch (err) {
      console.warn('Could not clear notes:', err);
    }
  };

  // Main data loader
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!classId) return;
      try {
        setLoading(true);
        const cls = await getClass(classId);
        if (!cls) {
          if (isMounted) setLoading(false);
          return;
        }

        const [chap, subj, play, resList, siblings] = await Promise.all([
          getChapter(cls.chapterId),
          getSubject(cls.subjectId),
          cls.playlistId ? getPlaylist(cls.playlistId) : Promise.resolve(null),
          getResources(classId),
          getClasses(cls.chapterId, undefined, cls.playlistId || undefined),
        ]);

        if (!isMounted) return;

        setCurrentClass(cls);
        setChapter(chap);
        setSubject(subj);
        setPlaylist(play);
        setResources(resList.filter((r) => r.published !== false));
        setSiblingClasses(siblings.filter((s) => s.published !== false));

        // Load progress & bookmarks for student
        if (currentUser) {
          const [prog, allProg, allBookmarks] = await Promise.all([
            getProgress(currentUser.uid, classId),
            getUserProgress(currentUser.uid),
            getBookmarks(currentUser.uid),
          ]);

          if (!isMounted) return;
          setCurrentProgress(prog);
          setUserProgressMap(allProg);
          setIsBookmarked(Boolean(allBookmarks[classId]));
        }
      } catch (err) {
        console.error('Error loading class player:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [classId, currentUser]);

  const [watchAgainKey, setWatchAgainKey] = useState(0);

  // Video Player Event Handlers
  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!currentUser || !classId) return;
      savePlaybackProgress(currentUser.uid, classId, {
        positionSeconds: currentTime,
        durationSeconds: duration,
      }).catch(console.error);

      setCurrentProgress((prev) => ({
        positionSeconds: Math.floor(currentTime),
        durationSeconds: duration ? Math.floor(duration) : prev?.durationSeconds,
        completed: prev?.completed || false,
        lastWatchedAt: Date.now(),
      }));
    },
    [currentUser, classId]
  );

  const handlePaused = useCallback(
    (currentTime: number) => {
      if (!currentUser || !classId) return;
      savePlaybackProgress(currentUser.uid, classId, {
        positionSeconds: currentTime,
      }).catch(console.error);
    },
    [currentUser, classId]
  );

  const handleEnded = useCallback(() => {
    if (!currentUser || !classId) return;
    markClassComplete(currentUser.uid, classId, true).catch(console.error);
    if (currentClass?.chapterId) {
      evaluateAndSyncChapterCompletion(currentUser.uid, currentClass.chapterId).catch(console.error);
    }
    setCurrentProgress((prev) => ({
      positionSeconds: prev?.positionSeconds || 0,
      durationSeconds: prev?.durationSeconds,
      completed: true,
      completedAt: Date.now(),
      lastWatchedAt: Date.now(),
    }));
    setUserProgressMap((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        positionSeconds: prev[classId]?.positionSeconds || 0,
        completed: true,
        completedAt: Date.now(),
        lastWatchedAt: Date.now(),
      },
    }));
  }, [currentUser, classId, currentClass]);

  const handleWatchAgain = async () => {
    if (!currentUser || !classId) return;
    try {
      await savePlaybackProgress(currentUser.uid, classId, {
        positionSeconds: 0,
        completed: true,
      });
      setCurrentProgress((prev) => ({
        ...prev,
        positionSeconds: 0,
        completed: true,
      }));
      setWatchAgainKey((k) => k + 1);
    } catch (e) {
      console.warn('Watch again error:', e);
    }
  };

  if (loading) {
    return <Loading text="Preparing official YouTube lesson stream..." />;
  }

  if (!currentClass) {
    return (
      <EmptyState
        title="Class Not Found"
        description="The class you are looking for does not exist or has been unlisted."
        actionText="Browse Subjects"
        actionLink="/subjects"
      />
    );
  }

  // Playlist navigation
  const currentIndex = siblingClasses.findIndex((c) => c.id === currentClass.id);
  const prevClass = currentIndex > 0 ? siblingClasses[currentIndex - 1] : null;
  const nextClass =
    currentIndex >= 0 && currentIndex < siblingClasses.length - 1
      ? siblingClasses[currentIndex + 1]
      : null;

  const isCompleted = Boolean(currentProgress?.completed);
  const savedPosition = currentProgress?.positionSeconds || 0;

  const handleToggleComplete = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/class/${currentClass.id}` } } });
      return;
    }

    try {
      setActionLoading(true);
      const nextStatus = !isCompleted;
      await markClassComplete(currentUser.uid, currentClass.id, nextStatus);
      if (nextStatus && currentClass.chapterId) {
        evaluateAndSyncChapterCompletion(currentUser.uid, currentClass.chapterId).catch(console.error);
      }

      setCurrentProgress((prev) => ({
        positionSeconds: prev?.positionSeconds || 0,
        completed: nextStatus,
        completedAt: nextStatus ? Date.now() : null,
        lastWatchedAt: Date.now(),
      }));

      setUserProgressMap((prev) => ({
        ...prev,
        [currentClass.id]: {
          ...prev[currentClass.id],
          completed: nextStatus,
          completedAt: nextStatus ? Date.now() : null,
          lastWatchedAt: Date.now(),
        },
      }));
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: `/class/${currentClass.id}` } } });
      return;
    }

    try {
      if (isBookmarked) {
        await removeBookmark(currentUser.uid, currentClass.id);
        setIsBookmarked(false);
      } else {
        await saveBookmark(currentUser.uid, currentClass.id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Breadcrumb Path */}
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
        {playlist && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to={`/playlist/${playlist.id}`} className="hover:text-indigo-600 transition-colors truncate">
              {playlist.title}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate">Class #{currentClass.classNumber}</span>
      </nav>

      {/* 2. Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video Player, Action Bar, Details & Materials (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Official YouTube IFrame Player */}
          <VideoPlayer
            key={`${currentClass.youtubeId}-${watchAgainKey}`}
            videoId={currentClass.youtubeId}
            initialTimeSeconds={savedPosition}
            onTimeUpdate={handleTimeUpdate}
            onPaused={handlePaused}
            onEnded={handleEnded}
          />

          {/* Action Bar: Complete Button, Resume status, Next/Prev, Bookmark */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={actionLoading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-50`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✓ Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>

              {/* Watch Again button (must start from 0) */}
              {isCompleted && (
                <button
                  type="button"
                  onClick={handleWatchAgain}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Watch lesson again from 0:00"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Watch Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={isBookmarked ? 'Remove from Saved' : 'Save class for later'}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>Save</span>
                  </>
                )}
              </button>

              <Link
                to={`/clear-buddy?subject=${encodeURIComponent(subject?.name || '')}&chapter=${encodeURIComponent(chapter?.name || '')}&class=${encodeURIComponent(currentClass.title)}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                title="Ask Clear Buddy about this lesson"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask Clear Buddy</span>
              </Link>

              {/* Resume / Progress badge */}
              <ResumeBadge progress={currentProgress} />
            </div>

            {/* Previous & Next Navigation */}
            <div className="flex items-center gap-2">
              {prevClass ? (
                <Link
                  to={`/class/${prevClass.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-50 cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
              )}

              {nextClass ? (
                <Link
                  to={`/class/${nextClass.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <span>Next Class</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to={playlist ? `/playlist/${playlist.id}` : chapter ? `/chapter/${chapter.id}` : '/subjects'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <span>Course Complete</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Class Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                  Class #{currentClass.classNumber}
                </span>
                {chapter && (
                  <span className="text-xs font-medium text-slate-500">
                    {chapter.name}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Class'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentClass.title}
            </h1>

            {/* Instructor & Duration */}
            <div className="flex flex-wrap items-center gap-6 py-3 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">INSTRUCTOR</span>
                  <span className="font-semibold text-slate-800">{currentClass.teacher}</span>
                </div>
              </div>

              {(currentClass.durationSeconds || currentClass.duration) && (
                <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">DURATION</span>
                    <span className="font-semibold text-slate-800">
                      {currentClass.durationSeconds ? formatDuration(currentClass.durationSeconds) : currentClass.duration}
                    </span>
                  </div>
                </div>
              )}

              <div className="ml-auto">
                <a
                  href={`https://www.youtube.com/watch?v=${currentClass.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Lesson Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lesson Overview
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {currentClass.description ||
                  'Follow along with the instructor in the video player above. Review attached handouts and take revision notes below.'}
              </p>
            </div>

            {/* Class Notes & Study Materials (PDFs, Slides, Handouts) */}
            <ResourceList resources={resources} />

            {/* Local Notes Section */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      My Lesson Notes &amp; Key Takeaways
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Saved automatically in this browser for quick revision.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {noteStatus === 'saved' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3" /> Auto-saved
                    </span>
                  )}

                  {notes.trim().length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyNotes}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy notes"
                      >
                        {copiedNotes ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {showConfirmClear ? (
                        <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-xs">
                          <span className="text-[11px] text-red-700 font-medium">Clear note?</span>
                          <button
                            type="button"
                            onClick={handleConfirmClearNotes}
                            className="text-[11px] font-bold text-red-700 hover:underline"
                          >
                            Yes
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setShowConfirmClear(false)}
                            className="text-[11px] text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowConfirmClear(true)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Clear notes"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Jot down formulas, derivations, key timestamps, or questions while learning..."
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{notes.length} characters</span>
                <span>Persisted in browser storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Study Timer & Sibling Playlist / Chapter Class Sequence (1 col) */}
        <div className="space-y-4">
          {/* Pomodoro Study Timer */}
          <StudyTimer />

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {playlist ? 'Course Playlist' : 'Chapter Sequence'}
                </span>
                <h2 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {playlist ? playlist.title : chapter ? chapter.name : 'Class Sequence'}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {siblingClasses.length} {siblingClasses.length === 1 ? 'class' : 'classes'}
              </span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {siblingClasses.map((item, index) => {
                const isItemActive = item.id === currentClass.id;
                const itemProgress = userProgressMap[item.id];
                const isItemDone = itemProgress?.completed;
                const itemHasPosition = itemProgress && itemProgress.positionSeconds > 5 && !isItemDone;

                return (
                  <Link
                    key={item.id}
                    to={`/class/${item.id}`}
                    className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                      isItemActive
                        ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-200'
                        : isItemDone
                        ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/60'
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isItemDone ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isItemActive ? (
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {item.classNumber || index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isItemActive
                            ? 'text-indigo-950 font-bold'
                            : 'text-slate-800 group-hover:text-indigo-600'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className="truncate">{item.teacher}</span>
                        {itemHasPosition && (
                          <span className="text-indigo-600 font-semibold font-mono text-[10px]">
                            {formatResumePosition(itemProgress.positionSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Distraction-Free Philosophy Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Interruption-Friendly Learning</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              Your exact playback position is saved automatically. You can close this tab and return anytime—CLEAR EDU will restore your exact spot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

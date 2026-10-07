import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, PlayCircle, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { getBookmarks, removeBookmark, getClasses, getUserProgress } from '../lib/database';
import { getYouTubeThumbnailUrl, formatDuration } from '../lib/youtube';
import { ResumeBadge } from '../components/ResumeBadge';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type { ClassItem, BookmarkMap, UserProgressMap } from '../types';

export const Saved: React.FC = () => {
  const { currentUser } = useAuth();
  const [savedClasses, setSavedClasses] = useState<ClassItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);

  const fetchSavedData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [allClasses, bookmarks, progress] = await Promise.all([
        getClasses(),
        getBookmarks(currentUser.uid),
        getUserProgress(currentUser.uid),
      ]);

      const filtered = allClasses.filter((c) => Boolean(bookmarks[c.id]));
      setSavedClasses(filtered);
      setUserProgress(progress);
    } catch (err) {
      console.error('Error loading saved classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, [currentUser]);

  const handleRemove = async (classId: string) => {
    if (!currentUser) return;
    try {
      await removeBookmark(currentUser.uid, classId);
      setSavedClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  if (loading) {
    return <Loading text="Loading your saved classes..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>My Library</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Classes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Bookmarked lessons for upcoming revision or deep-dive study.
        </p>
      </div>

      {savedClasses.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved classes yet"
          description="When you are watching a class, click the 'Save' button to bookmark it here for quick reference."
          actionText="Explore Subjects"
          actionLink="/subjects"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedClasses.map((item) => {
            const prog = userProgress[item.id];

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={getYouTubeThumbnailUrl(item.youtubeId, 'hq')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Link
                      to={`/class/${item.id}`}
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                    >
                      <PlayCircle className="w-12 h-12 text-white/90 drop-shadow" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-600 text-white rounded-xl backdrop-blur-xs transition-colors shadow-xs"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {item.durationSeconds && (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Class #{item.classNumber} • {item.teacher}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2">
                      {item.title}
                    </h3>
                    {prog && (
                      <div className="pt-1">
                        <ResumeBadge progress={prog} size="sm" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/class/${item.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>Open Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

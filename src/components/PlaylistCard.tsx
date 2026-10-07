import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Layers, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDuration } from '../lib/youtube';
import { ProgressBar } from './ProgressBar';
import type { Playlist, Subject, Chapter, ClassItem, UserProgressMap } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  classes: ClassItem[];
  subject?: Subject | null;
  chapter?: Chapter | null;
  userProgress?: UserProgressMap;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  classes,
  subject,
  chapter,
  userProgress = {},
  className = '',
}) => {
  const totalClasses = classes.length;
  const completedCount = classes.filter((c) => userProgress[c.id]?.completed).length;

  // Calculate total duration in seconds
  const totalDurationSeconds = classes.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

  // Thumbnail from playlist or first class
  const displayThumbnail =
    playlist.thumbnailUrl ||
    (classes[0]?.youtubeId ? `https://img.youtube.com/vi/${classes[0].youtubeId}/hqdefault.jpg` : '');

  // Find next class to watch (first uncompleted or first class)
  const nextClass = classes.find((c) => !userProgress[c.id]?.completed) || classes[0];

  return (
    <div className={`group bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between ${className}`}>
      <div>
        {/* Thumbnail Banner */}
        <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
          {displayThumbnail ? (
            <img
              src={displayThumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
              <Layers className="w-10 h-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform" />
          </div>

          {/* Badges on Thumbnail */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {subject && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-xs shadow-2xs">
                {subject.name}
              </span>
            )}
            {playlist.featured && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-amber-950 shadow-2xs">
                Featured Path
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/80 text-white backdrop-blur-xs flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{totalClasses} Classes</span>
            </span>
            {totalDurationSeconds > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/80 text-white backdrop-blur-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(totalDurationSeconds)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {chapter && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              {chapter.name}
            </p>
          )}

          <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {playlist.title}
          </h3>

          {playlist.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
              {playlist.description}
            </p>
          )}

          {/* Progress Bar if user has started */}
          {totalClasses > 0 && completedCount > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <ProgressBar completed={completedCount} total={totalClasses} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        <Link
          to={`/playlist/${playlist.id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs group-hover:shadow-md"
        >
          <span>{completedCount > 0 && completedCount < totalClasses ? 'Continue Playlist' : 'Explore Course'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

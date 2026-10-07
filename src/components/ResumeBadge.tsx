import React from 'react';
import { Play, CheckCircle2, Clock } from 'lucide-react';
import { formatResumePosition } from '../lib/youtube';
import type { ClassProgress } from '../types';

interface ResumeBadgeProps {
  progress?: ClassProgress | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const ResumeBadge: React.FC<ResumeBadgeProps> = ({
  progress,
  className = '',
  size = 'md',
}) => {
  if (!progress) return null;

  if (progress.completed) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Completed</span>
      </span>
    );
  }

  if (progress.positionSeconds && progress.positionSeconds > 5) {
    const formatted = formatResumePosition(progress.positionSeconds);
    const duration = progress.durationSeconds;
    const percentage = duration && duration > 0 ? Math.min(100, Math.round((progress.positionSeconds / duration) * 100)) : null;

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full ${
          size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Resume from {formatted}</span>
        {percentage !== null && <span className="text-indigo-400 font-normal">({percentage}%)</span>}
      </span>
    );
  }

  return null;
};

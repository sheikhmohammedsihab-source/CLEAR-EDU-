import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  showText = true,
  className = '',
  size = 'md',
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
          <span>{completed} of {total} classes completed</span>
          <span className="font-semibold text-indigo-600">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

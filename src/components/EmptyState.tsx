import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs my-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {actionText && (actionLink || onAction) && (
        <div className="mt-4">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

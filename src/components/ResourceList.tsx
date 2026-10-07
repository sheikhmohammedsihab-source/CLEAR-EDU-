import React from 'react';
import { FileText, FileSpreadsheet, Presentation, Link as LinkIcon, Download, ExternalLink, BookOpen } from 'lucide-react';
import type { ClassResource, ResourceType } from '../types';

interface ResourceListProps {
  resources: ClassResource[];
  className?: string;
}

const TYPE_ICONS: Record<ResourceType, React.ElementType> = {
  PDF: FileText,
  Slides: Presentation,
  Notes: BookOpen,
  Document: FileSpreadsheet,
  Link: LinkIcon,
};

const TYPE_BADGE_COLORS: Record<ResourceType, string> = {
  PDF: 'bg-red-50 text-red-700 border-red-200',
  Slides: 'bg-amber-50 text-amber-700 border-amber-200',
  Notes: 'bg-blue-50 text-blue-700 border-blue-200',
  Document: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Link: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const ResourceList: React.FC<ResourceListProps> = ({ resources, className = '' }) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Class Notes &amp; Study Materials ({resources.length})</span>
        </h3>
        <span className="text-[11px] text-slate-400">Authorized curriculum links</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resources.map((res) => {
          const Icon = TYPE_ICONS[res.type] || FileText;
          const badgeColor = TYPE_BADGE_COLORS[res.type] || 'bg-slate-50 text-slate-700 border-slate-200';

          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-slate-700 group-hover:text-indigo-600 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                      {res.type}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {res.title}
                  </h4>
                  {res.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {res.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-white border border-indigo-100 px-2.5 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-2xs">
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

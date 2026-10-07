import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, Layers, GraduationCap } from 'lucide-react';
import { getSubjects, getChapters, getClasses, getUserProgress } from '../lib/database';
import { SubjectIcon } from '../components/SubjectIcon';
import { ProgressBar } from '../components/ProgressBar';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { EDUCATION_LEVELS } from '../lib/constants';
import type { Subject, Chapter, ClassItem, UserProgressMap } from '../types';

export const Subjects: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ssc');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [subList, chapList, classList] = await Promise.all([
          getSubjects(),
          getChapters(),
          getClasses(),
        ]);

        if (!isMounted) return;
        setSubjects(subList.filter((s) => s.published !== false));
        setChapters(chapList.filter((c) => c.published !== false));
        setClasses(classList.filter((cl) => cl.published !== false));

        if (currentUser) {
          const progress = await getUserProgress(currentUser.uid);
          if (isMounted) setUserProgress(progress);
        }
      } catch (err) {
        console.error('Error loading subjects page:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  if (loading) {
    return <Loading text="Loading subjects..." />;
  }

  // Filter subjects by search query
  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curated Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose a subject to access organized chapter-wise video classes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Scalable Level Selector (SSC active, future expandable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {EDUCATION_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            disabled={!level.active}
            onClick={() => setSelectedLevel(level.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedLevel === level.id && level.active
                ? 'bg-indigo-600 text-white shadow-xs'
                : level.active
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed'
            }`}
          >
            {level.name} {!level.active && '(Coming Soon)'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? 'No matching subjects found' : 'No subjects available yet'}
          description={
            searchQuery
              ? `No subjects match "${searchQuery}". Try a different keyword.`
              : 'The curriculum is being prepared.'
          }
          actionText={isAdmin ? 'Add Subject in Admin CMS' : undefined}
          actionLink={isAdmin ? '/admin/subjects' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => {
            const subjectChapters = chapters.filter((c) => c.subjectId === subject.id);
            const subjectClasses = classes.filter((c) => c.subjectId === subject.id);
            const completedCount = subjectClasses.filter((c) => userProgress[c.id]?.completed).length;

            return (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="group bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <SubjectIcon iconName={subject.icon} className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {subjectChapters.length} {subjectChapters.length === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {subject.description || 'Systematic video lectures and exercises.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  {currentUser && subjectClasses.length > 0 ? (
                    <div className="space-y-2">
                      <ProgressBar
                        completed={completedCount}
                        total={subjectClasses.length}
                        size="sm"
                      />
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>{subjectClasses.length} classes</span>
                        <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Continue <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{subjectClasses.length} curated classes</span>
                      <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

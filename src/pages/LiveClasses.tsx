import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Play,
  X,
  Bookmark,
  Share2,
  Video,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { getLiveClasses, getSubjects } from '../lib/database';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import type { LiveClass, LiveClassStatus, Subject } from '../types';

export const LiveClasses: React.FC = () => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusTab, setStatusTab] = useState<'ALL' | 'LIVE_NOW' | 'TODAY_UPCOMING' | 'THIS_WEEK' | 'RECORDINGS'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Distraction-free watch modal
  const [activeWatchClass, setActiveWatchClass] = useState<LiveClass | null>(null);
  const [reminderSetMap, setReminderSetMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [liveData, subjectData] = await Promise.all([
          getLiveClasses(),
          getSubjects(),
        ]);
        setClasses(liveData);
        setSubjects(subjectData);
      } catch (err) {
        console.error('Error loading live classes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const liveNowCount = useMemo(
    () => classes.filter((c) => c.status === 'LIVE_NOW' && c.approvalStatus === 'APPROVED').length,
    [classes]
  );

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (c.approvalStatus !== 'APPROVED') return false;

      // Status tab
      if (statusTab === 'LIVE_NOW' && c.status !== 'LIVE_NOW') return false;
      if (statusTab === 'TODAY_UPCOMING' && c.status !== 'UPCOMING' && c.status !== 'TODAY') return false;
      if (statusTab === 'THIS_WEEK' && c.status !== 'THIS_WEEK') return false;
      if (statusTab === 'RECORDINGS' && c.status !== 'RECORDING_AVAILABLE' && c.status !== 'ENDED') return false;

      // Subject
      if (selectedSubject !== 'ALL' && c.subjectId !== selectedSubject) return false;

      // Platform
      if (selectedPlatform !== 'ALL' && c.platform !== selectedPlatform) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(query);
        const matchTeacher = c.teacher?.toLowerCase().includes(query) ?? false;
        const matchSource = c.sourceName.toLowerCase().includes(query);
        if (!matchTitle && !matchTeacher && !matchSource) return false;
      }

      return true;
    });
  }, [classes, statusTab, selectedSubject, selectedPlatform, searchQuery]);

  const handleToggleReminder = (classId: string) => {
    setReminderSetMap((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const formatScheduledTime = (timeMs: number) => {
    const date = new Date(timeMs);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  if (loading) {
    return <Loading text="Loading official Bangladesh educational live classes..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 mb-3">
            <Radio className="w-4 h-4 animate-pulse text-red-400" />
            <span>Verified Bangladesh Educational Broadcasts</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Classes &amp; Broadcasts
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Attend live interactive lectures from verified Bangladesh educational channels (10 Minute School, Shikho, Onnorokom Pathshala) without distracting feeds, clickbait, or social media noise.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              {liveNowCount} Live Right Now
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Curated NCTB Class 9–10 &amp; SSC Only
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Distraction-Free Dedicated Player
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Status Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setStatusTab('ALL')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              statusTab === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Broadcasts ({classes.filter((c) => c.approvalStatus === 'APPROVED').length})
          </button>

          <button
            onClick={() => setStatusTab('LIVE_NOW')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusTab === 'LIVE_NOW'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE NOW</span>
            {liveNowCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-red-600 rounded-full text-[10px]">
                {liveNowCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusTab('TODAY_UPCOMING')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusTab === 'TODAY_UPCOMING'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today &amp; Upcoming</span>
          </button>

          <button
            onClick={() => setStatusTab('THIS_WEEK')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusTab === 'THIS_WEEK'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>This Week</span>
          </button>

          <button
            onClick={() => setStatusTab('RECORDINGS')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusTab === 'RECORDINGS'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Recordings</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class title, teacher, or topic..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Sources &amp; Platforms</option>
              <option value="YOUTUBE">YouTube Channels (10MS, Shikho, Onnorokom)</option>
              <option value="FACEBOOK">Facebook Verified Pages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No live broadcasts match the criteria"
          description="Try selecting a different status filter, subject, or search keyword."
          actionText="Reset Filters"
          onAction={() => {
            setStatusTab('ALL');
            setSelectedSubject('ALL');
            setSelectedPlatform('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((item) => {
            const isLive = item.status === 'LIVE_NOW';
            const isReminderSet = reminderSetMap[item.id];
            const subjectObj = subjects.find((s) => s.id === item.subjectId);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/30" />

                  {/* Status Indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-[11px] font-extrabold rounded-lg shadow-md animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        LIVE NOW
                      </span>
                    ) : item.status === 'TODAY' || item.status === 'UPCOMING' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-lg shadow-sm">
                        <Clock className="w-3 h-3" />
                        TODAY
                      </span>
                    ) : item.status === 'THIS_WEEK' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-sm">
                        <Calendar className="w-3 h-3" />
                        THIS WEEK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-slate-100 text-[11px] font-bold rounded-lg shadow-sm">
                        <Video className="w-3 h-3" />
                        RECORDING
                      </span>
                    )}

                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md uppercase">
                      {item.platform}
                    </span>
                  </div>

                  {/* Play Action Overlay */}
                  <button
                    onClick={() => setActiveWatchClass(item)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-2xs cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/95 text-indigo-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-indigo-600 ml-0.5" />
                    </div>
                  </button>

                  {/* Bottom info banner on thumbnail */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                    <span className="font-semibold truncate max-w-[70%]">{item.sourceName}</span>
                    <span className="text-slate-300 font-mono text-[10px]">
                      {formatScheduledTime(item.scheduledStartTime)}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Subject badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {subjectObj && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                          {subjectObj.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">Class 9–10 / SSC</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    {item.teacher && (
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                        <span>Teacher:</span>
                        <span className="text-slate-700 font-semibold">{item.teacher}</span>
                      </p>
                    )}

                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveWatchClass(item)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        isLive
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isLive ? 'Watch Live Now' : 'Distraction-Free Player'}</span>
                    </button>

                    {!isLive && (
                      <button
                        onClick={() => handleToggleReminder(item.id)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          isReminderSet
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isReminderSet ? 'Reminder Set' : 'Set Class Reminder'}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      to={`/clear-buddy?query=${encodeURIComponent(
                        `I am studying from live class "${item.title}". Can you explain the main concepts and formulas step-by-step?`
                      )}`}
                      className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      title="Ask Clear Buddy about this live class"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Distraction-Free Embedded Watch Modal */}
      {activeWatchClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {activeWatchClass.status === 'LIVE_NOW' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white text-[11px] font-extrabold rounded-lg animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    LIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg">
                    CLASSROOM
                  </span>
                )}
                <div>
                  <h2 className="text-sm sm:text-base font-bold line-clamp-1">{activeWatchClass.title}</h2>
                  <p className="text-xs text-slate-400">
                    {activeWatchClass.sourceName} • {activeWatchClass.teacher || 'Verified Educator'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveWatchClass(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeWatchClass.embedUrl}
                title={activeWatchClass.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Focus Mode:</span>
                  <span className="text-emerald-400 font-semibold">Active — Zero Social Feeds</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Algorithms, related recommendations, and sidebars are blocked to protect your study attention.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to={`/clear-buddy?query=${encodeURIComponent(
                    `I'm currently watching "${activeWatchClass.title}". Could you summarize the core formula derivations and key board exam takeaways?`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ask Clear Buddy</span>
                </Link>

                <a
                  href={activeWatchClass.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Stream Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

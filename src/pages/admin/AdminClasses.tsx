import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Video,
  PlayCircle,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import {
  getClasses,
  getSubjects,
  getChapters,
  getPlaylists,
  deleteClass,
  updateClass,
} from '../../lib/database';
import { getYouTubeThumbnailUrl, formatDuration } from '../../lib/youtube';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import type { ClassItem, Subject, Chapter, Playlist } from '../../types';

export const AdminClasses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  const initialChapter = searchParams.get('chapter') || '';
  const initialPlaylist = searchParams.get('playlist') || '';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedPlaylist, setSelectedPlaylist] = useState(initialPlaylist);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classList, subList, chapList, playList] = await Promise.all([
        getClasses(),
        getSubjects(),
        getChapters(),
        getPlaylists(),
      ]);
      setClasses(classList);
      setSubjects(subList);
      setChapters(chapList);
      setPlaylists(playList);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteClass(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete class:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (item: ClassItem) => {
    try {
      const nextStatus = item.published === false ? true : false;
      await updateClass(item.id, { published: nextStatus });
      setClasses((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, published: nextStatus } : c))
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  if (loading) {
    return <Loading text="Loading classes..." />;
  }

  const availableChapters = selectedSubject
    ? chapters.filter((c) => c.subjectId === selectedSubject)
    : chapters;

  const availablePlaylists = selectedSubject
    ? playlists.filter((p) => p.subjectId === selectedSubject)
    : playlists;

  const filteredClasses = classes.filter((cls) => {
    if (selectedSubject && cls.subjectId !== selectedSubject) return false;
    if (selectedChapter && cls.chapterId !== selectedChapter) return false;
    if (selectedPlaylist && cls.playlistId !== selectedPlaylist) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = cls.title?.toLowerCase().includes(q);
      const matchTeacher = cls.teacher?.toLowerCase().includes(q);
      if (!matchTitle && !matchTeacher) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage Classes
            </h1>
            <p className="text-xs text-slate-500">
              Curate and order YouTube educational lectures and assign course playlists.
            </p>
          </div>
        </div>

        <Link
          to="/admin/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedChapter('');
                setSelectedPlaylist('');
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Chapters</option>
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Playlist Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Course Playlist
            </label>
            <select
              value={selectedPlaylist}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Playlists</option>
              {availablePlaylists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title or teacher..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredClasses.length} of {classes.length} total classes</span>
          {(selectedSubject || selectedChapter || selectedPlaylist || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedChapter('');
                setSelectedPlaylist('');
                setSearchQuery('');
              }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Class List Table / Cards */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No classes found"
          description={
            classes.length === 0
              ? 'No classes have been added yet. Click "+ Add New Class" to curate the first lecture.'
              : 'No classes matched the selected filters.'
          }
          actionText={classes.length === 0 ? 'Add New Class' : undefined}
          actionLink={classes.length === 0 ? '/admin/classes/new' : undefined}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredClasses.map((item) => {
            const subjectObj = subjects.find((s) => s.id === item.subjectId);
            const chapterObj = chapters.find((c) => c.id === item.chapterId);
            const playlistObj = playlists.find((p) => p.id === item.playlistId);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                    #{item.classNumber}
                  </span>

                  <div className="relative aspect-video w-24 sm:w-28 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={getYouTubeThumbnailUrl(item.youtubeId, 'mq')}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase mb-0.5">
                      <span>{subjectObj?.name || 'Subject'}</span>
                      <span>›</span>
                      <span className="text-slate-500 font-medium truncate max-w-[140px]">
                        {chapterObj?.name || 'Chapter'}
                      </span>
                      {playlistObj && (
                        <>
                          <span>›</span>
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-semibold truncate max-w-[140px]">
                            {playlistObj.title}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Instructor: <strong className="text-slate-700">{item.teacher}</strong></span>
                      {item.durationSeconds && (
                        <span>• Duration: <strong className="text-slate-700">{formatDuration(item.durationSeconds)}</strong></span>
                      )}
                      <span>• YT ID: <code className="text-[11px] font-mono text-slate-600">{item.youtubeId}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      item.published !== false
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {item.published !== false ? 'Published' : 'Draft'}
                  </button>

                  <Link
                    to={`/class/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Student Preview"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/admin/classes/edit/${item.id}`}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Class"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Class?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will remove the lecture and all attached study resources.`}
        confirmText="Yes, Delete Class"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

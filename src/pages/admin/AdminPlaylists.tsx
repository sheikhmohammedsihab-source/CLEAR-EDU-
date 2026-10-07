import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Layers,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Video,
  ListOrdered
} from 'lucide-react';
import {
  getPlaylists,
  getSubjects,
  getChapters,
  getClasses,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistItems,
  addClassToPlaylist,
  removeClassFromPlaylist,
} from '../../lib/database';
import { formatDuration } from '../../lib/youtube';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import type { Playlist, Subject, Chapter, ClassItem, PlaylistItemMap } from '../../types';

export const AdminPlaylists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Playlist Items Manager Modal
  const [managePlaylist, setManagePlaylist] = useState<Playlist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItemMap>({});
  const [managingLoading, setManagingLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plist, subs, chaps, cls] = await Promise.all([
        getPlaylists(),
        getSubjects(),
        getChapters(),
        getClasses(),
      ]);
      setPlaylists(plist);
      setSubjects(subs);
      setChapters(chaps);
      setClasses(cls);
    } catch (err) {
      console.error('Error loading playlists data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingPlaylist(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setChapterId('');
    setThumbnailUrl('');
    setOrder(playlists.length + 1);
    setPublished(true);
    setFeatured(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Playlist) => {
    setEditingPlaylist(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setSubjectId(p.subjectId);
    setChapterId(p.chapterId);
    setThumbnailUrl(p.thumbnailUrl || '');
    setOrder(p.order || 1);
    setPublished(p.published !== false);
    setFeatured(Boolean(p.featured));
    setFormError(null);
    setModalOpen(true);
  };

  // Open Manage Classes inside Playlist modal
  const openManageItems = async (p: Playlist) => {
    setManagePlaylist(p);
    try {
      setManagingLoading(true);
      const items = await getPlaylistItems(p.id);
      setPlaylistItems(items);
    } catch (err) {
      console.error('Error fetching playlist items:', err);
    } finally {
      setManagingLoading(false);
    }
  };

  const handleToggleClassInPlaylist = async (classId: string) => {
    if (!managePlaylist) return;
    try {
      if (playlistItems[classId]) {
        await removeClassFromPlaylist(managePlaylist.id, classId);
        setPlaylistItems((prev) => {
          const next = { ...prev };
          delete next[classId];
          return next;
        });
      } else {
        const currentCount = Object.keys(playlistItems).length;
        await addClassToPlaylist(managePlaylist.id, classId, currentCount + 1);
        setPlaylistItems((prev) => ({
          ...prev,
          [classId]: { order: currentCount + 1 },
        }));
      }
    } catch (err) {
      console.error('Failed to toggle class in playlist:', err);
    }
  };

  // Filter available chapters for selected subject
  const availableChapters = subjectId
    ? chapters.filter((c) => c.subjectId === subjectId)
    : chapters;

  // Auto-select chapter if subject changes
  useEffect(() => {
    if (subjectId && availableChapters.length > 0 && !chapterId) {
      setChapterId(availableChapters[0].id);
    }
  }, [subjectId, availableChapters, chapterId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Playlist title is required.');
      return;
    }
    if (!subjectId) {
      setFormError('Please select a subject.');
      return;
    }
    if (!chapterId) {
      setFormError('Please select a chapter.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, {
          title: title.trim(),
          description: description.trim(),
          subjectId,
          chapterId,
          thumbnailUrl: thumbnailUrl.trim(),
          order: Number(order),
          published,
          featured,
        });
      } else {
        await createPlaylist({
          title: title.trim(),
          description: description.trim(),
          subjectId,
          chapterId,
          thumbnailUrl: thumbnailUrl.trim(),
          order: Number(order),
          published,
          featured,
        });
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving playlist:', err);
      setFormError(err.message || 'Failed to save playlist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deletePlaylist(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading playlists..." />;
  }

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
              Manage Playlists
            </h1>
            <p className="text-xs text-slate-500">
              Curate structured courses, link sequential classes, and highlight learning paths.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={subjects.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No playlists created yet"
          description="Group classes into structured chapter courses and comprehensive learning paths."
          actionText="Create Playlist"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          {playlists.map((p) => {
            const currentSub = subjects.find((s) => s.id === p.subjectId);
            const currentChap = chapters.find((c) => c.id === p.chapterId);
            const linkedClasses = classes.filter((c) => c.playlistId === p.id);
            const totalDurationSecs = linkedClasses.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

            return (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                    #{p.order}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {currentSub?.name || 'Subject'}
                      </span>
                      {currentChap && (
                        <span className="text-xs text-slate-400 font-medium">
                          {currentChap.name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.published !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.published !== false ? 'Published' : 'Draft'}
                      </span>
                      {p.featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{linkedClasses.length} classes mapped</span>
                      {totalDurationSecs > 0 && <span>• {formatDuration(totalDurationSecs)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => openManageItems(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    title="Manage classes in this playlist"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Manage Classes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Playlist"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Playlist Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPlaylist ? 'Edit Playlist' : 'Create New Course Playlist'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    required
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter *</label>
                  <select
                    required
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    disabled={availableChapters.length === 0}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="" disabled>Select Chapter</option>
                    {availableChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Playlist Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Chapter 11 Complete Course"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of syllabus covered in this playlist course..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Thumbnail URL</label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Optional. Defaults to first video's YouTube thumbnail."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">Published</span>
                  </label>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700">★ Featured</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Items Manager Modal */}
      {managePlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Classes in: {managePlaylist.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Toggle which classes belong to this curated learning path.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagePlaylist(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {managingLoading ? (
              <Loading text="Loading playlist classes..." />
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {classes
                  .filter((c) => c.subjectId === managePlaylist.subjectId)
                  .map((cls) => {
                    const isLinked = Boolean(playlistItems[cls.id]);

                    return (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isLinked
                            ? 'bg-indigo-50/70 border-indigo-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase">
                            <span>Class #{cls.classNumber}</span>
                            <span>•</span>
                            <span className="text-slate-400">{cls.teacher}</span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {cls.title}
                          </h4>
                          {cls.durationSeconds && (
                            <span className="text-[10px] text-slate-400">
                              Duration: {formatDuration(cls.durationSeconds)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleClassInPlaylist(cls.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isLinked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isLinked ? '✓ Included' : '+ Include'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setManagePlaylist(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Playlist?"
        message={`Are you sure you want to delete playlist "${deleteTarget?.title}"? Class records will remain intact.`}
        confirmText="Yes, Delete Playlist"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

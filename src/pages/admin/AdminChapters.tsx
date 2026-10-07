import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  X,
  Layers,
  Filter,
  AlertCircle,
  Video,
  CheckCircle2
} from 'lucide-react';
import {
  getChapters,
  getSubjects,
  getClasses,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import type { Chapter, Subject, ClassItem } from '../../types';

export const AdminChapters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubjectFilter = searchParams.get('subject') || '';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(initialSubjectFilter);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Form fields
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chapList, subList, classList] = await Promise.all([
        getChapters(),
        getSubjects(),
        getClasses(),
      ]);
      setChapters(chapList);
      setSubjects(subList);
      setClasses(classList);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingChapter(null);
    setSubjectId(selectedSubjectFilter || (subjects[0]?.id ?? ''));
    setName('');
    setDescription('');
    setOrder(chapters.length + 1);
    setPublished(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (chap: Chapter) => {
    setEditingChapter(chap);
    setSubjectId(chap.subjectId);
    setName(chap.name);
    setDescription(chap.description || '');
    setOrder(chap.order || 1);
    setPublished(chap.published !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Chapter name is required.');
      return;
    }
    if (!subjectId) {
      setFormError('Please select a subject.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingChapter) {
        await updateChapter(editingChapter.id, {
          subjectId,
          name: name.trim(),
          description: description.trim(),
          order: Number(order),
          published,
        });
      } else {
        await createChapter({
          subjectId,
          name: name.trim(),
          description: description.trim(),
          order: Number(order),
          published,
        });
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving chapter:', err);
      setFormError(err.message || 'Failed to save chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteChapter(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (subId: string) => {
    setSelectedSubjectFilter(subId);
    if (subId) {
      setSearchParams({ subject: subId });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return <Loading text="Loading chapters..." />;
  }

  // Filtered chapters list
  const filteredChapters = selectedSubjectFilter
    ? chapters.filter((c) => c.subjectId === selectedSubjectFilter)
    : chapters;

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
              Manage Chapters
            </h1>
            <p className="text-xs text-slate-500">
              Organize chapters under academic subjects to group video classes.
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
          <span>New Chapter</span>
        </button>
      </div>

      {/* Filter by Subject */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter by Subject:</span>
        </div>

        <select
          value={selectedSubjectFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Subjects ({chapters.length} chapters)</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapters List */}
      {filteredChapters.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No chapters found"
          description={
            subjects.length === 0
              ? 'Please create at least one subject before creating chapters.'
              : selectedSubjectFilter
              ? 'No chapters in this subject yet. Click below to add one.'
              : 'Start by creating chapters for your curriculum.'
          }
          actionText={subjects.length > 0 ? 'Create Chapter' : 'Go to Subjects'}
          actionLink={subjects.length > 0 ? undefined : '/admin/subjects'}
          onAction={subjects.length > 0 ? openCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredChapters.map((chap) => {
              const currentSubject = subjects.find((s) => s.id === chap.subjectId);
              const chapterClasses = classes.filter((c) => c.chapterId === chap.id);

              return (
                <div
                  key={chap.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                      #{chap.order}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {currentSubject?.name || 'Unassigned'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          chap.published !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {chap.published !== false ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {chap.name}
                      </h3>

                      {chap.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {chap.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <Link
                          to={`/admin/classes?chapter=${chap.id}`}
                          className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          {chapterClasses.length} {chapterClasses.length === 1 ? 'class' : 'classes'}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(chap)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(chap)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="" disabled>Select parent subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chapter Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chapter 2: Motion (গতি)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of concepts and learning outcomes..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Published to Students
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Chapter?"
        message={`Are you sure you want to delete chapter "${deleteTarget?.name}"? Make sure no active classes are orphaned.`}
        confirmText="Yes, Delete Chapter"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

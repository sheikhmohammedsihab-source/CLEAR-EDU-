import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Check,
  X,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getChapters,
} from '../../lib/database';
import { SubjectIcon } from '../../components/SubjectIcon';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';
import type { Subject, Chapter } from '../../types';

const ICON_OPTIONS = [
  'book-open',
  'atom',
  'flask-conical',
  'calculator',
  'dna',
  'binary',
  'laptop',
  'feather',
  'code',
  'globe',
  'compass',
  'graduation',
];

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('book-open');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subs, chaps] = await Promise.all([getSubjects(), getChapters()]);
      setSubjects(subs);
      setChapters(chaps);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('book-open');
    setOrder(subjects.length + 1);
    setPublished(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setSlug(subject.slug);
    setDescription(subject.description || '');
    setIcon(subject.icon || 'book-open');
    setOrder(subject.order || 1);
    setPublished(subject.published !== false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSubject && !slug) {
      // Auto-generate slug from name
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: name.trim(),
          slug: slug.trim() || editingSubject.slug,
          description: description.trim(),
          icon,
          order: Number(order),
          published,
        });
      } else {
        await createSubject({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim(),
          icon,
          order: Number(order),
          published,
        });
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving subject:', err);
      setFormError(err.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteSubject(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete subject:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading subjects..." />;
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
              Manage Subjects
            </h1>
            <p className="text-xs text-slate-500">
              Create, order, and edit academic subjects for CLEAR EDU.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subjects Table / Card Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects created yet"
          description="Start by creating your first academic subject or use the curriculum seed in the dashboard."
          actionText="Create Subject"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {subjects.map((sub) => {
              const chapterCount = chapters.filter((c) => c.subjectId === sub.id).length;

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{sub.order}
                    </span>

                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <SubjectIcon iconName={sub.icon} className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {sub.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.published !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {sub.published !== false ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {sub.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Slug: <code className="text-slate-600">{sub.slug}</code></span>
                        <span>•</span>
                        <Link
                          to={`/admin/chapters?subject=${sub.id}`}
                          className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          {chapterCount} chapters
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(sub)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(sub)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Subject"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
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
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Physics (পদার্থবিজ্ঞান)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug (ID)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. physics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                  placeholder="Brief synopsis of topics covered in this subject..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIcon(opt)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        icon === opt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <SubjectIcon iconName={opt} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
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
                  {submitting ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any chapters or classes linked to this subject will need to be re-assigned.`}
        confirmText="Yes, Delete Subject"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

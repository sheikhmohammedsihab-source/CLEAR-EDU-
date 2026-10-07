import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Book,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import {
  getBooks,
  getSubjects,
  createBook,
  updateBook,
  deleteBook
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { Book as BookType, Subject } from '../../types';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [formData, setFormData] = useState<{
    subjectId: string;
    title: string;
    academicYear: string;
    sourceName: string;
    sourceType: 'NCTB' | 'AUTHORIZED_BOARD' | 'OPEN_ACCESS';
    url: string;
    description: string;
    published: boolean;
  }>({
    subjectId: '',
    title: '',
    academicYear: '2026',
    sourceName: 'NCTB Official Portal',
    sourceType: 'NCTB',
    url: '',
    description: '',
    published: true,
  });

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allBooks, allSubjects] = await Promise.all([
        getBooks(),
        getSubjects(),
      ]);
      setBooks(allBooks);
      setSubjects(allSubjects);
      if (allSubjects.length > 0 && !formData.subjectId) {
        setFormData((prev) => ({ ...prev, subjectId: allSubjects[0].id }));
      }
    } catch (e) {
      console.error('Error loading books:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormError(null);
    setEditingBook(null);
    setFormData({
      subjectId: subjects[0]?.id || '',
      title: '',
      academicYear: '2026',
      sourceName: 'NCTB Official Portal',
      sourceType: 'NCTB',
      url: '',
      description: '',
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BookType) => {
    setFormError(null);
    setEditingBook(b);
    setFormData({
      subjectId: b.subjectId,
      title: b.title,
      academicYear: b.academicYear,
      sourceName: b.sourceName,
      sourceType: b.sourceType,
      url: b.url,
      description: b.description || '',
      published: b.published,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim() || !formData.url.trim() || !formData.subjectId) {
      setFormError('Please fill in title, subject and URL.');
      return;
    }

    try {
      if (editingBook) {
        await updateBook(editingBook.id, formData);
      } else {
        await createBook(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Save error:', err);
      setFormError(err?.message || 'Failed to save book.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBook(deletingId);
      setDeletingId(null);
      await loadData();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const filteredBooks = books.filter((b) => {
    if (selectedSubject !== 'all' && b.subjectId !== selectedSubject) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.sourceName.toLowerCase().includes(q) ||
        b.academicYear.includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return <Loading text="Loading official textbooks..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Book className="w-6 h-6 text-indigo-600" />
              NCTB Official Textbooks
            </h1>
            <p className="text-xs text-slate-500">
              Manage authorized curriculum textbook links (e.g. nctb.gov.bd) for students.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Textbook</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search textbook title or year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No textbooks found. Click "Add Textbook" to link an official book.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => {
                  const subObj = subjects.find((s) => s.id === b.subjectId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.title}</div>
                        {b.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{b.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {subObj?.name || b.subjectId}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{b.academicYear}</td>
                      <td className="py-3 px-4">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <span>{b.sourceName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {b.published ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            Published
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(b.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingBook ? 'Edit Textbook' : 'Add Official NCTB Textbook'}
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="Secondary Physics (পদার্থবিজ্ঞান) - Class 9-10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Source Name</label>
                  <input
                    type="text"
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Textbook URL</label>
                <input
                  type="url"
                  placeholder="http://www.nctb.gov.bd/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedBook"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="publishedBook" className="text-slate-700 font-semibold cursor-pointer">
                  Publish to Students
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Textbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Textbook Link?"
        message="Are you sure you want to remove this textbook from the curriculum?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

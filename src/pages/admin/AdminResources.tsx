import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Search,
  CheckCircle2
} from 'lucide-react';
import {
  getResources,
  getClasses,
  createResource,
  updateResource,
  deleteResource
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { ClassResource, ClassItem, ResourceType } from '../../types';

export const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<ClassResource[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<ClassResource | null>(null);
  const [formData, setFormData] = useState<{
    classId: string;
    title: string;
    type: ResourceType;
    url: string;
    description: string;
    order: number;
    published: boolean;
  }>({
    classId: '',
    title: '',
    type: 'PDF',
    url: '',
    description: '',
    order: 1,
    published: true,
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resList, classList] = await Promise.all([
        getResources(),
        getClasses(),
      ]);
      setResources(resList);
      setClasses(classList);
      if (classList.length > 0 && !formData.classId) {
        setFormData((prev) => ({ ...prev, classId: classList[0].id }));
      }
    } catch (e) {
      console.error('Error loading resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormError(null);
    setEditingRes(null);
    setFormData({
      classId: classes[0]?.id || '',
      title: '',
      type: 'PDF',
      url: '',
      description: '',
      order: resources.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: ClassResource) => {
    setFormError(null);
    setEditingRes(r);
    setFormData({
      classId: r.classId,
      title: r.title,
      type: r.type,
      url: r.url,
      description: r.description || '',
      order: r.order,
      published: r.published,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim() || !formData.url.trim() || !formData.classId) {
      setFormError('Please fill in title, valid URL, and choose target class.');
      return;
    }

    try {
      const cls = classes.find((c) => c.id === formData.classId);
      const payload = {
        ...formData,
        subjectId: cls?.subjectId || '',
        chapterId: cls?.chapterId || '',
      };

      if (editingRes) {
        await updateResource(editingRes.id, payload);
      } else {
        await createResource(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving resource:', err);
      setFormError(err?.message || 'Error saving resource.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteResource(deletingId);
      setDeletingId(null);
      await loadData();
    } catch (e) {
      console.error('Error deleting resource:', e);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (selectedClass !== 'all' && r.classId !== selectedClass) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <Loading text="Loading class study resources..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Class Study Resources
            </h1>
            <p className="text-xs text-slate-500">
              Manage PDFs, lecture slides, formula sheets, and handwritten study notes.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Resource</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resource title or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="all">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Class #{c.classNumber}: {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Associated Class</th>
                <th className="py-3 px-4">Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No resources found.
                  </td>
                </tr>
              ) : (
                filteredResources.map((r) => {
                  const cls = classes.find((c) => c.id === r.classId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{r.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                        {cls ? `Class #${cls.classNumber}: ${cls.title}` : r.classId}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        {r.published ? (
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
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(r.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingRes ? 'Edit Resource' : 'Add Study Material'}
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Target Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class #{c.classNumber}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Motion Formula Sheet PDF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Resource Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Slides">Slides / Presentation</option>
                    <option value="Notes">Handwritten Notes</option>
                    <option value="Document">Word Document</option>
                    <option value="Link">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Resource URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedRes"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="publishedRes" className="text-slate-700 font-semibold cursor-pointer">
                  Publish to Students
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Resource?"
        message="Are you sure you want to delete this study resource?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

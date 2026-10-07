import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  Clock,
  Calendar,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Filter,
  Check,
  Play
} from 'lucide-react';
import {
  getLiveClasses,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  getSubjects,
  getEducationSources
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { LiveClass, LiveClassStatus, EducationSource, Subject, EducationPlatform } from '../../types';

export const AdminLiveClasses: React.FC = () => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [sources, setSources] = useState<EducationSource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<LiveClass | null>(null);

  // Form
  const [formSourceId, setFormSourceId] = useState('');
  const [formPlatform, setFormPlatform] = useState<EducationPlatform>('YOUTUBE');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('physics');
  const [formStatus, setFormStatus] = useState<LiveClassStatus>('UPCOMING');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formApprovalStatus, setFormApprovalStatus] = useState<'APPROVED' | 'PENDING_REVIEW' | 'REJECTED'>('APPROVED');

  const loadData = async () => {
    try {
      setLoading(true);
      const [classList, sourceList, subjectList] = await Promise.all([
        getLiveClasses(),
        getEducationSources(),
        getSubjects(),
      ]);
      setClasses(classList);
      setSources(sourceList);
      setSubjects(subjectList);
    } catch (err) {
      console.error('Error loading live classes in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setFormSourceId(sources[0]?.id || 'src-10ms-yt');
    setFormPlatform('YOUTUBE');
    setFormTitle('');
    setFormDescription('');
    setFormTeacher('');
    setFormVideoId('');
    setFormSubjectId(subjects[0]?.id || 'physics');
    setFormStatus('LIVE_NOW');
    const nowStr = new Date().toISOString().slice(0, 16);
    setFormScheduledDate(nowStr);
    setFormApprovalStatus('APPROVED');
    setModalOpen(true);
  };

  const openEditModal = (c: LiveClass) => {
    setEditingClass(c);
    setFormSourceId(c.sourceId);
    setFormPlatform(c.platform);
    setFormTitle(c.title);
    setFormDescription(c.description || '');
    setFormTeacher(c.teacher || '');
    setFormVideoId(c.videoOrBroadcastId);
    setFormSubjectId(c.subjectId || 'physics');
    setFormStatus(c.status);
    const dateStr = new Date(c.scheduledStartTime).toISOString().slice(0, 16);
    setFormScheduledDate(dateStr);
    setFormApprovalStatus(c.approvalStatus);
    setModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoId.trim()) {
      setFeedback({ type: 'error', message: 'Title and Video/Broadcast ID are required.' });
      return;
    }

    const scheduledTime = formScheduledDate ? new Date(formScheduledDate).getTime() : Date.now();
    const sourceObj = sources.find((s) => s.id === formSourceId);
    const sourceName = sourceObj?.name || 'CLEAR EDU Verified Channel';

    const embedUrl =
      formPlatform === 'YOUTUBE'
        ? `https://www.youtube-nocookie.com/embed/${formVideoId}`
        : `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${formVideoId}&show_text=0`;

    const externalUrl =
      formPlatform === 'YOUTUBE'
        ? `https://www.youtube.com/watch?v=${formVideoId}`
        : `https://www.facebook.com/watch/?v=${formVideoId}`;

    const thumbnailUrl =
      formPlatform === 'YOUTUBE'
        ? `https://img.youtube.com/vi/${formVideoId}/hqdefault.jpg`
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';

    try {
      if (editingClass) {
        await updateLiveClass(editingClass.id, {
          sourceId: formSourceId,
          sourceName,
          platform: formPlatform,
          title: formTitle.trim(),
          description: formDescription.trim(),
          teacher: formTeacher.trim(),
          videoOrBroadcastId: formVideoId.trim(),
          embedUrl,
          externalUrl,
          thumbnailUrl,
          subjectId: formSubjectId,
          status: formStatus,
          scheduledStartTime: scheduledTime,
          approvalStatus: formApprovalStatus,
        });
        setFeedback({ type: 'success', message: `Updated live class: ${formTitle}` });
      } else {
        await createLiveClass({
          sourceId: formSourceId,
          sourceName,
          platform: formPlatform,
          title: formTitle.trim(),
          description: formDescription.trim(),
          teacher: formTeacher.trim(),
          videoOrBroadcastId: formVideoId.trim(),
          embedUrl,
          externalUrl,
          thumbnailUrl,
          subjectId: formSubjectId,
          medium: 'BANGLA_MEDIUM',
          status: formStatus,
          scheduledStartTime: scheduledTime,
          approvalStatus: formApprovalStatus,
          isOfficial: true,
        });
        setFeedback({ type: 'success', message: `Added live class: ${formTitle}` });
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save live class.' });
    }
  };

  const handleQuickApprove = async (classId: string) => {
    try {
      await updateLiveClass(classId, { approvalStatus: 'APPROVED' });
      setFeedback({ type: 'success', message: 'Class approved and published to students.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to approve.' });
    }
  };

  const handleQuickReject = async (classId: string) => {
    try {
      await updateLiveClass(classId, { approvalStatus: 'REJECTED' });
      setFeedback({ type: 'success', message: 'Class rejected.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reject.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    try {
      await deleteLiveClass(classToDelete.id);
      setFeedback({ type: 'success', message: `Removed live class ${classToDelete.title}` });
      setDeleteModalOpen(false);
      setClassToDelete(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Delete failed.' });
    }
  };

  const filtered = classes.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchTeacher = c.teacher?.toLowerCase().includes(q) ?? false;
      const matchSource = c.sourceName.toLowerCase().includes(q);
      if (!matchTitle && !matchTeacher && !matchSource) return false;
    }
    return true;
  });

  if (loading) {
    return <Loading text="Loading live broadcasts management..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>NCTB Live Classes Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Classes &amp; Broadcasts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Review auto-detected educational broadcasts, schedule special live sessions, and approve lectures for student access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/sources"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <span>Education Sources</span>
          </Link>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Live Class</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto font-bold">
          {['ALL', 'LIVE_NOW', 'UPCOMING', 'TODAY', 'THIS_WEEK', 'RECORDING_AVAILABLE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, teacher..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Broadcast / Class</th>
                <th className="py-3 px-4">Source &amp; Platform</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const subObj = subjects.find((s) => s.id === item.subjectId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                          <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 line-clamp-1 max-w-sm">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Teacher: <span className="text-slate-700 font-semibold">{item.teacher || 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{item.sourceName}</div>
                      <span className="text-[10px] text-slate-400 uppercase">{item.platform}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.status === 'LIVE_NOW' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md animate-pulse">
                          <Radio className="w-3 h-3" /> LIVE NOW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {subObj?.name || item.subjectId || 'All'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          item.approvalStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.approvalStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.approvalStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.approvalStatus === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(item.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Approve Class"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleQuickReject(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Reject Class"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setClassToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingClass ? 'Edit Live Class' : 'Schedule New Live Class'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Education Source</label>
                  <select
                    value={formSourceId}
                    onChange={(e) => setFormSourceId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.platform})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as EducationPlatform)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="YOUTUBE">YouTube</option>
                    <option value="FACEBOOK">Facebook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC 2026 Physics: Chapter 2 Motion Live Masterclass"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Video / Broadcast ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. k8oW3qXnCxg"
                    value={formVideoId}
                    onChange={(e) => setFormVideoId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Instructor / Teacher</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Hasan"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Live Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LiveClassStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="LIVE_NOW">🔴 LIVE NOW</option>
                    <option value="UPCOMING">⏱ Upcoming</option>
                    <option value="TODAY">📅 Today</option>
                    <option value="THIS_WEEK">📆 This Week</option>
                    <option value="RECORDING_AVAILABLE">📹 Recording Available</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Scheduled Start Time</label>
                <input
                  type="datetime-local"
                  value={formScheduledDate}
                  onChange={(e) => setFormScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approval State</label>
                <select
                  value={formApprovalStatus}
                  onChange={(e) => setFormApprovalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="APPROVED">APPROVED (Visible to students)</option>
                  <option value="PENDING_REVIEW">PENDING REVIEW (Draft / sync held)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingClass ? 'Save Changes' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Live Class"
        message={`Are you sure you want to remove "${classToDelete?.title}"?`}
        confirmText="Remove"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit,
  ShieldCheck,
  Video,
  Clock,
  Filter,
  Check,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import {
  getEducationSources,
  createEducationSource,
  updateEducationSource,
  deleteEducationSource,
  syncEducationSource,
  getSubjects
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { EducationSource, EducationPlatform, Subject } from '../../types';

export const AdminSources: React.FC = () => {
  const [sources, setSources] = useState<EducationSource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states for Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<EducationSource | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<EducationSource | null>(null);

  // Form State
  const [formPlatform, setFormPlatform] = useState<EducationPlatform>('YOUTUBE');
  const [formName, setFormName] = useState('');
  const [formChannelOrPageId, setFormChannelOrPageId] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formSelectedSubjects, setFormSelectedSubjects] = useState<string[]>([]);
  const [formMedium, setFormMedium] = useState<'BANGLA_MEDIUM' | 'ENGLISH_VERSION' | 'BOTH'>('BANGLA_MEDIUM');
  const [formTargetClass, setFormTargetClass] = useState<'CLASS_9' | 'CLASS_10' | 'SSC' | 'ALL'>('SSC');
  const [formVerified, setFormVerified] = useState(true);
  const [formActive, setFormActive] = useState(true);
  const [formAutoSync, setFormAutoSync] = useState(true);
  const [formFilterKeywords, setFormFilterKeywords] = useState('SSC, Class 9, Class 10, Live');
  const [formRequireApproval, setFormRequireApproval] = useState(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      const [srcList, subList] = await Promise.all([
        getEducationSources(),
        getSubjects(),
      ]);
      setSources(srcList);
      setSubjects(subList);
    } catch (err) {
      console.error('Error loading sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const openAddModal = () => {
    setEditingSource(null);
    setFormPlatform('YOUTUBE');
    setFormName('');
    setFormChannelOrPageId('');
    setFormUrl('');
    setFormThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80');
    setFormSelectedSubjects(['physics', 'chemistry', 'general-math']);
    setFormMedium('BANGLA_MEDIUM');
    setFormTargetClass('SSC');
    setFormVerified(true);
    setFormActive(true);
    setFormAutoSync(true);
    setFormFilterKeywords('SSC, Class 9, Class 10, Live');
    setFormRequireApproval(false);
    setModalOpen(true);
  };

  const openEditModal = (s: EducationSource) => {
    setEditingSource(s);
    setFormPlatform(s.platform);
    setFormName(s.name);
    setFormChannelOrPageId(s.channelOrPageId);
    setFormUrl(s.url);
    setFormThumbnail(s.thumbnailUrl || '');
    setFormSelectedSubjects(s.subjects || []);
    setFormMedium(s.medium);
    setFormTargetClass(s.targetClass);
    setFormVerified(s.verified);
    setFormActive(s.active);
    setFormAutoSync(s.autoSync);
    setFormFilterKeywords(s.filterKeywords?.join(', ') || 'SSC, Class 9, Class 10');
    setFormRequireApproval(s.requireAdminApproval);
    setModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formChannelOrPageId.trim() || !formUrl.trim()) {
      setFeedback({ type: 'error', message: 'Name, Channel/Page ID and URL are required.' });
      return;
    }

    const keywords = formFilterKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      if (editingSource) {
        await updateEducationSource(editingSource.id, {
          platform: formPlatform,
          name: formName.trim(),
          channelOrPageId: formChannelOrPageId.trim(),
          url: formUrl.trim(),
          thumbnailUrl: formThumbnail.trim() || undefined,
          subjects: formSelectedSubjects,
          medium: formMedium,
          targetClass: formTargetClass,
          verified: formVerified,
          active: formActive,
          autoSync: formAutoSync,
          filterKeywords: keywords,
          requireAdminApproval: formRequireApproval,
        });
        setFeedback({ type: 'success', message: `Updated ${formName}` });
      } else {
        await createEducationSource({
          platform: formPlatform,
          name: formName.trim(),
          channelOrPageId: formChannelOrPageId.trim(),
          url: formUrl.trim(),
          thumbnailUrl: formThumbnail.trim() || undefined,
          subjects: formSelectedSubjects,
          medium: formMedium,
          targetClass: formTargetClass,
          verified: formVerified,
          active: formActive,
          autoSync: formAutoSync,
          filterKeywords: keywords,
          requireAdminApproval: formRequireApproval,
          syncStatus: 'IDLE',
        });
        setFeedback({ type: 'success', message: `Added new source: ${formName}` });
      }

      setModalOpen(false);
      await loadSources();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save source.' });
    }
  };

  const handleTriggerSync = async (sourceId: string) => {
    setSyncingId(sourceId);
    setFeedback(null);
    try {
      const res = await syncEducationSource(sourceId);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
      await loadSources();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Sync failed.' });
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncAllLoading(true);
    setFeedback(null);
    try {
      const autoSyncSources = sources.filter((s) => s.active && s.autoSync);
      for (const s of autoSyncSources) {
        await syncEducationSource(s.id);
      }
      setFeedback({
        type: 'success',
        message: `Sync monitor executed: checked all ${autoSyncSources.length} active educational sources for live/upcoming broadcasts.`,
      });
      await loadSources();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Global sync failed.' });
    } finally {
      setSyncAllLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return;
    try {
      await deleteEducationSource(sourceToDelete.id);
      setFeedback({ type: 'success', message: `Deleted source ${sourceToDelete.name}` });
      setDeleteModalOpen(false);
      setSourceToDelete(null);
      await loadSources();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Delete failed.' });
    }
  };

  if (loading) {
    return <Loading text="Loading verified educational sources..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Sources Sync Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Education Sources Management
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage approved Bangladesh educational YouTube channels and Facebook pages. The sync monitor automatically tracks official live broadcasts without requiring manual additions for every session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncAll}
              disabled={syncAllLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncAllLoading ? 'animate-spin' : ''}`} />
              <span>{syncAllLoading ? 'Syncing...' : 'Sync All Sources'}</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Source</span>
            </button>
          </div>
        </div>

        {/* Legal & Policy Note (Requirement 6 & 7) */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>YouTube API:</strong> Uses official YouTube Data API broadcasts listing &amp; embed iframe player. No video scraping.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Facebook Pages:</strong> Assisted fallback mode active for Graph API permissions. Never bypasses privacy or platform terms.
            </span>
          </div>
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

      {/* Sources Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Verified Educational Channels &amp; Pages ({sources.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only approved broadcasts mapped to NCTB subjects and SSC syllabus are synchronized.
            </p>
          </div>

          <Link
            to="/admin/live-classes"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Manage Live Classes &rarr;</span>
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {sources.map((src) => {
            const isSyncing = syncingId === src.id;

            return (
              <div key={src.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {src.thumbnailUrl ? (
                      <img src={src.thumbnailUrl} alt={src.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                        {src.platform[0]}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                        src.platform === 'YOUTUBE' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {src.platform}
                      </span>

                      {src.verified && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        src.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {src.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                      <span>{src.name}</span>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                      <span>ID: <code className="text-slate-700 font-mono">{src.channelOrPageId}</code></span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-700">{src.targetClass}</strong></span>
                      <span>•</span>
                      <span>Medium: <strong className="text-slate-700">{src.medium.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Auto-Sync: <strong className={src.autoSync ? 'text-indigo-600' : 'text-slate-400'}>{src.autoSync ? 'ON' : 'OFF'}</strong></span>
                    </div>

                    {src.filterKeywords && src.filterKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {src.filterKeywords.slice(0, 5).map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleTriggerSync(src.id)}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    title="Check for active/upcoming broadcasts now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(src)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit Source Settings"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSourceToDelete(src);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove Source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Source Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingSource ? 'Edit Educational Source' : 'Add Educational Source'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as EducationPlatform)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="YOUTUBE">YouTube Channel</option>
                    <option value="FACEBOOK">Facebook Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Curriculum Level</label>
                  <select
                    value={formTargetClass}
                    onChange={(e) => setFormTargetClass(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="SSC">SSC (Class 9-10 Complete)</option>
                    <option value="CLASS_9">Class 9 Only</option>
                    <option value="CLASS_10">Class 10 Only</option>
                    <option value="ALL">All Secondary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Channel / Page Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Minute School, Onnorokom Pathshala"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Channel ID / Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UC_wO48h2P-xO59Nq5lXz9lQ"
                    value={formChannelOrPageId}
                    onChange={(e) => setFormChannelOrPageId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Channel URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/@channel"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Filter Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={formFilterKeywords}
                  onChange={(e) => setFormFilterKeywords(e.target.value)}
                  placeholder="SSC, Class 9, Class 10, Physics, Math, রসায়ন"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Only broadcasts with these keywords in title/description will be imported to prevent irrelevant content.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAutoSync}
                    onChange={(e) => setFormAutoSync(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Automatic Sync</span>
                    <p className="text-[10px] text-slate-500">Periodically check broadcasts</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequireApproval}
                    onChange={(e) => setFormRequireApproval(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Admin Review Mode</span>
                    <p className="text-[10px] text-slate-500">Require manual approval before publish</p>
                  </div>
                </label>
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
                  {editingSource ? 'Save Changes' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Education Source"
        message={`Are you sure you want to remove "${sourceToDelete?.name}"? Broadcast tracking for this channel will cease.`}
        confirmText="Remove Source"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

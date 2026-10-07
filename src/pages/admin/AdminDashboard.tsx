import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Video,
  Users,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  HelpCircle,
  Settings,
  Book,
  FileText,
  Clock,
  Activity,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { getAdminStats, getContentHealth } from '../../lib/database';
import { seedInitialCurriculum } from '../../lib/seedData';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ADMIN_UID } from '../../lib/constants';
import type { AdminStats, ContentHealthItem } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [contentHealth, setContentHealth] = useState<ContentHealthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedFeedback, setSeedFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsData, healthData] = await Promise.all([
        getAdminStats(),
        getContentHealth(),
      ]);
      setStats(statsData);
      setContentHealth(healthData);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedConfirm = async () => {
    setSeeding(true);
    setSeedFeedback(null);
    try {
      const res = await seedInitialCurriculum();
      setSeedFeedback(res);
      if (res.success) {
        await fetchStats();
      }
    } catch (err: any) {
      setSeedFeedback({
        success: false,
        message: err?.message || 'Error executing curriculum seed.',
      });
    } finally {
      setSeeding(false);
      setSeedModalOpen(false);
    }
  };

  if (loading) {
    return <Loading text="Loading admin system statistics..." />;
  }

  const readyChaptersCount = contentHealth.filter((h) => h.examReady).length;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>CLEAR EDU Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Curriculum Administration
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
              Curate, sequence, and manage official NCTB classes, textbooks, questions, and automated chapter exam assignments.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/admin/classes/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </Link>

            <Link
              to="/admin/questions/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </Link>

            <button
              onClick={() => setSeedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/40 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Sync/Seed NCTB Data</span>
            </button>
          </div>
        </div>

        {/* Authority details */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            Authorized Admin UID: <code className="text-amber-300 font-mono font-semibold">{ADMIN_UID}</code>
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Security Enforced via Realtime Database Rules
          </span>
        </div>
      </div>

      {seedFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
            seedFeedback.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {seedFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{seedFeedback.message}</span>
          </div>
          <button
            onClick={() => setSeedFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Subjects</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalSubjects || 0}</p>
          <Link to="/admin/subjects" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            Manage Subjects →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Chapters</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalChapters || 0}</p>
          <Link to="/admin/chapters" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            Manage Chapters →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Classes</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.publishedClasses || 0}</p>
          <Link to="/admin/classes" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            Manage Classes →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Textbooks</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalBooks || 0}</p>
          <Link to="/admin/books" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            Manage Books →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Questions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.publishedQuestions || 0}</p>
          <Link to="/admin/questions" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            Question Bank →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Students</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalStudents || 0}</p>
          <Link to="/admin/students" className="text-[11px] text-indigo-600 font-bold hover:underline mt-2 block">
            View Students →
          </Link>
        </div>
      </div>

      {/* 2. Admin Modules Navigation Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Management Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <Link
            to="/admin/subjects"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Subjects</span>
          </Link>

          <Link
            to="/admin/chapters"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Chapters</span>
          </Link>

          <Link
            to="/admin/books"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Book className="w-4 h-4 text-indigo-600" />
            <span>NCTB Books</span>
          </Link>

          <Link
            to="/admin/playlists"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Playlists</span>
          </Link>

          <Link
            to="/admin/classes"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Classes</span>
          </Link>

          <Link
            to="/admin/resources"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Resources</span>
          </Link>

          <Link
            to="/admin/questions"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Question Bank</span>
          </Link>

          <Link
            to="/admin/exams"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Chapter Exams</span>
          </Link>

          <Link
            to="/admin/sources"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Radio className="w-4 h-4 text-red-600" />
            <span>Education Sources ({stats?.totalSources || 6})</span>
          </Link>

          <Link
            to="/admin/live-classes"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Video className="w-4 h-4 text-red-600" />
            <span>Live Classes ({stats?.totalLiveClasses || 4})</span>
          </Link>

          <Link
            to="/admin/students"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Students</span>
          </Link>

          <Link
            to="/admin/settings"
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-3 font-semibold text-slate-800"
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>Platform Settings</span>
          </Link>
        </div>
      </div>

      {/* 3. CONTENT HEALTH AUDIT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Content Health & Exam Readiness
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated audit of each chapter: ensures lessons, textbooks, approved question pools, and exam configurations are complete.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
            {readyChaptersCount} of {contentHealth.length} Chapters Ready
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Chapter</th>
                <th className="py-3 px-3">Classes</th>
                <th className="py-3 px-3">Textbook</th>
                <th className="py-3 px-3">Questions</th>
                <th className="py-3 px-3">Exam Config</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contentHealth.map((item) => (
                <tr key={item.chapterId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.subjectName}</td>
                  <td className="py-3 px-3 text-slate-700">{item.chapterTitle}</td>
                  <td className="py-3 px-3">
                    {item.classesCount > 0 ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.classesCount} Classes ✓
                      </span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-semibold">
                        0 Classes
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.hasBook ? (
                      <span className="text-emerald-700 font-semibold">Linked ✓</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Missing</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        item.questionPoolCount >= 5
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {item.questionPoolCount} in pool
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.hasExamConfig ? (
                      <span className="text-emerald-700 font-semibold">Configured ✓</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Missing</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.examReady ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> READY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full text-[11px]" title={item.issues.join(', ')}>
                        <AlertTriangle className="w-3.5 h-3.5" /> {item.issues[0]}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      to={`/admin/exams?chapterId=${item.chapterId}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      Configure
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Seed */}
      <ConfirmModal
        isOpen={seedModalOpen}
        title="Sync Official NCTB SSC Curriculum?"
        message="This will initialize or update the official NCTB Class 9-10 subjects, chapters, playlists, classes, books, questions, and default exam configurations in your Firebase Realtime Database. Existing user progress is preserved."
        confirmText={seeding ? 'Syncing...' : 'Yes, Seed Database'}
        cancelText="Cancel"
        onConfirm={handleSeedConfirm}
        onCancel={() => setSeedModalOpen(false)}
      />
    </div>
  );
};

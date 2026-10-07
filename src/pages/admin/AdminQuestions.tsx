import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Upload,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  FileDown,
  Tag
} from 'lucide-react';
import {
  getQuestions,
  getSubjects,
  getChapters,
  deleteQuestion,
  bulkImportQuestions,
  checkDuplicateQuestion
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/ConfirmModal';
import type { Question, Subject, Chapter } from '../../types';

export const AdminQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Deletion modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importTargetSubject, setImportTargetSubject] = useState('');
  const [importTargetChapter, setImportTargetChapter] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ imported: number; duplicates: number; errors: string[] } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qList, sList, cList] = await Promise.all([
        getQuestions(),
        getSubjects(),
        getChapters(),
      ]);
      setQuestions(qList);
      setSubjects(sList);
      setChapters(cList);
      if (sList.length > 0 && !importTargetSubject) setImportTargetSubject(sList[0].id);
      if (cList.length > 0 && !importTargetChapter) setImportTargetChapter(cList[0].id);
    } catch (e) {
      console.error('Error loading questions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteQuestion(deletingId);
      setDeletingId(null);
      await loadData();
    } catch (e) {
      console.error('Error deleting question:', e);
    }
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    try {
      let parsed: any[];
      try {
        parsed = JSON.parse(importJsonText);
        if (!Array.isArray(parsed)) parsed = [parsed];
      } catch (parseErr: any) {
        setImportFeedback({
          imported: 0,
          duplicates: 0,
          errors: ['Invalid JSON array format. Please provide a valid JSON array of question objects.'],
        });
        return;
      }

      const formatted = parsed.map((item) => ({
        subjectId: item.subjectId || importTargetSubject,
        chapterId: item.chapterId || importTargetChapter,
        question: item.question || '',
        options: Array.isArray(item.options) ? item.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: item.answer !== undefined ? item.answer : 0,
        explanation: item.explanation || '',
        difficulty: item.difficulty || 'MEDIUM',
        sourceType: item.sourceType || 'NCTB',
        sourceName: item.sourceName || 'Imported Question',
        year: item.year || new Date().getFullYear(),
        marks: Number(item.marks) || 1,
        type: 'MCQ' as const,
        published: true,
      }));

      const res = await bulkImportQuestions(formatted);
      setImportFeedback({
        imported: res.importedCount,
        duplicates: res.duplicateCount,
        errors: res.errors,
      });
      await loadData();
    } catch (err: any) {
      setImportFeedback({
        imported: 0,
        duplicates: 0,
        errors: [err?.message || 'Unknown import error'],
      });
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
      if (selectedChapter !== 'all' && q.chapterId !== selectedChapter) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.sourceName?.toLowerCase().includes(query) ||
          q.explanation?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [questions, selectedSubject, selectedChapter, selectedDifficulty, search]);

  if (loading) {
    return <Loading text="Loading official question repository..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              Question Bank Manager
            </h1>
            <p className="text-xs text-slate-500">
              Create, review, and bulk-import authenticated board standard MCQs and practice questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setImportModalOpen(true);
              setImportFeedback(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Bulk Import JSON</span>
          </button>

          <Link
            to="/admin/questions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by text or board..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setSelectedChapter('all');
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="all">All Chapters</option>
          {chapters
            .filter((c) => selectedSubject === 'all' || c.subjectId === selectedSubject)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="all">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Questions Count & Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong className="text-slate-900 font-bold">{filteredQuestions.length}</strong> questions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4">Subject & Chapter</th>
                <th className="py-3 px-4">Source / Year</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No questions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const subObj = subjects.find((s) => s.id === q.subjectId);
                  const chapObj = chapters.find((c) => c.id === q.chapterId);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 line-clamp-2">{q.question}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Correct: {q.options[Number(q.answer)] || q.answer}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{subObj?.name || q.subjectId}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {chapObj?.name || q.chapterId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block">{q.sourceName || q.sourceType}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{q.year}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : q.difficulty === 'HARD'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {q.published ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            Live
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/admin/questions/edit/${q.id}`}
                          className="inline-block p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingId(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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

      {/* Bulk Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Bulk Import Questions (JSON)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste an array of question JSON objects. The system automatically performs duplicate detection against normalized question text.
            </p>

            <form onSubmit={handleBulkImportSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Target Subject</label>
                  <select
                    value={importTargetSubject}
                    onChange={(e) => setImportTargetSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Target Chapter</label>
                  <select
                    value={importTargetChapter}
                    onChange={(e) => setImportTargetChapter(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    {chapters
                      .filter((c) => c.subjectId === importTargetSubject)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">JSON Payload</label>
                <textarea
                  rows={8}
                  placeholder={`[
  {
    "question": "নিচের কোনটি ভেক্টর রাশি?",
    "options": ["দূরত্ব", "দ্রুতি", "সরণ", "কাজ"],
    "answer": 2,
    "explanation": "সরণের মান ও দিক উভয়ই আছে।",
    "difficulty": "EASY",
    "sourceName": "Dhaka Board 2024"
  }
]`}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              {importFeedback && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-800">
                    Import Result: {importFeedback.imported} imported, {importFeedback.duplicates} duplicates ignored.
                  </div>
                  {importFeedback.errors.length > 0 && (
                    <div className="text-rose-600">Errors: {importFeedback.errors.join('; ')}</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Validate & Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Question?"
        message="Are you sure you want to permanently remove this question from the bank?"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

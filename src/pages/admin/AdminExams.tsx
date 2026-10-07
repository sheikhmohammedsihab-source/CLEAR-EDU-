import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Clock,
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import {
  getChapters,
  getSubjects,
  getChapterExamConfigs,
  saveChapterExamConfig,
  getQuestions,
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import type { Chapter, Subject, ChapterExamConfig, Question } from '../../types';

export const AdminExams: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedChapterId = searchParams.get('chapterId') || '';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [configs, setConfigs] = useState<Record<string, ChapterExamConfig>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [currentConfig, setCurrentConfig] = useState<ChapterExamConfig>({
    chapterId: '',
    enabled: true,
    unlockRule: 'ALL_REQUIRED_CLASSES_COMPLETED',
    questionType: 'MCQ',
    questionPoolSize: 10,
    questionCount: 10,
    passMark: 50,
    durationSeconds: 600,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowRetakes: true,
    maxAttempts: 3,
    showCorrectAnswerAfterSubmit: true,
    showExplanationAfterSubmit: true,
    requiredClassesCompletionPercentage: 100,
    updatedAt: Date.now(),
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chapList, subList, configMap, qList] = await Promise.all([
        getChapters(),
        getSubjects(),
        getChapterExamConfigs(),
        getQuestions(),
      ]);

      setChapters(chapList);
      setSubjects(subList);
      setConfigs(configMap);
      setQuestions(qList);

      const targetId = preselectedChapterId || (chapList.length > 0 ? chapList[0].id : '');
      if (targetId) {
        setSelectedChapterId(targetId);
        if (configMap[targetId]) {
          setCurrentConfig(configMap[targetId]);
        } else {
          setCurrentConfig((prev) => ({
            ...prev,
            chapterId: targetId,
          }));
        }
      }
    } catch (e) {
      console.error('Error loading exam configs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedChapterId]);

  const handleSelectChapter = (chapId: string) => {
    setSelectedChapterId(chapId);
    setSavedSuccess(false);
    if (configs[chapId]) {
      setCurrentConfig(configs[chapId]);
    } else {
      setCurrentConfig({
        chapterId: chapId,
        enabled: true,
        unlockRule: 'ALL_REQUIRED_CLASSES_COMPLETED',
        questionType: 'MCQ',
        questionPoolSize: 10,
        questionCount: 10,
        passMark: 50,
        durationSeconds: 600,
        randomizeQuestions: true,
        randomizeOptions: true,
        allowRetakes: true,
        maxAttempts: 3,
        showCorrectAnswerAfterSubmit: true,
        showExplanationAfterSubmit: true,
        requiredClassesCompletionPercentage: 100,
        updatedAt: Date.now(),
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;

    try {
      setErrorMessage(null);
      await saveChapterExamConfig(selectedChapterId, {
        ...currentConfig,
        chapterId: selectedChapterId,
      });

      setConfigs((prev) => ({
        ...prev,
        [selectedChapterId]: { ...currentConfig, chapterId: selectedChapterId },
      }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err?.message || 'Failed to save exam config.');
    }
  };

  if (loading) {
    return <Loading text="Loading chapter exam configurations..." />;
  }

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);
  const selectedSubject = selectedChapter ? subjects.find((s) => s.id === selectedChapter.subjectId) : null;
  const chapterQuestionsPool = questions.filter(
    (q) => q.chapterId === selectedChapterId && q.published !== false
  );

  const poolShortage = chapterQuestionsPool.length < currentConfig.questionCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Chapter Exam Automation & Rules
            </h1>
            <p className="text-xs text-slate-500">
              Configure automatic exam unlocks upon chapter class completion and question pool parameters.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Chapter exam rules and automated assignment parameters saved successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Chapter Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
        <label className="block text-slate-600 font-bold text-xs">Select Chapter to Configure</label>
        <select
          value={selectedChapterId}
          onChange={(e) => handleSelectChapter(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
        >
          {chapters.map((c) => {
            const sub = subjects.find((s) => s.id === c.subjectId);
            return (
              <option key={c.id} value={c.id}>
                {sub?.name || c.subjectId} — {c.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Pool Health Check Card */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
        poolShortage ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          {poolShortage ? (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <strong className="font-bold text-sm block">
              Question Pool Status: {chapterQuestionsPool.length} Published MCQs Available
            </strong>
            <p className="text-xs mt-0.5 opacity-90">
              Exam requires {currentConfig.questionCount} questions per student assignment.
              {poolShortage && ' Add more questions to the question bank so tests can be randomly generated.'}
            </p>
          </div>
        </div>

        <Link
          to={`/admin/questions/new?chapterId=${selectedChapterId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-inherit text-slate-800 font-bold text-xs shrink-0 shadow-xs"
        >
          + Add Questions to Pool
        </Link>
      </div>

      {/* Config Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        {/* Enable / Disable */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Enable Chapter Test</h3>
            <p className="text-slate-500 text-xs">
              When enabled, students automatically unlock this test once they finish all chapter classes.
            </p>
          </div>
          <input
            type="checkbox"
            checked={currentConfig.enabled}
            onChange={(e) => setCurrentConfig({ ...currentConfig, enabled: e.target.checked })}
            className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
          />
        </div>

        {/* Rule and Question count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Unlock Trigger Rule
            </label>
            <select
              value={currentConfig.unlockRule}
              onChange={(e) => setCurrentConfig({ ...currentConfig, unlockRule: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="ALL_REQUIRED_CLASSES_COMPLETED">
                All Published Classes Completed (100%)
              </option>
              <option value="PERCENTAGE_CLASSES_COMPLETED">
                Percentage of Classes Completed (e.g. 80%)
              </option>
              <option value="MANUAL_UNLOCK">Manual Admin Unlock Only</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Questions Selected per Test
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={currentConfig.questionCount}
              onChange={(e) => setCurrentConfig({ ...currentConfig, questionCount: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              required
            />
          </div>
        </div>

        {/* Pass mark & duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Pass Mark Percentage (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={currentConfig.passMark}
              onChange={(e) => setCurrentConfig({ ...currentConfig, passMark: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Duration (Seconds) — e.g. 600s = 10 min
            </label>
            <input
              type="number"
              min={60}
              step={60}
              value={currentConfig.durationSeconds}
              onChange={(e) => setCurrentConfig({ ...currentConfig, durationSeconds: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              required
            />
          </div>
        </div>

        {/* Randomization & Retakes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Randomize Question Order</span>
            <input
              type="checkbox"
              checked={currentConfig.randomizeQuestions}
              onChange={(e) => setCurrentConfig({ ...currentConfig, randomizeQuestions: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Allow Retakes / Practice</span>
            <input
              type="checkbox"
              checked={currentConfig.allowRetakes}
              onChange={(e) => setCurrentConfig({ ...currentConfig, allowRetakes: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Show Correct Answers in Results</span>
            <input
              type="checkbox"
              checked={currentConfig.showCorrectAnswerAfterSubmit}
              onChange={(e) => setCurrentConfig({ ...currentConfig, showCorrectAnswerAfterSubmit: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Show Full Explanations in Results</span>
            <input
              type="checkbox"
              checked={currentConfig.showExplanationAfterSubmit}
              onChange={(e) => setCurrentConfig({ ...currentConfig, showExplanationAfterSubmit: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Exam Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

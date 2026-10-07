import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  getQuestion,
  getSubjects,
  getChapters,
  createQuestion,
  updateQuestion,
  checkDuplicateQuestion
} from '../../lib/database';
import { Loading } from '../../components/Loading';
import type { Subject, Chapter, QuestionDifficulty, QuestionSourceType } from '../../types';

export const AdminQuestionForm: React.FC = () => {
  const { id: questionId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(questionId);

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Form fields
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answerIndex, setAnswerIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('MEDIUM');
  const [sourceType, setSourceType] = useState<QuestionSourceType>('BOARD');
  const [sourceName, setSourceName] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [marks, setMarks] = useState<number>(1);
  const [tagsInput, setTagsInput] = useState('');
  const [published, setPublished] = useState(true);

  // Duplicate warning & form error
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function initForm() {
      try {
        setLoading(true);
        const [subList, chapList] = await Promise.all([
          getSubjects(),
          getChapters(),
        ]);
        if (!isMounted) return;
        setSubjects(subList);
        setChapters(chapList);

        if (isEditing && questionId) {
          const q = await getQuestion(questionId);
          if (q && isMounted) {
            setSubjectId(q.subjectId);
            setChapterId(q.chapterId);
            setQuestionText(q.question);
            setOptions(q.options || ['', '', '', '']);
            setAnswerIndex(Number(q.answer) || 0);
            setExplanation(q.explanation || '');
            setDifficulty(q.difficulty || 'MEDIUM');
            setSourceType(q.sourceType || 'BOARD');
            setSourceName(q.sourceName || '');
            setYear(Number(q.year) || 2024);
            setMarks(Number(q.marks) || 1);
            setTagsInput((q.tags || []).join(', '));
            setPublished(q.published !== false);
          }
        } else {
          if (subList.length > 0) setSubjectId(subList[0].id);
          if (chapList.length > 0) setChapterId(chapList[0].id);
        }
      } catch (err) {
        console.error('Failed to init question form:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initForm();
    return () => {
      isMounted = false;
    };
  }, [isEditing, questionId]);

  // Check duplicate on blur
  const handleCheckDuplicate = async () => {
    if (!questionText.trim() || !chapterId) return;
    try {
      const dup = await checkDuplicateQuestion(questionText, chapterId, questionId);
      if (dup) {
        setDuplicateWarning(`Identical or very similar question already exists: "${dup.question.substring(0, 60)}..." (ID: ${dup.id})`);
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!questionText.trim()) {
      setFormError('Please provide question text.');
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      setFormError('Please fill out all 4 options.');
      return;
    }

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        curriculumId: 'nctb-ssc-2026',
        subjectId,
        chapterId,
        type: 'MCQ' as const,
        sourceType,
        sourceName: sourceName.trim(),
        year,
        question: questionText.trim(),
        options: options.map((o) => o.trim()),
        answer: answerIndex,
        explanation: explanation.trim(),
        difficulty,
        marks: Number(marks) || 1,
        tags,
        published,
      };

      if (isEditing && questionId) {
        await updateQuestion(questionId, payload);
      } else {
        await createQuestion(payload);
      }

      navigate('/admin/questions');
    } catch (err: any) {
      console.error('Error saving question:', err);
      setFormError(`Could not save question: ${err?.message || 'Check database permissions'}`);
    }
  };

  if (loading) {
    return <Loading text="Loading question editor..." />;
  }

  const availableChapters = chapters.filter((c) => !subjectId || c.subjectId === subjectId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/questions"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Question' : 'Create New MCQ Question'}
            </h1>
            <p className="text-xs text-slate-500">
              Board standard assessment question for Class 9-10 / SSC students.
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{formError}</div>
        </div>
      )}

      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Duplicate Notice:</strong> {duplicateWarning}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
        {/* Subject & Chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Subject *</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                const subChapters = chapters.filter((c) => c.subjectId === e.target.value);
                if (subChapters.length > 0) setChapterId(subChapters[0].id);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
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
            <label className="block text-slate-700 font-bold mb-1.5">Chapter *</label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              required
            >
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-slate-700 font-bold mb-1.5">
            Question Text (Bengali or English) *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. নিচের কোনটি ভেক্টর রাশি? / Which of the following is a vector quantity?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onBlur={handleCheckDuplicate}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm leading-relaxed"
            required
          />
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          <label className="block text-slate-700 font-bold">
            Options & Correct Answer Selection *
          </label>

          <div className="space-y-2.5">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isCorrect = answerIndex === idx;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAnswerIndex(idx)}
                    className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 cursor-pointer ${
                      isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    {letter}
                  </button>

                  <input
                    type="text"
                    placeholder={`Option ${letter}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs sm:text-sm focus:outline-none"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setAnswerIndex(idx)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg cursor-pointer ${
                      isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200/80 text-slate-600 hover:bg-emerald-100'
                    }`}
                  >
                    {isCorrect ? '✓ Correct Answer' : 'Set as Correct'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-slate-700 font-bold mb-1.5">
            Step-by-step Solution & Explanation
          </label>
          <textarea
            rows={3}
            placeholder="Detailed physical or mathematical reasoning explaining why this option is correct..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200"
          />
        </div>

        {/* Difficulty, Source, Year, Marks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Source Type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as QuestionSourceType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="BOARD">Board Exam</option>
              <option value="CLEAR_EDU_ORIGINAL">CLEAR EDU Original</option>
              <option value="PRACTICE">NCTB Practice</option>
              <option value="ADMISSION">Admission</option>
              <option value="AUTHORIZED">Authorized</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Exam / Board Name</label>
            <input
              type="text"
              placeholder="e.g. Dhaka Board 2024"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Tags & Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. vector, kinematics, board-2024"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="publishQuestion"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label htmlFor="publishQuestion" className="text-slate-800 font-bold cursor-pointer">
            Publish Question to Student Bank & Chapter Tests
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/admin/questions"
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Update Question' : 'Save Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

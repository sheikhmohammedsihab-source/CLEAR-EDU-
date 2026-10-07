import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronDown,
  RotateCcw,
  Tag
} from 'lucide-react';
import { getQuestions, getSubjects, getChapters } from '../lib/database';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import type { Question, Subject, Chapter } from '../types';

export const QuestionBank: React.FC = () => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Interactive Practice State per question: questionId -> selectedOptionIndex
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [qList, subList, chapList] = await Promise.all([
          getQuestions({ publishedOnly: true }),
          getSubjects(),
          getChapters(),
        ]);

        if (!isMounted) return;
        setQuestions(qList);
        setSubjects(subList.filter((s) => s.published !== false));
        setChapters(chapList.filter((c) => c.published !== false));
      } catch (err) {
        console.error('Error loading question bank:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered chapters based on selected subject
  const availableChapters = useMemo(() => {
    if (selectedSubject === 'all') return chapters;
    return chapters.filter((c) => c.subjectId === selectedSubject);
  }, [chapters, selectedSubject]);

  // Unique years in questions
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    questions.forEach((q) => {
      if (q.year) years.add(String(q.year));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
      if (selectedChapter !== 'all' && q.chapterId !== selectedChapter) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedSourceType !== 'all' && q.sourceType !== selectedSourceType) return false;
      if (selectedYear !== 'all' && String(q.year) !== selectedYear) return false;

      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase().trim();
        const inQuestion = q.question.toLowerCase().includes(qLower);
        const inSource = q.sourceName?.toLowerCase().includes(qLower);
        const inExplanation = q.explanation?.toLowerCase().includes(qLower);
        const inTags = q.tags?.some((t) => t.toLowerCase().includes(qLower));
        if (!inQuestion && !inSource && !inExplanation && !inTags) return false;
      }

      return true;
    });
  }, [
    questions,
    selectedSubject,
    selectedChapter,
    selectedDifficulty,
    selectedSourceType,
    selectedYear,
    searchQuery,
  ]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleToggleExplanation = (questionId: string) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedChapter('all');
    setSelectedDifficulty('all');
    setSelectedSourceType('all');
    setSelectedYear('all');
  };

  if (loading) {
    return <Loading text="Loading official question bank..." />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-3 border border-white/15">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
            <span>NCTB Board Standard Questions & Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Question Bank
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            Curated multiple-choice questions from Board Exams, NCTB Exemplars, and CLEAR EDU Original question sets. Practice with instant feedback and Clear Buddy explanations.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keyword, topic, or board (e.g. গতি, ভরবেগ, Dhaka Board)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Subject */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedChapter('all');
              }}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Chapter</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Chapters</option>
              {availableChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy (সহজ)</option>
              <option value="MEDIUM">Medium (মধ্যম)</option>
              <option value="HARD">Hard (কঠিন)</option>
            </select>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Source</label>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="BOARD">Board Exam (বোর্ড প্রশ্ন)</option>
              <option value="CLEAR_EDU_ORIGINAL">CLEAR EDU Original</option>
              <option value="PRACTICE">NCTB Practice</option>
              <option value="ADMISSION">Admission</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-bold">{filteredQuestions.length}</strong> of{' '}
            {questions.length} questions
          </span>
          {(searchQuery ||
            selectedSubject !== 'all' ||
            selectedChapter !== 'all' ||
            selectedDifficulty !== 'all' ||
            selectedSourceType !== 'all' ||
            selectedYear !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions match your filter"
          description="Try adjusting your filters or search keywords to view other questions."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, qIndex) => {
            const subjectObj = subjects.find((s) => s.id === q.subjectId);
            const chapterObj = chapters.find((c) => c.id === q.chapterId);
            const userPick = revealedAnswers[q.id];
            const isAnswered = userPick !== undefined;
            const isCorrect = isAnswered && Number(userPick) === Number(q.answer);
            const isExpOpen = showExplanation[q.id] || isAnswered;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs transition-all hover:border-slate-300"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      #{qIndex + 1}
                    </span>
                    {subjectObj && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {subjectObj.name}
                      </span>
                    )}
                    {chapterObj && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 border border-slate-200 truncate max-w-[200px]">
                        {chapterObj.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {q.sourceName && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Tag className="w-3 h-3 text-amber-600" />
                        {q.sourceName}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.difficulty === 'HARD'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-semibold text-slate-900 leading-relaxed mb-4">
                  {q.question}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {q.options.map((option, optIdx) => {
                    const isSelected = userPick === optIdx;
                    const isTheCorrectOption = Number(q.answer) === optIdx;

                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300';
                    if (isAnswered) {
                      if (isTheCorrectOption) {
                        optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium ring-1 ring-emerald-400';
                      } else if (isSelected) {
                        optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium ring-1 ring-rose-400';
                      } else {
                        optionStyle = 'bg-slate-50/50 border-slate-200 text-slate-400';
                      }
                    }

                    const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-white border border-inherit text-xs font-bold flex items-center justify-center shrink-0">
                          {optLetter}
                        </span>
                        <span className="text-xs sm:text-sm mt-0.5">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Practice Feedback / Explanation */}
                {isAnswered && (
                  <div className={`mt-3 p-3.5 rounded-xl border text-xs ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct Answer! (+{q.marks || 1} mark)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect. Correct Option: {String.fromCharCode(65 + Number(q.answer))} ({q.options[Number(q.answer)]})</span>
                        </>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="mt-1 text-slate-700 leading-relaxed">
                        <strong className="font-semibold">Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer Actions: Ask Clear Buddy & Chapter Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {chapterObj ? (
                    <Link
                      to={`/chapter/${chapterObj.id}`}
                      className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      View Chapter Lectures
                    </Link>
                  ) : <div />}

                  <Link
                    to={`/clear-buddy?subject=${encodeURIComponent(subjectObj?.name || '')}&chapter=${encodeURIComponent(chapterObj?.name || '')}&question=${encodeURIComponent(q.question)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ask Clear Buddy to Explain</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Award
} from 'lucide-react';
import {
  getExamAttempt,
  getExamAttemptAnswers,
  getQuestion,
  getChapter,
  getSubject,
} from '../lib/database';
import { Loading } from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import type { QuestionAttempt, QuestionAnswer, Question, Chapter, Subject } from '../types';

export const ExamResult: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<QuestionAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadResultData() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const effectiveUid = currentUser?.uid || 'guest';
        const [att, ans] = await Promise.all([
          getExamAttempt(effectiveUid, attemptId),
          getExamAttemptAnswers(effectiveUid, attemptId),
        ]);

        if (!isMounted || !att) {
          if (isMounted) setLoading(false);
          return;
        }

        setAttempt(att);
        setAnswers(ans);

        // Fetch question objects
        const fetchedQuestions = await Promise.all(
          att.questionIds.map((qid) => getQuestion(qid))
        );

        if (!isMounted) return;
        setQuestions(fetchedQuestions.filter((q): q is Question => q !== null));

        if (att.chapterId) {
          const chap = await getChapter(att.chapterId);
          if (chap && isMounted) {
            setChapter(chap);
            const subj = await getSubject(chap.subjectId);
            if (subj && isMounted) setSubject(subj);
          }
        }
      } catch (err) {
        console.error('Error loading exam result:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResultData();
    return () => {
      isMounted = false;
    };
  }, [attemptId, currentUser]);

  if (loading) {
    return <Loading text="Analyzing your test results and mastery report..." />;
  }

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Result Not Found</h2>
        <p className="text-sm text-slate-600">
          The exam attempt record could not be loaded or belongs to another account.
        </p>
        <Link to="/progress" className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">
          Go to My Progress
        </Link>
      </div>
    );
  }

  const passed = attempt.passed;
  const isMastered = attempt.mastered || attempt.percentage >= 85;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Viewing guest exam result. Sign in to permanently record your scores and track chapter mastery.</span>
          </div>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Sign In to Save
          </Link>
        </div>
      )}

      {/* 1. Score Summary Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900'
            : 'bg-gradient-to-br from-rose-900 via-indigo-950 to-slate-900'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider mb-3">
              {isMastered ? (
                <>
                  <Award className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-300">Chapter Mastered (85%+)</span>
                </>
              ) : passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Exam Passed</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 text-rose-300" />
                  <span>Needs Improvement</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {chapter?.name || 'Chapter Assessment'}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Completed on {new Date(attempt.submittedAt).toLocaleDateString()} at{' '}
              {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Big Score Percentage Dial */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 w-full sm:w-auto">
            <span className="text-4xl sm:text-5xl font-extrabold block">
              {attempt.percentage}%
            </span>
            <span className="text-xs text-white/80 font-semibold uppercase tracking-wider">
              Score: {attempt.score} / {attempt.totalMarks} Marks
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15 text-xs">
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-emerald-300 font-bold text-lg block">{attempt.correctCount}</span>
            <span className="text-white/70">Correct Answers</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-rose-300 font-bold text-lg block">{attempt.wrongCount}</span>
            <span className="text-white/70">Wrong Answers</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-slate-300 font-bold text-lg block">{attempt.unansweredCount}</span>
            <span className="text-white/70">Unanswered</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-amber-300 font-bold text-lg block">
              {Math.floor(attempt.durationSeconds / 60)}m {attempt.durationSeconds % 60}s
            </span>
            <span className="text-white/70">Time Spent</span>
          </div>
        </div>
      </div>

      {/* 2. Topics & Recommendations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Topics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Strong Topics
          </h3>
          {attempt.strongTopics && attempt.strongTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attempt.strongTopics.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  ✓ {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Practice more to establish strong subject topics.</p>
          )}
        </div>

        {/* Weak Topics & Clear Buddy Guidance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-rose-800 flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Areas for Revision
          </h3>
          {attempt.weakTopics && attempt.weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attempt.weakTopics.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                  ! {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-semibold">No critical weak topics found!</p>
          )}
        </div>
      </div>

      {/* 3. Ask Clear Buddy for Study Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-2xl border border-indigo-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Need help understanding your mistakes?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Clear Buddy can explain step-by-step why your answers were wrong and recommend focused lectures.
            </p>
          </div>
        </div>

        <Link
          to={`/clear-buddy?subject=${encodeURIComponent(subject?.name || '')}&chapter=${encodeURIComponent(chapter?.name || '')}&score=${attempt.percentage}&weakTopics=${encodeURIComponent(attempt.weakTopics?.join(',') || '')}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Clear Buddy to Review Mistakes</span>
        </Link>
      </div>

      {/* 4. Question by Question Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Detailed Question Breakdown
        </h2>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const studentAns = answers[q.id];
            const isCorrect = studentAns?.correct;
            const chosenIndex = Number(studentAns?.selectedAnswer);
            const isUnanswered = chosenIndex === -1 || chosenIndex === undefined;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs ${
                  isCorrect
                    ? 'border-emerald-200'
                    : isUnanswered
                    ? 'border-slate-200'
                    : 'border-rose-200'
                }`}
              >
                {/* Status indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-500">#{idx + 1}</span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks || 1})
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        Unanswered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/clear-buddy?question=${encodeURIComponent(q.question)}&userAnswer=${encodeURIComponent(chosenIndex >= 0 ? q.options[chosenIndex] : 'Unanswered')}&correctAnswer=${encodeURIComponent(q.options[Number(q.answer)])}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Explain this mistake</span>
                  </Link>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-semibold text-slate-900 leading-relaxed mb-4">
                  {q.question}
                </h3>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isTheCorrect = Number(q.answer) === optIdx;
                    const isChosenByStudent = chosenIndex === optIdx;

                    let optClass = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isTheCorrect) {
                      optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400';
                    } else if (isChosenByStudent && !isCorrect) {
                      optClass = 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-400 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${optClass}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-inherit text-[11px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold block mb-0.5">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Retake & Continue Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <Link
          to={`/chapter/${chapter?.id}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Return to Chapter Lessons</span>
        </Link>

        <Link
          to={`/exam/${chapter?.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Chapter Test</span>
        </Link>
      </div>
    </div>
  );
};

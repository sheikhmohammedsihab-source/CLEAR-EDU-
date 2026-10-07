import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Send,
  Flag,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  getChapter,
  getSubject,
  getChapterExamConfig,
  getQuestions,
  getStudentAssignments,
  submitExamAttempt,
} from '../lib/database';
import { Loading } from '../components/Loading';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import type { Question, ChapterExamConfig, QuestionAttempt, QuestionAnswer } from '../types';

export const Exam: React.FC = () => {
  const { id: examTargetId } = useParams<{ id: string }>(); // Can be assignmentId or chapterId
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examConfig, setExamConfig] = useState<ChapterExamConfig | null>(null);
  const [chapterTitle, setChapterTitle] = useState('Chapter Test');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [chapterId, setChapterId] = useState<string>('');

  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10m default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const timerRef = useRef<any>(null);

  // Load exam questions and config
  useEffect(() => {
    let isMounted = true;
    async function initExam() {
      if (!examTargetId) return;
      try {
        setLoading(true);
        let targetChapterId = examTargetId;
        let selectedQIds: string[] | null = null;

        // Check if examTargetId is an assignmentId for current user
        if (currentUser) {
          const assignments = await getStudentAssignments(currentUser.uid);
          const matchedAssignment = assignments.find((a) => a.id === examTargetId || a.chapterId === examTargetId);
          if (matchedAssignment) {
            targetChapterId = matchedAssignment.chapterId || targetChapterId;
            selectedQIds = matchedAssignment.questionIds;
          }
        }

        setChapterId(targetChapterId);

        // Fetch chapter, subject & exam config
        const [chap, config] = await Promise.all([
          getChapter(targetChapterId),
          getChapterExamConfig(targetChapterId),
        ]);

        if (!isMounted) return;

        if (chap) {
          setChapterTitle(chap.name || chap.title || 'Chapter Assessment');
          const subj = await getSubject(chap.subjectId);
          if (subj && isMounted) setSubjectTitle(subj.name);
        }

        const effectiveDuration = config?.durationSeconds || 600;
        setExamConfig(config);
        setTimeLeftSeconds(effectiveDuration);

        // Fetch questions
        let examQuestions: Question[] = [];
        if (selectedQIds && selectedQIds.length > 0) {
          const allPool = await getQuestions({ chapterId: targetChapterId });
          examQuestions = selectedQIds
            .map((qid) => allPool.find((q) => q.id === qid))
            .filter((q): q is Question => q !== undefined);
        }

        if (examQuestions.length === 0) {
          const allChapterQuestions = await getQuestions({ chapterId: targetChapterId, publishedOnly: true });
          const count = config?.questionCount || 5;
          examQuestions = allChapterQuestions.slice(0, count);
        }

        if (!isMounted) return;
        setQuestions(examQuestions);

        // Check local storage backup for existing answers during this session
        try {
          const savedLocal = localStorage.getItem(`clearedu_exam_answers_${targetChapterId}`);
          if (savedLocal) {
            setUserAnswers(JSON.parse(savedLocal));
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Failed to initialize exam:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initExam();
    return () => {
      isMounted = false;
    };
  }, [examTargetId, currentUser]);

  // Countdown Timer
  useEffect(() => {
    if (loading || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions]);

  // Handle auto-submission when timer hits zero
  const handleAutoSubmit = () => {
    handleSubmitExam(true);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => {
      const next = { ...prev, [questionId]: optionIndex };
      if (chapterId) {
        try {
          localStorage.setItem(`clearedu_exam_answers_${chapterId}`, JSON.stringify(next));
        } catch (e) {
          // ignore
        }
      }
      return next;
    });
  };

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSubmitExam = async (isAuto = false) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorBanner(null);
      if (timerRef.current) clearInterval(timerRef.current);

      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      let earnedScore = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      const answersMap: Record<string, QuestionAnswer> = {};
      const weakTopicsSet = new Set<string>();
      const strongTopicsSet = new Set<string>();

      questions.forEach((q) => {
        const userChoice = userAnswers[q.id];
        if (userChoice === undefined) {
          unansweredCount++;
          if (q.tags && q.tags.length > 0) weakTopicsSet.add(q.tags[0]);
          answersMap[q.id] = {
            selectedAnswer: -1,
            correct: false,
            answeredAt: Date.now(),
          };
        } else if (Number(userChoice) === Number(q.answer)) {
          correctCount++;
          earnedScore += q.marks || 1;
          if (q.tags && q.tags.length > 0) strongTopicsSet.add(q.tags[0]);
          answersMap[q.id] = {
            selectedAnswer: userChoice,
            correct: true,
            answeredAt: Date.now(),
          };
        } else {
          wrongCount++;
          if (q.tags && q.tags.length > 0) weakTopicsSet.add(q.tags[0]);
          answersMap[q.id] = {
            selectedAnswer: userChoice,
            correct: false,
            answeredAt: Date.now(),
          };
        }
      });

      const percentage = totalMarks > 0 ? Math.round((earnedScore / totalMarks) * 100) : 0;
      const passMark = examConfig?.passMark || 50;
      const passed = percentage >= passMark;
      const mastered = percentage >= 85;
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);

      const attemptPayload: Omit<QuestionAttempt, 'id'> = {
        examId: examTargetId || chapterId,
        examType: 'CHAPTER',
        subjectId: chapterId.split('-')[0] || 'physics',
        chapterId,
        questionIds: questions.map((q) => q.id),
        startedAt: startTime,
        submittedAt: Date.now(),
        score: earnedScore,
        totalMarks,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        durationSeconds,
        status: passed ? 'PASSED' : 'FAILED',
        passed,
        mastered,
        strongTopics: Array.from(strongTopicsSet),
        weakTopics: Array.from(weakTopicsSet),
      };

      const effectiveUid = currentUser?.uid || 'guest';
      const attemptId = await submitExamAttempt(effectiveUid, attemptPayload, answersMap);

      // Clean local backup
      try {
        localStorage.removeItem(`clearedu_exam_answers_${chapterId}`);
      } catch (e) {
        // ignore
      }

      navigate(`/exam/${attemptId}/result`, { replace: true });
    } catch (err: any) {
      console.error('Error submitting exam attempt:', err);
      setErrorBanner(err?.message || 'Could not submit attempt. Please retry.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Preparing your distraction-free examination room..." />;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Insufficient Question Pool</h2>
        <p className="text-sm text-slate-600">
          This chapter test does not have enough approved questions published yet. Please check back soon or explore other chapters.
        </p>
        <Link
          to={`/chapter/${chapterId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          Back to Chapter
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  // Format timer
  const timerMinutes = Math.floor(timeLeftSeconds / 60);
  const timerSecs = timeLeftSeconds % 60;
  const isTimeCritical = timeLeftSeconds < 120;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Exam Header with Timer & Submit */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
            {subjectTitle} • Chapter Test
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
            {chapterTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {String(timerMinutes).padStart(2, '0')}:{String(timerSecs).padStart(2, '0')}
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3">
          <span>{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} className="text-rose-500 hover:text-rose-700 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Examination Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            {/* Question Progress Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <button
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  flaggedQuestions[currentQ.id]
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[currentQ.id] ? 'Flagged for Review' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Body */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed mb-6">
              {currentQ.question}
            </h2>

            {/* Touch-Friendly Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/90 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="text-sm sm:text-base mt-1 leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                >
                  <span>Submit Exam</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Palette Grid & Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>

            {/* Quick Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = userAnswers[q.id] !== undefined;
                const isFlagged = flaggedQuestions[q.id];

                let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isAnswered) {
                  btnClass = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-offset-2 ring-indigo-500';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Submit Examination?"
        message={
          unansweredCount > 0
            ? `You still have ${unansweredCount} unanswered ${
                unansweredCount === 1 ? 'question' : 'questions'
              }. Are you sure you want to finish and submit your attempt?`
            : 'You have answered all questions. Are you ready to see your verified score and topic analysis?'
        }
        confirmText={isSubmitting ? 'Grading...' : 'Yes, Submit Exam'}
        cancelText="Keep Answering"
        onConfirm={() => handleSubmitExam(false)}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

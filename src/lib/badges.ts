import type { UserBadge, UserProgressMap, ClassItem, QuestionAttempt, Chapter } from '../types';

/**
 * Calculates current learning streak and active study dates.
 */
export function calculateLearningStreak(
  userProgress: UserProgressMap,
  examAttempts: QuestionAttempt[]
): {
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  lastActiveDate: string | null;
} {
  const dateSet = new Set<string>();

  // Extract dates from class watch and completion timestamps
  Object.values(userProgress).forEach((p) => {
    if (p.lastWatchedAt) {
      const d = new Date(p.lastWatchedAt).toISOString().split('T')[0];
      dateSet.add(d);
    }
    if (p.completedAt) {
      const d = new Date(p.completedAt).toISOString().split('T')[0];
      dateSet.add(d);
    }
  });

  // Extract dates from exam attempts
  examAttempts.forEach((a) => {
    const timestamp = a.submittedAt || a.startedAt;
    if (timestamp) {
      const d = new Date(timestamp).toISOString().split('T')[0];
      dateSet.add(d);
    }
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  const activeDaysCount = sortedDates.length;

  if (activeDaysCount === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeDaysCount: 0,
      lastActiveDate: null,
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const mostRecentDate = sortedDates[0];

  // If user studied today or yesterday, streak is currently active
  let currentStreak = 0;
  if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
    let checkDate = new Date(mostRecentDate);
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(expectedStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // Inactive currently, but if they have at least 1 historical session, show minimal baseline of 1 if studied
    currentStreak = 0;
  }

  // Calculate longest streak in history
  let longestStreak = currentStreak;
  let tempStreak = 1;
  const chronological = Array.from(dateSet).sort();

  for (let i = 1; i < chronological.length; i++) {
    const prev = new Date(chronological[i - 1]);
    const curr = new Date(chronological[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    activeDaysCount,
    lastActiveDate: mostRecentDate,
  };
}

/**
 * Evaluates all user badges based on curriculum progress, streaks, exams, and watch time.
 */
export function evaluateUserBadges(params: {
  userProgress: UserProgressMap;
  classes: ClassItem[];
  examAttempts: QuestionAttempt[];
  chapters?: Chapter[];
}): {
  badges: UserBadge[];
  streakDays: number;
  unlockedCount: number;
  totalCount: number;
  totalWatchSeconds: number;
} {
  const { userProgress, classes, examAttempts } = params;

  // Streak metrics
  const { currentStreak, activeDaysCount } = calculateLearningStreak(userProgress, examAttempts);
  // Baseline streak value for initial rewards: if user has any activity, streak is at least 1
  const effectiveStreak = Math.max(currentStreak, activeDaysCount > 0 ? 1 : 0);

  // Completed classes count
  const completedClasses = classes.filter((c) => userProgress[c.id]?.completed);
  const completedCount = completedClasses.length;

  // Total watch seconds
  const totalWatchSeconds = Object.values(userProgress).reduce((acc, p) => {
    return acc + (p.positionSeconds || 0);
  }, 0);

  // Exam stats
  const passedExams = examAttempts.filter((a) => a.passed);
  const bestScore = examAttempts.reduce((max, a) => Math.max(max, a.percentage || 0), 0);

  // Science & Math classes completed
  const stemCount = completedClasses.filter((c) =>
    ['physics', 'chemistry', 'biology', 'general-math', 'higher-math'].includes(c.subjectId)
  ).length;

  // Chapter full completion: does any chapter have all its classes marked complete?
  const chapterCompletionMap: Record<string, { total: number; completed: number }> = {};
  classes.forEach((c) => {
    if (!chapterCompletionMap[c.chapterId]) {
      chapterCompletionMap[c.chapterId] = { total: 0, completed: 0 };
    }
    chapterCompletionMap[c.chapterId].total++;
    if (userProgress[c.id]?.completed) {
      chapterCompletionMap[c.chapterId].completed++;
    }
  });

  const completedChaptersCount = Object.values(chapterCompletionMap).filter(
    (ch) => ch.total > 0 && ch.completed >= ch.total
  ).length;

  // Raw Badges Definition with dynamic evaluation
  const badges: UserBadge[] = [
    // ---------------- 1. STREAK ACHIEVEMENTS ----------------
    {
      id: 'streak-1',
      name: 'First Spark',
      bnName: 'প্রথম পদক্ষেপ',
      description: 'Began your noise-free learning journey and logged your first study session.',
      category: 'STREAK',
      icon: 'Flame',
      gradient: 'from-amber-500 to-orange-500',
      unlocked: effectiveStreak >= 1,
      currentProgress: Math.min(effectiveStreak, 1),
      maxProgress: 1,
      progressLabel: `${Math.min(effectiveStreak, 1)} / 1 Day Streak`,
    },
    {
      id: 'streak-3',
      name: 'Consistent Scholar',
      bnName: 'নিয়মিত শিক্ষার্থী',
      description: 'Studied for 3 consecutive days without getting pulled into social media feeds.',
      category: 'STREAK',
      icon: 'Zap',
      gradient: 'from-orange-500 to-amber-600',
      unlocked: effectiveStreak >= 3,
      currentProgress: Math.min(effectiveStreak, 3),
      maxProgress: 3,
      progressLabel: `${Math.min(effectiveStreak, 3)} / 3 Days Streak`,
    },
    {
      id: 'streak-7',
      name: 'Weekly Dedication',
      bnName: 'সাপ্তাহিক ব্রত',
      description: 'Maintained a full 7-day study streak. Pure focus on your SSC curriculum.',
      category: 'STREAK',
      icon: 'Award',
      gradient: 'from-amber-400 to-yellow-500',
      unlocked: effectiveStreak >= 7,
      currentProgress: Math.min(effectiveStreak, 7),
      maxProgress: 7,
      progressLabel: `${Math.min(effectiveStreak, 7)} / 7 Days Streak`,
    },
    {
      id: 'streak-14',
      name: 'Iron Will',
      bnName: 'অধ্যবসায়ী ব্রত',
      description: 'Two full weeks of uninterrupted daily academic revision and progress.',
      category: 'STREAK',
      icon: 'Shield',
      gradient: 'from-yellow-500 to-amber-700',
      unlocked: effectiveStreak >= 14,
      currentProgress: Math.min(effectiveStreak, 14),
      maxProgress: 14,
      progressLabel: `${Math.min(effectiveStreak, 14)} / 14 Days Streak`,
    },
    {
      id: 'streak-30',
      name: 'SSC Master Routine',
      bnName: 'মাস্টার রুটিন',
      description: '30 days of persistent study! Built an unbeatable daily learning discipline.',
      category: 'STREAK',
      icon: 'Crown',
      gradient: 'from-amber-500 via-rose-500 to-indigo-600',
      unlocked: effectiveStreak >= 30,
      currentProgress: Math.min(effectiveStreak, 30),
      maxProgress: 30,
      progressLabel: `${Math.min(effectiveStreak, 30)} / 30 Days Streak`,
    },

    // ---------------- 2. COURSE & LESSON COMPLETIONS ----------------
    {
      id: 'course-starter',
      name: 'Curriculum Explorer',
      bnName: 'পাঠ্যক্রম অভিযাত্রী',
      description: 'Completed your first 3 official NCTB video lessons.',
      category: 'COURSES',
      icon: 'BookOpen',
      gradient: 'from-blue-500 to-indigo-600',
      unlocked: completedCount >= 3,
      currentProgress: Math.min(completedCount, 3),
      maxProgress: 3,
      progressLabel: `${Math.min(completedCount, 3)} / 3 Classes`,
    },
    {
      id: 'course-regular',
      name: 'Classroom Regular',
      bnName: 'নিয়মিত পাঠক',
      description: 'Completed 10 comprehensive classes across your subjects.',
      category: 'COURSES',
      icon: 'Layers',
      gradient: 'from-indigo-500 to-purple-600',
      unlocked: completedCount >= 10,
      currentProgress: Math.min(completedCount, 10),
      maxProgress: 10,
      progressLabel: `${Math.min(completedCount, 10)} / 10 Classes`,
    },
    {
      id: 'course-chapter-finisher',
      name: 'Chapter Finisher',
      bnName: 'অধ্যায় বিজয়ী',
      description: 'Finished all required published classes of at least one chapter.',
      category: 'COURSES',
      icon: 'CheckCircle2',
      gradient: 'from-emerald-500 to-teal-600',
      unlocked: completedChaptersCount >= 1,
      currentProgress: Math.min(completedChaptersCount, 1),
      maxProgress: 1,
      progressLabel: `${Math.min(completedChaptersCount, 1)} / 1 Chapter Completed`,
    },
    {
      id: 'course-stem',
      name: 'STEM Pioneer',
      bnName: 'বিজ্ঞান ও গণিত বিশারদ',
      description: 'Mastered 5 or more classes in Physics, Chemistry, Biology, or Mathematics.',
      category: 'COURSES',
      icon: 'Sparkles',
      gradient: 'from-cyan-500 to-blue-600',
      unlocked: stemCount >= 5,
      currentProgress: Math.min(stemCount, 5),
      maxProgress: 5,
      progressLabel: `${Math.min(stemCount, 5)} / 5 STEM Classes`,
    },
    {
      id: 'course-milestone',
      name: 'Halfway Scholar',
      bnName: 'অর্ধেক পথ অতিক্রম',
      description: 'Completed 25 classes on CLEAR EDU with verified watch history.',
      category: 'COURSES',
      icon: 'GraduationCap',
      gradient: 'from-purple-500 to-pink-600',
      unlocked: completedCount >= 25,
      currentProgress: Math.min(completedCount, 25),
      maxProgress: 25,
      progressLabel: `${Math.min(completedCount, 25)} / 25 Classes`,
    },

    // ---------------- 3. EXAMS & ASSESSMENTS ----------------
    {
      id: 'exam-debut',
      name: 'Test Taker',
      bnName: 'প্রথম পরীক্ষা',
      description: 'Unlocked and attempted your first automated Chapter MCQ Exam.',
      category: 'EXAMS',
      icon: 'HelpCircle',
      gradient: 'from-sky-500 to-indigo-600',
      unlocked: examAttempts.length >= 1,
      currentProgress: Math.min(examAttempts.length, 1),
      maxProgress: 1,
      progressLabel: `${Math.min(examAttempts.length, 1)} / 1 Exam Attempted`,
    },
    {
      id: 'exam-pass',
      name: 'Board Ready',
      bnName: 'বোর্ড পাস',
      description: 'Achieved a passing grade on an official chapter assessment.',
      category: 'EXAMS',
      icon: 'Check',
      gradient: 'from-emerald-500 to-green-600',
      unlocked: passedExams.length >= 1,
      currentProgress: Math.min(passedExams.length, 1),
      maxProgress: 1,
      progressLabel: `${Math.min(passedExams.length, 1)} / 1 Exam Passed`,
    },
    {
      id: 'exam-perfectionist',
      name: 'High Achiever',
      bnName: 'শীর্ষ ফলাফল',
      description: 'Scored 80% or higher on a chapter MCQ test.',
      category: 'EXAMS',
      icon: 'Star',
      gradient: 'from-amber-400 to-rose-500',
      unlocked: bestScore >= 80,
      currentProgress: Math.min(bestScore, 80),
      maxProgress: 80,
      progressLabel: `${bestScore}% / 80% Score`,
    },
    {
      id: 'exam-triple',
      name: 'Triple Triumph',
      bnName: 'তিন অধ্যায় বিজয়ী',
      description: 'Passed 3 distinct chapter examinations.',
      category: 'EXAMS',
      icon: 'Trophy',
      gradient: 'from-violet-600 to-indigo-800',
      unlocked: passedExams.length >= 3,
      currentProgress: Math.min(passedExams.length, 3),
      maxProgress: 3,
      progressLabel: `${Math.min(passedExams.length, 3)} / 3 Exams Passed`,
    },

    // ---------------- 4. FOCUS & TIME MASTERY ----------------
    {
      id: 'focus-hour',
      name: 'Deep Focus (1 Hour)',
      bnName: 'গভীর মনোযোগ',
      description: 'Accumulated over 60 minutes of uninterrupted video class study time.',
      category: 'FOCUS',
      icon: 'Clock',
      gradient: 'from-teal-500 to-emerald-600',
      unlocked: totalWatchSeconds >= 3600,
      currentProgress: Math.min(Math.round(totalWatchSeconds / 60), 60),
      maxProgress: 60,
      progressLabel: `${Math.min(Math.round(totalWatchSeconds / 60), 60)} / 60 Minutes`,
    },
    {
      id: 'focus-marathon',
      name: 'Study Marathon (5 Hours)',
      bnName: 'ম্যারাথন অধ্যয়ন',
      description: 'Accumulated over 300 minutes of noise-free educational watch time.',
      category: 'FOCUS',
      icon: 'Compass',
      gradient: 'from-indigo-600 to-sky-600',
      unlocked: totalWatchSeconds >= 18000,
      currentProgress: Math.min(Math.round(totalWatchSeconds / 60), 300),
      maxProgress: 300,
      progressLabel: `${Math.min(Math.round(totalWatchSeconds / 60), 300)} / 300 Minutes`,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return {
    badges,
    streakDays: effectiveStreak,
    unlockedCount,
    totalCount: badges.length,
    totalWatchSeconds,
  };
}

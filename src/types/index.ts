export interface AcademicYear {
  id: string; // e.g. "2026", "2027", "2028"
  name: string;
  active: boolean;
  order: number;
}

export interface CurriculumVersion {
  id: string; // e.g. "nctb-ssc-2026"
  academicYearId: string;
  name: string;
  classLevel: string; // "Class 9-10 / SSC"
  description?: string;
  active: boolean;
}

export type SubjectGroupId = 'common' | 'science' | 'humanities' | 'business';

export type CurriculumMedium = 'BANGLA_MEDIUM' | 'ENGLISH_VERSION';

export interface SubjectGroup {
  id: SubjectGroupId;
  name: string;
  bnName: string;
  description: string;
  order: number;
}

export interface Subject {
  id: string;
  curriculumId?: string;
  groupId?: SubjectGroupId;
  classLevel?: string; // "Class 9-10 / SSC"
  name: string;
  bnName?: string;
  code?: string; // e.g. "136" for Physics
  slug: string;
  description: string;
  icon: string;
  thumbnail?: string;
  order: number;
  published: boolean;
  educationLevel?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  curriculumId?: string;
  subjectId: string;
  name: string; // e.g. "Chapter 2: Motion"
  title?: string;
  description: string;
  order: number;
  published: boolean;
  examEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Book {
  id: string;
  curriculumId?: string;
  subjectId: string;
  title: string;
  academicYear: string;
  sourceName: string; // e.g. "NCTB Official"
  sourceType: 'NCTB' | 'AUTHORIZED_BOARD' | 'OPEN_ACCESS';
  url: string;
  description?: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  chapterId: string;
  thumbnailUrl?: string;
  published: boolean;
  featured?: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistItemMap {
  [classId: string]: {
    order: number;
  };
}

export type ClassProvider = 'youtube' | 'vimeo' | 'custom';

export interface ClassItem {
  id: string;
  curriculumId?: string;
  subjectId: string;
  chapterId: string;
  playlistId?: string;
  title: string;
  description: string;
  teacher: string;
  classNumber: number | string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  durationText?: string;
  duration?: string;
  provider?: ClassProvider;
  published: boolean;
  featured?: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export type ResourceType = 'PDF' | 'Slides' | 'Notes' | 'Document' | 'Link';

export interface ClassResource {
  id: string;
  classId: string;
  subjectId?: string;
  chapterId?: string;
  title: string;
  type: ResourceType;
  url: string;
  description?: string;
  order: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface ClassProgress {
  classId?: string;
  positionSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt?: number;
  completedAt?: number | null;
}

export interface UserProgressMap {
  [classId: string]: ClassProgress;
}

export interface BookmarkMap {
  [classId: string]: {
    savedAt: number;
  };
}

export type ChapterState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXAM_UNLOCKED'
  | 'PASSED'
  | 'MASTERED';

export interface ChapterProgress {
  chapterId: string;
  status: ChapterState;
  completedClassesCount: number;
  totalClassesCount: number;
  examUnlocked: boolean;
  examPassed: boolean;
  mastered: boolean;
  updatedAt: number;
}

export interface SubjectProgress {
  subjectId: string;
  completedChaptersCount: number;
  totalChaptersCount: number;
  percentage: number;
  updatedAt: number;
}

// ---------------- QUESTION BANK & EXAMS ----------------

export type QuestionType = 'MCQ' | 'CQ' | 'SHORT_ANSWER' | 'NUMERICAL' | 'WRITTEN';

export type QuestionSourceType =
  | 'BOARD'
  | 'ADMISSION'
  | 'CLEAR_EDU_ORIGINAL'
  | 'PRACTICE'
  | 'AUTHORIZED';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  curriculumId?: string;
  medium?: CurriculumMedium;
  subjectId: string;
  chapterId: string;
  topicId?: string;
  type: QuestionType;
  sourceType: QuestionSourceType;
  sourceName?: string; // e.g. "Dhaka Board 2024", "Rajshahi Board", "NCTB Exemplar"
  examName?: string;
  institution?: string;
  year?: number | string;
  question: string;
  options: string[]; // Options 0-3 for MCQ
  answer: number | string; // Index 0-3 for MCQ
  explanation?: string;
  difficulty: QuestionDifficulty;
  marks: number;
  tags?: string[];
  published: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  isAiGenerated?: boolean;
  stem?: string; // For Creative Questions (CQ উদ্দীপক)
  subQuestions?: Array<{ label: string; question: string; marks: number; answer?: string }>;
  createdAt: number;
  updatedAt: number;
}

export interface QuestionSet {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  chapterId: string;
  questionIds: string[];
  durationSeconds: number;
  totalMarks: number;
  passMark: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterExamConfig {
  chapterId: string;
  enabled: boolean;
  unlockRule: 'ALL_REQUIRED_CLASSES_COMPLETED' | 'PERCENTAGE_CLASSES_COMPLETED' | 'MANUAL_UNLOCK';
  questionType: QuestionType;
  questionPoolSize: number;
  questionCount: number;
  passMark: number; // percentage (e.g. 50%)
  durationSeconds: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowRetakes: boolean;
  maxAttempts: number;
  showCorrectAnswerAfterSubmit: boolean;
  showExplanationAfterSubmit: boolean;
  sourceMix?: string;
  difficultyMix?: string;
  rulesDescription?: string;
  requiredClassesCompletionPercentage: number;
  updatedAt: number;
}

export interface StudentExamAssignment {
  id: string;
  assignmentId?: string;
  examType: 'CHAPTER' | 'SUBJECT' | 'PRACTICE' | 'MOCK';
  subjectId: string;
  chapterId?: string;
  questionIds: string[];
  createdAt: number;
  startedAt?: number;
  submittedAt?: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED';
  attemptNumber: number;
}

export interface QuestionAttempt {
  id: string;
  examId: string;
  assignmentId?: string;
  examType: string;
  subjectId: string;
  chapterId?: string;
  questionIds: string[];
  startedAt: number;
  submittedAt: number;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  durationSeconds: number;
  status: 'PASSED' | 'FAILED';
  passed: boolean;
  mastered: boolean;
  strongTopics?: string[];
  weakTopics?: string[];
}

export interface QuestionAnswer {
  selectedAnswer: number | string;
  correct: boolean;
  answeredAt: number;
}

// ---------------- CLEAR BUDDY AI ----------------

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context?: {
    subjectName?: string;
    chapterName?: string;
    className?: string;
    questionText?: string;
    topic?: string;
  };
  createdAt: number;
}

export interface ChatSession {
  id: string;
  uid: string;
  title: string;
  lastMessagePreview?: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------- APP CONFIG ----------------

export interface AppConfig {
  defaultQuestionCount: number;
  defaultPassMark: number;
  aiModel: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowPublicGuestPractice: boolean;
  allowAiGeneratedQuestionsDraft: boolean;
  enableAppCheckDebug: boolean;
}

// ---------------- AGGREGATES & HEALTH ----------------

export interface ChapterWithClasses extends Chapter {
  classes: ClassItem[];
  completedCount?: number;
  totalCount?: number;
  book?: Book | null;
  examConfig?: ChapterExamConfig | null;
  questionCount?: number;
  status?: ChapterState;
}

export interface PlaylistWithClasses extends Playlist {
  classes: ClassItem[];
  totalDurationSeconds?: number;
  completedCount?: number;
}

export interface ContentHealthItem {
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  classesCount: number;
  hasBook: boolean;
  questionPoolCount: number;
  hasExamConfig: boolean;
  examReady: boolean;
  issues: string[];
}

export interface AdminStats {
  totalStudents: number;
  totalSubjects: number;
  totalChapters: number;
  totalPlaylists: number;
  totalClasses: number;
  publishedClasses: number;
  draftClasses: number;
  totalBooks: number;
  totalQuestions: number;
  publishedQuestions: number;
  pendingQuestionsCount: number;
  totalAttempts: number;
  totalSources: number;
  totalLiveClasses: number;
  activeLiveCount: number;
}

// ---------------- TOPICS ----------------

export interface Topic {
  id: string;
  subjectId: string;
  chapterId: string;
  name: string;
  bnName?: string;
  description?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------- EDUCATION SOURCES (YouTube & Facebook) ----------------

export type EducationPlatform = 'YOUTUBE' | 'FACEBOOK';

export interface EducationSource {
  id: string;
  platform: EducationPlatform;
  name: string; // e.g. "10 Minute School", "Onnorokom Pathshala", "Shikho"
  channelOrPageId: string;
  url: string;
  thumbnailUrl?: string;
  subjects: string[]; // Subject IDs covered
  medium: 'BANGLA_MEDIUM' | 'ENGLISH_VERSION' | 'BOTH';
  targetClass: 'CLASS_9' | 'CLASS_10' | 'SSC' | 'ALL';
  verified: boolean;
  active: boolean;
  autoSync: boolean;
  filterKeywords: string[]; // e.g. ["SSC", "Class 9", "Class 10", "পদার্থ", "গণিত"]
  requireAdminApproval: boolean;
  lastSyncedAt?: number;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastError?: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------- UNIFIED LIVE CLASSES ----------------

export type LiveClassStatus = 'LIVE_NOW' | 'UPCOMING' | 'TODAY' | 'THIS_WEEK' | 'ENDED' | 'RECORDING_AVAILABLE';

export interface LiveClass {
  id: string;
  sourceId: string;
  sourceName: string;
  platform: EducationPlatform;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoOrBroadcastId: string;
  embedUrl: string;
  externalUrl: string;
  teacher?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  medium: CurriculumMedium;
  status: LiveClassStatus;
  scheduledStartTime: number;
  actualStartTime?: number;
  endTime?: number;
  recordingUrl?: string;
  approvalStatus: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  isOfficial: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---------------- STUDENT PERSONAL NOTES ----------------

export interface StudentNote {
  id: string;
  uid: string;
  classId?: string;
  chapterId?: string;
  subjectId?: string;
  title: string;
  content: string;
  timestampSeconds?: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------- REVISION QUEUE & WEAK TOPICS ----------------

export interface RevisionItem {
  id: string;
  uid: string;
  subjectId: string;
  chapterId: string;
  topic: string;
  questionId?: string;
  classId?: string;
  reason: string; // e.g. "Missed during Chapter 2 test", "Marked for revision"
  masteryLevel: 'WEAK' | 'LEARNING' | 'MASTERED';
  lastReviewedAt?: number;
  createdAt: number;
}

// ---------------- USER BADGES & ACHIEVEMENTS ----------------

export type BadgeCategory = 'STREAK' | 'COURSES' | 'EXAMS' | 'FOCUS';

export interface UserBadge {
  id: string;
  name: string;
  bnName: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  gradient: string;
  unlocked: boolean;
  unlockedAt?: number;
  currentProgress: number;
  maxProgress: number;
  progressLabel: string;
}


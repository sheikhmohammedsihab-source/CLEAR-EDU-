import { ref, set, get } from 'firebase/database';
import { database } from './firebase';
import type {
  AcademicYear,
  CurriculumVersion,
  SubjectGroup,
  Subject,
  Chapter,
  Book,
  Playlist,
  ClassItem,
  ClassResource,
  ChapterExamConfig,
  Question,
  AppConfig,
  Topic,
  EducationSource,
  LiveClass
} from '../types';

export const NCTB_ACADEMIC_YEARS: AcademicYear[] = [
  { id: "2026", name: "Academic Year 2026", active: true, order: 1 },
  { id: "2027", name: "Academic Year 2027", active: false, order: 2 },
  { id: "2028", name: "Academic Year 2028", active: false, order: 3 },
];

export const NCTB_CURRICULUM_VERSIONS: CurriculumVersion[] = [
  {
    id: "nctb-ssc-2026",
    academicYearId: "2026",
    name: "NCTB SSC Bangla Medium (Class 9-10)",
    classLevel: "Class 9-10 / SSC",
    description: "Official National Curriculum and Textbook Board Bangladesh curriculum in Bangla Medium.",
    active: true
  },
  {
    id: "nctb-ssc-ev-2026",
    academicYearId: "2026",
    name: "NCTB SSC English Version (Class 9-10)",
    classLevel: "Class 9-10 / SSC",
    description: "Official National Curriculum and Textbook Board Bangladesh curriculum in English Version (NCTB syllabus).",
    active: true
  }
];

export const NCTB_SUBJECT_GROUPS: SubjectGroup[] = [
  {
    id: "common",
    name: "Common Compulsory Subjects",
    bnName: "আবশ্যিক বিষয়সমূহ",
    description: "Compulsory subjects for all streams (Bangla, English, Mathematics, ICT, Religion, Career & Health).",
    order: 1
  },
  {
    id: "science",
    name: "Science Group",
    bnName: "বিজ্ঞান বিভাগ",
    description: "Physics, Chemistry, Biology, Higher Mathematics, and Bangladesh & Global Studies.",
    order: 2
  },
  {
    id: "humanities",
    name: "Humanities Group",
    bnName: "মানবিক বিভাগ",
    description: "History of Bangladesh, Geography, Economics, Civics, and General Science.",
    order: 3
  },
  {
    id: "business",
    name: "Business Studies Group",
    bnName: "ব্যবসায় শিক্ষা বিভাগ",
    description: "Accounting, Finance & Banking, Business Entrepreneurship, and General Science.",
    order: 4
  }
];

export const NCTB_SUBJECTS: Subject[] = [
  // --- COMMON COMPULSORY ---
  {
    id: "bangla-literature",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "101",
    name: "Bangla Literature (বাংলা সাহিত্য)",
    bnName: "বাংলা সাহিত্য",
    slug: "bangla-literature",
    description: "SSC Bangla 1st Paper prose, poetry, and literary analysis.",
    icon: "feather",
    order: 1,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "bangla-companion",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "102",
    name: "Bangla Companion (সহপাঠ - উপন্যাস ও নাটক)",
    bnName: "বাংলা সহপাঠ",
    slug: "bangla-companion",
    description: "Kaktarua novel & Bohipir drama with comprehensive character and thematic studies.",
    icon: "book",
    order: 2,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "bangla-grammar",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "103",
    name: "Bangla Language & Grammar (বাংলা ভাষার ব্যাকরণ ও নির্মিতি)",
    bnName: "বাংলা ভাষার ব্যাকরণ ও নির্মিতি",
    slug: "bangla-grammar",
    description: "Phonetics, Sandhi, Samas, Karok, prefixes, suffixes, and composition.",
    icon: "book-open",
    order: 3,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "english-today",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "107",
    name: "English for Today (ইংরেজি ১ম পত্র)",
    bnName: "ইংলিশ ফর টুডে",
    slug: "english-today",
    description: "Reading comprehension, theme writing, unseen passages, and communicative tasks.",
    icon: "languages",
    order: 4,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "english-grammar",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "108",
    name: "English Grammar & Composition (ইংরেজি ২য় পত্র)",
    bnName: "ইংলিশ গ্রামার অ্যান্ড কম্পোজিশন",
    slug: "english-grammar",
    description: "Right forms of verbs, narration, voice, modifiers, transformation, and writing.",
    icon: "pen-tool",
    order: 5,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "general-math",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "109",
    name: "General Mathematics (সাধারণ গণিত)",
    bnName: "সাধারণ গণিত",
    slug: "general-math",
    description: "Algebra, Geometry, Trigonometry, Mensuration, and Statistics foundation.",
    icon: "binary",
    order: 6,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "ict",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "154",
    name: "ICT (তথ্য ও যোগাযোগ প্রযুক্তি)",
    bnName: "তথ্য ও যোগাযোগ প্রযুক্তি",
    slug: "ict",
    description: "Computer networks, Internet safety, spreadsheet formulas, multimedia, and graphics.",
    icon: "laptop",
    order: 7,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "career-education",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "156",
    name: "Career Education (ক্যারিয়ার শিক্ষা)",
    bnName: "ক্যারিয়ার শিক্ষা",
    slug: "career-education",
    description: "Self-awareness, personal development, professional pathways, and workplace ethics.",
    icon: "briefcase",
    order: 8,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "physical-education",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "147",
    name: "Physical Education, Health & Sports (শারীরিক শিক্ষা, স্বাস্থ্যবিজ্ঞান ও খেলাধুলা)",
    bnName: "শারীরিক শিক্ষা ও স্বাস্থ্য",
    slug: "physical-education",
    description: "First aid, fitness, nutrition, sportsmanship, and mental wellness.",
    icon: "activity",
    order: 9,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "religion",
    curriculumId: "nctb-ssc-2026",
    groupId: "common",
    classLevel: "Class 9-10 / SSC",
    code: "111",
    name: "Religion & Moral Education (ধর্ম ও নৈতিক শিক্ষা)",
    bnName: "ধর্ম ও নৈতিক শিক্ষা",
    slug: "religion",
    description: "Spiritual values, moral ethics, historical exemplars, and societal harmony.",
    icon: "compass",
    order: 10,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // --- SCIENCE GROUP ---
  {
    id: "physics",
    curriculumId: "nctb-ssc-2026",
    groupId: "science",
    classLevel: "Class 9-10 / SSC",
    code: "136",
    name: "Physics (পদার্থবিজ্ঞান)",
    bnName: "পদার্থবিজ্ঞান",
    slug: "physics",
    description: "Mechanics, Heat, Waves, Optics, Electricity, Magnetism, and Modern Physics.",
    icon: "atom",
    order: 11,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "chemistry",
    curriculumId: "nctb-ssc-2026",
    groupId: "science",
    classLevel: "Class 9-10 / SSC",
    code: "137",
    name: "Chemistry (রসায়ন)",
    bnName: "রসায়ন",
    slug: "chemistry",
    description: "Matter, Atomic Structure, Periodic Table, Chemical Bonding, Mole Concept, and Reactions.",
    icon: "flask-conical",
    order: 12,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "biology",
    curriculumId: "nctb-ssc-2026",
    groupId: "science",
    classLevel: "Class 9-10 / SSC",
    code: "138",
    name: "Biology (জীববিজ্ঞান)",
    bnName: "জীববিজ্ঞান",
    slug: "biology",
    description: "Cellular Structure, Cell Division, Plant & Animal Physiology, Genetics, and Ecology.",
    icon: "dna",
    order: 13,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "higher-math",
    curriculumId: "nctb-ssc-2026",
    groupId: "science",
    classLevel: "Class 9-10 / SSC",
    code: "126",
    name: "Higher Mathematics (উচ্চতর গণিত)",
    bnName: "উচ্চতর গণিত",
    slug: "higher-math",
    description: "Set & Functions, Algebraic Expressions, Geometry, Trigonometry, Vectors, and Probability.",
    icon: "calculator",
    order: 14,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "bgs",
    curriculumId: "nctb-ssc-2026",
    groupId: "science",
    classLevel: "Class 9-10 / SSC",
    code: "150",
    name: "Bangladesh & Global Studies (বাংলাদেশ ও বিশ্বপরিচয়)",
    bnName: "বাংলাদেশ ও বিশ্বপরিচয়",
    slug: "bgs",
    description: "History of independence, constitution, state organs, resources, and social changes.",
    icon: "globe",
    order: 15,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // --- HUMANITIES GROUP ---
  {
    id: "history",
    curriculumId: "nctb-ssc-2026",
    groupId: "humanities",
    classLevel: "Class 9-10 / SSC",
    code: "153",
    name: "History of Bangladesh & World Civilization (বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা)",
    bnName: "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা",
    slug: "history",
    description: "Ancient Bengal, Islamic era, British rule, liberation war, and global civilizations.",
    icon: "landmark",
    order: 16,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "geography",
    curriculumId: "nctb-ssc-2026",
    groupId: "humanities",
    classLevel: "Class 9-10 / SSC",
    code: "110",
    name: "Geography & Environment (ভূগোল ও পরিবেশ)",
    bnName: "ভূগোল ও পরিবেশ",
    slug: "geography",
    description: "The Universe, Earth's structure, atmosphere, climate of Bangladesh, and disaster management.",
    icon: "map",
    order: 17,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "economics",
    curriculumId: "nctb-ssc-2026",
    groupId: "humanities",
    classLevel: "Class 9-10 / SSC",
    code: "141",
    name: "Economics (অর্থনীতি)",
    bnName: "অর্থনীতি",
    slug: "economics",
    description: "Scarcity, choice, demand, supply, market equilibrium, and national income.",
    icon: "trending-up",
    order: 18,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "civics",
    curriculumId: "nctb-ssc-2026",
    groupId: "humanities",
    classLevel: "Class 9-10 / SSC",
    code: "140",
    name: "Civics & Citizenship (পৌরনীতি ও নাগরিকতা)",
    bnName: "পৌরনীতি ও নাগরিকতা",
    slug: "civics",
    description: "Family, society, state, constitution, citizen rights, duties, and democratic values.",
    icon: "shield-check",
    order: 19,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "general-science",
    curriculumId: "nctb-ssc-2026",
    groupId: "humanities",
    classLevel: "Class 9-10 / SSC",
    code: "127",
    name: "General Science (বিজ্ঞান)",
    bnName: "বিজ্ঞান",
    slug: "general-science",
    description: "Integrated science for humanities and business students covering health, energy, and environment.",
    icon: "sparkles",
    order: 20,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // --- BUSINESS STUDIES GROUP ---
  {
    id: "accounting",
    curriculumId: "nctb-ssc-2026",
    groupId: "business",
    classLevel: "Class 9-10 / SSC",
    code: "146",
    name: "Accounting (হিসাববিজ্ঞান)",
    bnName: "হিসাববিজ্ঞান",
    slug: "accounting",
    description: "Double entry system, journal, ledger, trial balance, and financial statements.",
    icon: "credit-card",
    order: 21,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "finance-banking",
    curriculumId: "nctb-ssc-2026",
    groupId: "business",
    classLevel: "Class 9-10 / SSC",
    code: "152",
    name: "Finance & Banking (ফিন্যান্স ও ব্যাংকিং)",
    bnName: "ফিন্যান্স ও ব্যাংকিং",
    slug: "finance-banking",
    description: "Time value of money, risk & return, commercial banking, and central bank functions.",
    icon: "dollar-sign",
    order: 22,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "business-entrepreneurship",
    curriculumId: "nctb-ssc-2026",
    groupId: "business",
    classLevel: "Class 9-10 / SSC",
    code: "143",
    name: "Business Entrepreneurship (ব্যবসায় উদ্যোগ)",
    bnName: "ব্যবসায় উদ্যোগ",
    slug: "business-entrepreneurship",
    description: "Sole proprietorship, partnership, small business planning, marketing, and ethical leadership.",
    icon: "rocket",
    order: 23,
    published: true,
    educationLevel: "ssc",
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const NCTB_CHAPTERS: Chapter[] = [
  // Physics Chapters (Class 9-10 Official NCTB)
  {
    id: "phy-chap-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    name: "Chapter 1: Physical Quantities and Measurement (ভৌত রাশি ও পরিমাপ)",
    title: "Chapter 1: Physical Quantities and Measurement",
    description: "Units, dimensions, vernier calipers, screw gauge, and error calculation.",
    order: 1,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-chap-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    name: "Chapter 2: Motion (গতি)",
    title: "Chapter 2: Motion",
    description: "Scalar and vector, displacement, velocity, acceleration, equations of motion, and falling bodies.",
    order: 2,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-chap-03",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    name: "Chapter 3: Force (বল)",
    title: "Chapter 3: Force",
    description: "Inertia, Newton's laws of motion, momentum, friction, and safe driving.",
    order: 3,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-chap-04",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    name: "Chapter 4: Work, Power and Energy (কাজ, ক্ষমতা ও শক্তি)",
    title: "Chapter 4: Work, Power and Energy",
    description: "Kinetic energy, potential energy, law of conservation of energy, and efficiency.",
    order: 4,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-chap-05",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    name: "Chapter 5: State of Matter and Pressure (পদার্থের অবস্থা ও চাপ)",
    title: "Chapter 5: State of Matter and Pressure",
    description: "Pressure, density, Archimedes' principle, Pascal's law, and Hooke's law.",
    order: 5,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Chemistry Chapters (Class 9-10 Official NCTB)
  {
    id: "chem-chap-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    name: "Chapter 3: Structure of Matter (পদার্থের গঠন)",
    title: "Chapter 3: Structure of Matter",
    description: "Subatomic particles, atomic models, isotopes, and electron configurations.",
    order: 1,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "chem-chap-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    name: "Chapter 4: Periodic Table (পর্যায় সারণি)",
    title: "Chapter 4: Periodic Table",
    description: "Mendeleev & modern periodic law, periodic properties (atomic radius, ionization energy).",
    order: 2,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "chem-chap-03",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    name: "Chapter 5: Chemical Bonds (রাসায়নিক বন্ধন)",
    title: "Chapter 5: Chemical Bonds",
    description: "Valence electrons, octet rule, ionic bonds, covalent bonds, and metallic bonds.",
    order: 3,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // General Math Chapters
  {
    id: "gmath-chap-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "general-math",
    name: "Chapter 2: Sets and Functions (সেট ও ফাংশন)",
    title: "Chapter 2: Sets and Functions",
    description: "Venn diagrams, power sets, Cartesian product, relations, and functions.",
    order: 1,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "gmath-chap-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "general-math",
    name: "Chapter 3: Algebraic Expressions (বীজগাণিতিক রাশি)",
    title: "Chapter 3: Algebraic Expressions",
    description: "Formulas of square and cube, factor theorem, and algebraic applications.",
    order: 2,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Higher Math Chapters
  {
    id: "hmath-chap-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "higher-math",
    name: "Chapter 1: Sets and Functions (সেট ও ফাংশন)",
    title: "Chapter 1: Sets and Functions",
    description: "Subset, complement, De Morgan's laws, one-to-one function, and onto functions.",
    order: 1,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "hmath-chap-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "higher-math",
    name: "Chapter 2: Algebraic Expressions (বীজগাণিতিক রাশি)",
    title: "Chapter 2: Algebraic Expressions",
    description: "Polynomials, homogeneous and symmetric expressions, partial fractions.",
    order: 2,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Biology Chapters
  {
    id: "bio-chap-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "biology",
    name: "Chapter 2: Cells and Tissues (জীবকোষ ও টিস্যু)",
    title: "Chapter 2: Cells and Tissues",
    description: "Plant & animal cell organelles, plastids, mitochondria, and permanent tissues.",
    order: 1,
    published: true,
    examEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const NCTB_BOOKS: Book[] = [
  {
    id: "book-phy-9-10",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    title: "Secondary Physics (পদার্থবিজ্ঞান) - Class 9-10",
    academicYear: "2026",
    sourceName: "NCTB Official Portal",
    sourceType: "NCTB",
    url: "http://www.nctb.gov.bd",
    description: "Official NCTB textbook for Secondary Physics approved by Ministry of Education.",
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "book-chem-9-10",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    title: "Secondary Chemistry (রসায়ন) - Class 9-10",
    academicYear: "2026",
    sourceName: "NCTB Official Portal",
    sourceType: "NCTB",
    url: "http://www.nctb.gov.bd",
    description: "Official NCTB textbook for Secondary Chemistry.",
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "book-gmath-9-10",
    curriculumId: "nctb-ssc-2026",
    subjectId: "general-math",
    title: "General Mathematics (সাধারণ গণিত) - Class 9-10",
    academicYear: "2026",
    sourceName: "NCTB Official Portal",
    sourceType: "NCTB",
    url: "http://www.nctb.gov.bd",
    description: "Official NCTB textbook for General Mathematics.",
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "book-hmath-9-10",
    curriculumId: "nctb-ssc-2026",
    subjectId: "higher-math",
    title: "Higher Mathematics (উচ্চতর গণিত) - Class 9-10",
    academicYear: "2026",
    sourceName: "NCTB Official Portal",
    sourceType: "NCTB",
    url: "http://www.nctb.gov.bd",
    description: "Official NCTB textbook for Higher Mathematics.",
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "book-bio-9-10",
    curriculumId: "nctb-ssc-2026",
    subjectId: "biology",
    title: "Secondary Biology (জীববিজ্ঞান) - Class 9-10",
    academicYear: "2026",
    sourceName: "NCTB Official Portal",
    sourceType: "NCTB",
    url: "http://www.nctb.gov.bd",
    description: "Official NCTB textbook for Secondary Biology.",
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: "playlist-phy-motion",
    title: "Physics Chapter 2: Complete Motion Course",
    description: "From scalar/vector foundations to mathematical proof of equations of motion and graphical analysis.",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    thumbnailUrl: "https://img.youtube.com/vi/y2gh10uKipw/hqdefault.jpg",
    published: true,
    featured: true,
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "playlist-chem-matter",
    title: "Chemistry Chapter 3: Structure of Matter Masterclass",
    description: "Comprehensive guide to atomic models, Rutherford scattering, Bohr postulates, and electronic structures.",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    thumbnailUrl: "https://img.youtube.com/vi/cpBb2BgMYOo/hqdefault.jpg",
    published: true,
    featured: true,
    order: 2,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "playlist-phy-force",
    title: "Physics Chapter 3: Force & Newton's Laws",
    description: "Understanding inertia, momentum, Newton's 3 laws, friction force, and impulse.",
    subjectId: "physics",
    chapterId: "phy-chap-03",
    thumbnailUrl: "https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg",
    published: true,
    featured: false,
    order: 3,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_CLASSES: ClassItem[] = [
  // Physics Chapter 2: Motion Classes
  {
    id: "phy-c02-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    playlistId: "playlist-phy-motion",
    title: "Introduction to Motion, Distance & Displacement",
    teacher: "Dr. A. Rahman",
    classNumber: 1,
    youtubeUrl: "https://www.youtube.com/watch?v=y2gh10uKipw",
    youtubeId: "y2gh10uKipw",
    thumbnailUrl: "https://img.youtube.com/vi/y2gh10uKipw/hqdefault.jpg",
    durationSeconds: 1440,
    duration: "24m",
    provider: "youtube",
    published: true,
    featured: true,
    order: 1,
    description: "Concepts of rest vs motion, frame of reference, distance vs displacement with numerical examples.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-c02-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    playlistId: "playlist-phy-motion",
    title: "Speed, Velocity & Acceleration in Depth",
    teacher: "Dr. A. Rahman",
    classNumber: 2,
    youtubeUrl: "https://www.youtube.com/watch?v=0kY8c8r7E5I",
    youtubeId: "0kY8c8r7E5I",
    thumbnailUrl: "https://img.youtube.com/vi/0kY8c8r7E5I/hqdefault.jpg",
    durationSeconds: 1920,
    duration: "32m",
    provider: "youtube",
    published: true,
    featured: false,
    order: 2,
    description: "Understanding uniform speed, instantaneous velocity, deceleration, and graph interpretations.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-c02-03",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    playlistId: "playlist-phy-motion",
    title: "Derivation of 4 Equations of Motion (v=u+at, s=ut+0.5at²)",
    teacher: "Dr. A. Rahman",
    classNumber: 3,
    youtubeUrl: "https://www.youtube.com/watch?v=r020uXlD3F0",
    youtubeId: "r020uXlD3F0",
    thumbnailUrl: "https://img.youtube.com/vi/r020uXlD3F0/hqdefault.jpg",
    durationSeconds: 1680,
    duration: "28m",
    provider: "youtube",
    published: true,
    featured: true,
    order: 3,
    description: "Step-by-step mathematical proof of equations of motion and board standard creative questions.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "phy-c02-04",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    playlistId: "playlist-phy-motion",
    title: "Freely Falling Bodies & Gravitational Acceleration",
    teacher: "Dr. A. Rahman",
    classNumber: 4,
    youtubeUrl: "https://www.youtube.com/watch?v=FjC3Lp5Ff10",
    youtubeId: "FjC3Lp5Ff10",
    thumbnailUrl: "https://img.youtube.com/vi/FjC3Lp5Ff10/hqdefault.jpg",
    durationSeconds: 1560,
    duration: "26m",
    provider: "youtube",
    published: true,
    featured: false,
    order: 4,
    description: "Galileo's laws of falling bodies, throwing objects vertically upward, and maximum height equations.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Chemistry Chapter 3 Classes
  {
    id: "chem-c03-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    playlistId: "playlist-chem-matter",
    title: "Atoms, Molecules & Subatomic Particles",
    teacher: "Prof. Farhana Haque",
    classNumber: 1,
    youtubeUrl: "https://www.youtube.com/watch?v=cpBb2BgMYOo",
    youtubeId: "cpBb2BgMYOo",
    thumbnailUrl: "https://img.youtube.com/vi/cpBb2BgMYOo/hqdefault.jpg",
    durationSeconds: 1800,
    duration: "30m",
    provider: "youtube",
    published: true,
    featured: true,
    order: 1,
    description: "Properties of protons, neutrons, electrons, atomic number, mass number, and relative atomic mass.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "chem-c03-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    playlistId: "playlist-chem-matter",
    title: "Rutherford vs Bohr Atomic Models & Electron Configuration",
    teacher: "Prof. Farhana Haque",
    classNumber: 2,
    youtubeUrl: "https://www.youtube.com/watch?v=O129s5M0rYc",
    youtubeId: "O129s5M0rYc",
    thumbnailUrl: "https://img.youtube.com/vi/O129s5M0rYc/hqdefault.jpg",
    durationSeconds: 2100,
    duration: "35m",
    provider: "youtube",
    published: true,
    featured: false,
    order: 2,
    description: "Alpha particle scattering experiment, Bohr's postulates, energy levels, and Aufbau principle.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // Physics Chapter 3: Force Class
  {
    id: "phy-c03-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-03",
    playlistId: "playlist-phy-force",
    title: "Inertia, Momentum & Newton's 1st Law",
    teacher: "Dr. A. Rahman",
    classNumber: 1,
    youtubeUrl: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
    youtubeId: "kKKM8Y-u7ds",
    thumbnailUrl: "https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg",
    durationSeconds: 1740,
    duration: "29m",
    provider: "youtube",
    published: true,
    featured: true,
    order: 1,
    description: "Inertia of rest, inertia of motion, linear momentum (p = mv), and fundamental forces.",
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_RESOURCES: ClassResource[] = [
  {
    id: "res-phy-01",
    classId: "phy-c02-03",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    title: "Motion Derivations & Formula Sheet PDF",
    type: "PDF",
    url: "https://drive.google.com",
    description: "Handwritten proof of v = u + at and s = ut + 0.5at² with practice board questions.",
    order: 1,
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "res-phy-02",
    classId: "phy-c02-02",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    title: "Graphical Analysis Slides",
    type: "Slides",
    url: "https://drive.google.com",
    description: "Distance-time and velocity-time slope calculations presented in lecture.",
    order: 1,
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "res-chem-01",
    classId: "chem-c03-02",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    title: "Atomic Models Summary Notes",
    type: "Notes",
    url: "https://drive.google.com",
    description: "Key comparison chart of Rutherford vs Bohr models and electron shells.",
    order: 1,
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_EXAM_CONFIGS: Record<string, ChapterExamConfig> = {
  "phy-chap-02": {
    chapterId: "phy-chap-02",
    enabled: true,
    unlockRule: "ALL_REQUIRED_CLASSES_COMPLETED",
    questionType: "MCQ",
    questionPoolSize: 6,
    questionCount: 5,
    passMark: 50,
    durationSeconds: 600, // 10 minutes
    randomizeQuestions: true,
    randomizeOptions: true,
    allowRetakes: true,
    maxAttempts: 3,
    showCorrectAnswerAfterSubmit: true,
    showExplanationAfterSubmit: true,
    sourceMix: "BOARD,CLEAR_EDU_ORIGINAL",
    difficultyMix: "EASY:2,MEDIUM:2,HARD:1",
    requiredClassesCompletionPercentage: 100,
    updatedAt: Date.now()
  },
  "chem-chap-01": {
    chapterId: "chem-chap-01",
    enabled: true,
    unlockRule: "ALL_REQUIRED_CLASSES_COMPLETED",
    questionType: "MCQ",
    questionPoolSize: 4,
    questionCount: 4,
    passMark: 50,
    durationSeconds: 480, // 8 minutes
    randomizeQuestions: true,
    randomizeOptions: true,
    allowRetakes: true,
    maxAttempts: 3,
    showCorrectAnswerAfterSubmit: true,
    showExplanationAfterSubmit: true,
    requiredClassesCompletionPercentage: 100,
    updatedAt: Date.now()
  }
};

export const INITIAL_QUESTIONS: Question[] = [
  // --- Physics Chapter 2: Motion MCQs ---
  {
    id: "q-phy-02-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "scalar-vector",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Dhaka Board 2024",
    year: 2024,
    question: "নিচের কোনটি ভেক্টর রাশি? (Which of the following is a vector quantity?)",
    options: ["দূরত্ব (Distance)", "দ্রুতি (Speed)", "সরণ (Displacement)", "কাজ (Work)"],
    answer: 2, // Displacement
    explanation: "সরণ হলো একটি নির্দিষ্ট দিকে অবস্থানের পরিবর্তন। এর মান ও দিক উভয়ই আছে, তাই এটি ভেক্টর রাশি।",
    difficulty: "EASY",
    marks: 1,
    tags: ["vector", "motion", "board-question"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-phy-02-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "equations-of-motion",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Rajshahi Board 2023",
    year: 2023,
    question: "স্থির অবস্থান থেকে সুষম ত্বরণে চলমান বস্তুর ক্ষেত্রে অতিক্রান্ত দূরত্ব (s) ও সময়ের (t) সম্পর্ক কী?",
    options: ["s ∝ t", "s ∝ t²", "s ∝ √t", "s ∝ 1/t"],
    answer: 1, // s ∝ t²
    explanation: "স্থির অবস্থান থেকে আদিবেগ u = 0 হলে, s = 0 + 0.5*a*t²। যেহেতু ত্বরণ a ধ্রুবক, তাই s ∝ t²।",
    difficulty: "MEDIUM",
    marks: 1,
    tags: ["kinematics", "equations"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-phy-02-03",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "falling-bodies",
    type: "MCQ",
    sourceType: "CLEAR_EDU_ORIGINAL",
    sourceName: "CLEAR EDU Assessment Bank",
    year: 2026,
    question: "একটি বস্তুকে খাড়া উপরের দিকে 19.6 m/s বেগে নিক্ষেপ করলে এটি সর্বোচ্চ কত উচ্চতায় উঠবে? (g = 9.8 m/s²)",
    options: ["9.8 m", "19.6 m", "39.2 m", "4.9 m"],
    answer: 1, // 19.6 m
    explanation: "সর্বোচ্চ উচ্চতা H = u² / (2g) = (19.6)² / (2 * 9.8) = 384.16 / 19.6 = 19.6 m।",
    difficulty: "MEDIUM",
    marks: 1,
    tags: ["gravity", "numerical"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-phy-02-04",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "acceleration",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Chattogram Board 2022",
    year: 2022,
    question: "ত্বরণের মাত্রা সমীকরণ নিচের কোনটি?",
    options: ["LT⁻¹", "LT⁻²", "MLT⁻²", "ML²T⁻²"],
    answer: 1, // LT^-2
    explanation: "ত্বরণ = বেগ / সময় = [LT⁻¹] / [T] = [LT⁻²]।",
    difficulty: "EASY",
    marks: 1,
    tags: ["dimension", "units"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-phy-02-05",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "graphical-analysis",
    type: "MCQ",
    sourceType: "CLEAR_EDU_ORIGINAL",
    sourceName: "CLEAR EDU Exemplar",
    year: 2026,
    question: "বেগ-সময় (v-t) লেখচিত্রের নিচে আবদ্ধ ক্ষেত্রফল কী নির্দেশ করে?",
    options: ["ত্বরণ (Acceleration)", "সরণ / অতিক্রান্ত দূরত্ব (Displacement)", "বল (Force)", "ক্ষমতা (Power)"],
    answer: 1, // Displacement
    explanation: "v-t লেখচিত্রের নিচের ক্ষেত্রফল = ∫ v dt = s (সরণ বা দূরত্ব)। এর ঢাল নির্দেশ করে ত্বরণ।",
    difficulty: "HARD",
    marks: 1,
    tags: ["graphs", "motion"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-phy-02-06",
    curriculumId: "nctb-ssc-2026",
    subjectId: "physics",
    chapterId: "phy-chap-02",
    topicId: "speed-velocity",
    type: "MCQ",
    sourceType: "PRACTICE",
    sourceName: "NCTB Exemplar Questions",
    year: 2025,
    question: "একটি গাড়ির বেগ 5 সেকেন্ডে 10 m/s থেকে বৃদ্ধি পেয়ে 25 m/s হলো। গাড়ির গড় ত্বরণ কত?",
    options: ["3 m/s²", "5 m/s²", "15 m/s²", "7 m/s²"],
    answer: 0, // 3 m/s²
    explanation: "ত্বরণ a = (v - u) / t = (25 - 10) / 5 = 15 / 5 = 3 m/s²।",
    difficulty: "EASY",
    marks: 1,
    tags: ["acceleration", "numerical"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // --- Chemistry Chapter 3: Structure of Matter MCQs ---
  {
    id: "q-chem-01-01",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    topicId: "subatomic-particles",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Dhaka Board 2023",
    year: 2023,
    question: "কোন কণাটি পরমাণুর নিউক্লিয়াসে থাকে না?",
    options: ["প্রোটন (Proton)", "নিউট্রন (Neutron)", "ইলেকট্রন (Electron)", "পজিট্রন (Positron)"],
    answer: 2, // Electron
    explanation: "পরমাণুর কেন্দ্রে নিউক্লিয়াসে প্রোটন ও নিউট্রন থাকে, আর ইলেকট্রন নিউক্লিয়াসের বাইরে নির্দিষ্ট কক্ষপথে ঘোরে।",
    difficulty: "EASY",
    marks: 1,
    tags: ["atomic-structure", "chemistry"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-chem-01-02",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    topicId: "isotopes",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Dinajpur Board 2024",
    year: 2024,
    question: "আইসোটোপগুলোর ক্ষেত্রে নিচের কোনটি সত্য?",
    options: [
      "প্রোটন সংখ্যা সমান কিন্তু ভর সংখ্যা ভিন্ন",
      "ভর সংখ্যা সমান কিন্তু প্রোটন সংখ্যা ভিন্ন",
      "নিউট্রন সংখ্যা সমান কিন্তু প্রোটন সংখ্যা ভিন্ন",
      "ইলেকট্রন সংখ্যা ভিন্ন কিন্তু নিউট্রন সংখ্যা সমান"
    ],
    answer: 0, // proton same, mass diff
    explanation: "যেসব পরমাণুর প্রোটন সংখ্যা বা পারমাণবিক সংখ্যা একই কিন্তু ভর সংখ্যা ভিন্ন, তাদের পরস্পরকে আইসোটোপ বলে।",
    difficulty: "MEDIUM",
    marks: 1,
    tags: ["isotopes", "nuclei"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-chem-01-03",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    topicId: "atomic-models",
    type: "MCQ",
    sourceType: "CLEAR_EDU_ORIGINAL",
    sourceName: "CLEAR EDU Chemistry Bench",
    year: 2026,
    question: "রাদারফোর্ডের পরমাণু মডেল নিচের কোনটির সাথে তুলনা করা হয়েছিল?",
    options: ["প্লাম পুডিং", "সৌরজগৎ (Solar System)", "তরমুজ", "বিলিয়ার্ড বল"],
    answer: 1, // Solar System
    explanation: "রাদারফোর্ড তার মডেলকে সৌরজগতের সাথে তুলনা করেন, যেখানে সূর্যকে নিউক্লিয়াস এবং গ্রহগুলোকে ইলেকট্রন হিসেবে কল্পনা করা হয়।",
    difficulty: "EASY",
    marks: 1,
    tags: ["rutherford", "history"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "q-chem-01-04",
    curriculumId: "nctb-ssc-2026",
    subjectId: "chemistry",
    chapterId: "chem-chap-01",
    topicId: "electron-config",
    type: "MCQ",
    sourceType: "BOARD",
    sourceName: "Cumilla Board 2023",
    year: 2023,
    question: "কোনো প্রধান শক্তিস্তরে সর্বোচ্চ ইলেকট্রন ধারণক্ষমতার সূত্র কোনটি?",
    options: ["2n", "n²", "2n²", "2(2l+1)"],
    answer: 2, // 2n²
    explanation: "বোর মডেল অনুসারে n-তম প্রধান শক্তিস্তরে সর্বোচ্চ ধারণক্ষমতা হলো 2n² টি ইলেকট্রন।",
    difficulty: "MEDIUM",
    marks: 1,
    tags: ["electron-configuration", "bohr"],
    published: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const NCTB_TOPICS: Topic[] = [
  // Physics Chapter 2 (Motion)
  { id: 'topic-phy-c02-01', subjectId: 'physics', chapterId: 'phy-c02', name: 'Rest and Motion (স্থিতি ও গতি)', bnName: 'স্থিতি ও গতি', description: 'Concepts of absolute vs relative rest and motion.', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c02-02', subjectId: 'physics', chapterId: 'phy-c02', name: 'Scalars and Vectors (স্কেলার ও ভেক্টর রাশি)', bnName: 'স্কেলার ও ভেক্টর', description: 'Differences between physical quantities with magnitude only vs magnitude and direction.', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c02-03', subjectId: 'physics', chapterId: 'phy-c02', name: 'Distance, Displacement & Speed (দূরত্ব, সরণ ও দ্রুতি)', bnName: 'দূরত্ব, সরণ ও দ্রুতি', description: 'Linear vs actual path distance and displacement metrics.', order: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c02-04', subjectId: 'physics', chapterId: 'phy-c02', name: 'Velocity and Acceleration (বেগ ও ত্বরণ)', bnName: 'বেগ ও ত্বরণ', description: 'Rate of change of displacement and velocity over time.', order: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c02-05', subjectId: 'physics', chapterId: 'phy-c02', name: 'Equations of Motion (গতির সমীকরণ)', bnName: 'গতির ৪টি সমীকরণ', description: 'v = u + at, s = ((u+v)/2)t, s = ut + ½at², v² = u² + 2as.', order: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c02-06', subjectId: 'physics', chapterId: 'phy-c02', name: 'Motion of Falling Bodies under Gravity (পড়ন্ত বস্তু)', bnName: 'গ্যালিলিওর পড়ন্ত বস্তুর সূত্র', description: 'Galileo’s 3 laws of falling bodies and free-fall equations.', order: 6, createdAt: Date.now(), updatedAt: Date.now() },

  // Physics Chapter 3 (Force)
  { id: 'topic-phy-c03-01', subjectId: 'physics', chapterId: 'phy-c03', name: 'Inertia and Force Concept (জড়তা ও বল)', bnName: 'জড়তা ও বল', description: 'Newton’s first law and definition of qualitative force.', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c03-02', subjectId: 'physics', chapterId: 'phy-c03', name: 'Momentum and Newton Second Law: F = ma (ভরবেগ ও নিউটনের ২য় সূত্র)', bnName: 'ভরবেগ ও বলের পরিমাপ', description: 'Derivation of F = ma and rate of change of linear momentum.', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c03-03', subjectId: 'physics', chapterId: 'phy-c03', name: 'Newton Third Law & Conservation of Momentum (ক্রিয়া-প্রতিক্রিয়া ও সংরক্ষণশীলতা)', bnName: 'ভরবেগের সংরক্ষণ সূত্র', description: 'Action-reaction forces and m1u1 + m2u2 = m1v1 + m2v2.', order: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-phy-c03-04', subjectId: 'physics', chapterId: 'phy-c03', name: 'Friction and Friction Types (ঘর্ষণ ও তার প্রকারভেদ)', bnName: 'ঘর্ষণ ও ঘর্ষণ বল', description: 'Static, kinetic, rolling, and fluid friction mechanics.', order: 4, createdAt: Date.now(), updatedAt: Date.now() },

  // Chemistry Chapter 3 (Structure of Matter)
  { id: 'topic-chem-c03-01', subjectId: 'chemistry', chapterId: 'chem-c03', name: 'Subatomic Particles & Atoms (পরমাণু ও তার মূল কণিকা)', bnName: 'ইলেকট্রন, প্রোটন ও নিউট্রন', description: 'Properties, charges, and relative masses of protons, neutrons, and electrons.', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-chem-c03-02', subjectId: 'chemistry', chapterId: 'chem-c03', name: 'Rutherford & Bohr Atomic Models (রাদারফোর্ড ও বোর পরমাণু মডেল)', bnName: 'পরমাণু মডেল ও সীমাবদ্ধতা', description: 'Alpha particle scattering, solar model, planetary orbits, and Bohr postulates.', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-chem-c03-03', subjectId: 'chemistry', chapterId: 'chem-c03', name: 'Electronic Configuration & Energy Levels (ইলেকট্রন বিন্যাস)', bnName: '2n² নীতি ও উপশক্তিস্তর s, p, d, f', description: 'Distribution of electrons across K, L, M, N shells and Aufbau principle.', order: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-chem-c03-04', subjectId: 'chemistry', chapterId: 'chem-c03', name: 'Isotopes & Medical/Industrial Uses (আইসোটোপ ও ব্যবহার)', bnName: 'আইসোটোপের তেজস্ক্রিয় ব্যবহার', description: 'Radioactive isotopes in medicine (Co-60, I-131, C-14) and agriculture.', order: 4, createdAt: Date.now(), updatedAt: Date.now() },

  // General Math Chapter 2 (Sets & Functions)
  { id: 'topic-math-c02-01', subjectId: 'general-math', chapterId: 'math-c02', name: 'Representation of Sets & Subsets (সেটের প্রকাশ ও উপসেট)', bnName: 'তালিকা ও সেট গঠন পদ্ধতি', description: 'Roster vs Set Builder methods, proper and improper subsets.', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-math-c02-02', subjectId: 'general-math', chapterId: 'math-c02', name: 'Union, Intersection & Complement (সংযোগ, ছেদ ও পূরক সেট)', bnName: 'সেট প্রক্রিয়া ও ভেনচিত্র', description: 'A ∪ B, A ∩ B, A \\ B, and De Morgan’s laws using Venn diagrams.', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-math-c02-03', subjectId: 'general-math', chapterId: 'math-c02', name: 'Relations, Domain, Range & Functions (অন্বয়, ডোমেন ও ফাংশন)', bnName: 'ফাংশনের ধারণা', description: 'Cartesian products, definition of relation, domain, range, and function tests.', order: 3, createdAt: Date.now(), updatedAt: Date.now() },

  // General Math Chapter 3 (Algebraic Expressions)
  { id: 'topic-math-c03-01', subjectId: 'general-math', chapterId: 'math-c03', name: 'Square and Cube Formulas (বর্গ ও ঘন সংবলিত সূত্রাবলি)', bnName: 'বীজগাণিতিক রাশি ও অনুসিদ্ধান্ত', description: '(a+b)², (a-b)², a³+b³, a³-b³ and board question derivations.', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'topic-math-c03-02', subjectId: 'general-math', chapterId: 'math-c03', name: 'Factorization & Remainder Theorem (উৎপাদকে বিশ্লেষণ ও ভাগশেষ উপপাদ্য)', bnName: 'মিডল টার্ম ও ভাগশেষ উপপাদ্য', description: 'Splitting middle terms and factoring polynomial expressions.', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
];

export const INITIAL_EDUCATION_SOURCES: EducationSource[] = [
  {
    id: 'source-yt-10ms',
    platform: 'YOUTUBE',
    name: '10 Minute School - Class 9 & 10 (SSC)',
    channelOrPageId: 'UCpS2VbYJ3Jv4KqO8k6B8Y8A',
    url: 'https://www.youtube.com/@10MinuteSchoolSSC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop',
    subjects: ['physics', 'chemistry', 'general-math', 'higher-math', 'biology', 'english-1st', 'english-2nd', 'ict'],
    medium: 'BOTH',
    targetClass: 'SSC',
    verified: true,
    active: true,
    autoSync: true,
    filterKeywords: ['SSC', 'Class 9', 'Class 10', 'Physics', 'Chemistry', 'Math', 'পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    requireAdminApproval: false,
    lastSyncedAt: Date.now() - 3600000,
    syncStatus: 'SUCCESS',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'source-yt-shikho',
    platform: 'YOUTUBE',
    name: 'Shikho SSC & Dakhil',
    channelOrPageId: 'UCshikho_ssc_official',
    url: 'https://www.youtube.com/@ShikhoSSC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop',
    subjects: ['physics', 'chemistry', 'general-math', 'higher-math', 'biology'],
    medium: 'BOTH',
    targetClass: 'SSC',
    verified: true,
    active: true,
    autoSync: true,
    filterKeywords: ['SSC', 'Class 9', 'Class 10', 'Physics', 'Math', 'Animation', 'পদার্থ'],
    requireAdminApproval: false,
    lastSyncedAt: Date.now() - 7200000,
    syncStatus: 'SUCCESS',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'source-yt-onnorokom',
    platform: 'YOUTUBE',
    name: 'Onnorokom Pathshala',
    channelOrPageId: 'UCo0YQ074GkL8_m1GZq8VqRA',
    url: 'https://www.youtube.com/@OnnorokomPathshala',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop',
    subjects: ['physics', 'chemistry', 'higher-math', 'biology'],
    medium: 'BANGLA_MEDIUM',
    targetClass: 'SSC',
    verified: true,
    active: true,
    autoSync: true,
    filterKeywords: ['SSC', 'Physics', 'Chemistry', 'Higher Math', 'অন্যরকম পাঠশালা'],
    requireAdminApproval: false,
    lastSyncedAt: Date.now() - 10800000,
    syncStatus: 'SUCCESS',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'source-yt-udvash',
    platform: 'YOUTUBE',
    name: 'উদ্ভাস-উন্মেষ (Udvash SSC Academic)',
    channelOrPageId: 'UCudvash_ssc_official',
    url: 'https://www.youtube.com/@UdvashUnmeshSSC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop',
    subjects: ['physics', 'chemistry', 'general-math', 'higher-math'],
    medium: 'BOTH',
    targetClass: 'SSC',
    verified: true,
    active: true,
    autoSync: true,
    filterKeywords: ['SSC', 'Board CQ', 'Master Class', 'উদ্ভাস'],
    requireAdminApproval: false,
    lastSyncedAt: Date.now() - 14400000,
    syncStatus: 'SUCCESS',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'source-fb-10ms',
    platform: 'FACEBOOK',
    name: '10 Minute School Live Classroom (Facebook Page)',
    channelOrPageId: '10minuteschool',
    url: 'https://www.facebook.com/10minuteschool',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop',
    subjects: ['physics', 'chemistry', 'general-math', 'english-1st', 'english-2nd'],
    medium: 'BANGLA_MEDIUM',
    targetClass: 'SSC',
    verified: true,
    active: true,
    autoSync: true,
    filterKeywords: ['SSC 2026', 'SSC 2025', 'Class 9', 'Class 10', 'Live Class', 'লাইভ ক্লাস'],
    requireAdminApproval: true,
    lastSyncedAt: Date.now() - 18000000,
    syncStatus: 'SUCCESS',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_LIVE_CLASSES: LiveClass[] = [
  {
    id: 'live-phy-01',
    sourceId: 'source-yt-10ms',
    sourceName: '10 Minute School - Class 9 & 10 (SSC)',
    platform: 'YOUTUBE',
    title: 'SSC 2026 Physics Chapter 2: Motion (গতির সমীকরণ ও লেখচিত্র বোর্ড প্রশ্ন সমাধান)',
    description: 'Live interactive class on derivation of equations of motion and velocity-time graphs with board CQ patterns.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop',
    videoOrBroadcastId: 'F_79p8ZqP0k',
    embedUrl: 'https://www.youtube-nocookie.com/embed/F_79p8ZqP0k',
    externalUrl: 'https://www.youtube.com/watch?v=F_79p8ZqP0k',
    teacher: 'Chinmoy Saha',
    subjectId: 'physics',
    chapterId: 'phy-c02',
    topicId: 'topic-phy-c02-05',
    medium: 'BANGLA_MEDIUM',
    status: 'LIVE_NOW',
    scheduledStartTime: Date.now() - 1800000,
    actualStartTime: Date.now() - 1800000,
    approvalStatus: 'APPROVED',
    isOfficial: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'live-math-02',
    sourceId: 'source-yt-shikho',
    sourceName: 'Shikho SSC & Dakhil',
    platform: 'YOUTUBE',
    title: 'Class 9-10 General Math Chapter 3: Algebraic Formulas & CQ Mastery',
    description: 'Masterclass covering algebraic identities, value determination formulas, and top cadet college questions.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop',
    videoOrBroadcastId: 'math_live_ssc_02',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    externalUrl: 'https://www.youtube.com/',
    teacher: 'Hasnat Abdullah',
    subjectId: 'general-math',
    chapterId: 'math-c03',
    topicId: 'topic-math-c03-01',
    medium: 'BANGLA_MEDIUM',
    status: 'TODAY',
    scheduledStartTime: Date.now() + 7200000,
    approvalStatus: 'APPROVED',
    isOfficial: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'live-chem-03',
    sourceId: 'source-yt-onnorokom',
    sourceName: 'Onnorokom Pathshala',
    platform: 'YOUTUBE',
    title: 'SSC Chemistry Chapter 3: Electron Configuration Exceptions (Cr, Cu & Aufbau)',
    description: 'Detailed explanation of why Chromium and Copper deviate from regular electronic configurations.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
    videoOrBroadcastId: 'chem_live_ssc_03',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    externalUrl: 'https://www.youtube.com/',
    teacher: 'Engr. Ratul Khan',
    subjectId: 'chemistry',
    chapterId: 'chem-c03',
    topicId: 'topic-chem-c03-03',
    medium: 'BANGLA_MEDIUM',
    status: 'UPCOMING',
    scheduledStartTime: Date.now() + 86400000,
    approvalStatus: 'APPROVED',
    isOfficial: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'live-eng-04',
    sourceId: 'source-fb-10ms',
    sourceName: '10 Minute School Live Classroom',
    platform: 'FACEBOOK',
    title: 'SSC English 2nd Paper: Right Form of Verbs & Modifiers Masterclass',
    description: 'Rules and recent board exam practice questions with instant interactive polling.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop',
    videoOrBroadcastId: 'fb_live_eng_04',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F10minuteschool',
    externalUrl: 'https://www.facebook.com/10minuteschool',
    teacher: 'Munzereen Shahid',
    subjectId: 'english-2nd',
    medium: 'BANGLA_MEDIUM',
    status: 'THIS_WEEK',
    scheduledStartTime: Date.now() + 172800000,
    approvalStatus: 'APPROVED',
    isOfficial: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'live-phy-rec-05',
    sourceId: 'source-yt-udvash',
    sourceName: 'উদ্ভাস-উন্মেষ (Udvash SSC Academic)',
    platform: 'YOUTUBE',
    title: 'SSC Physics Chapter 3: Force & Laws of Motion Complete Revision',
    description: 'Full recording of the 2-hour masterclass on Newton’s 3 laws, momentum conservation, and friction calculations.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
    videoOrBroadcastId: 'YQHsXMglC9A',
    embedUrl: 'https://www.youtube-nocookie.com/embed/YQHsXMglC9A',
    externalUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    teacher: 'Abir Hossain',
    subjectId: 'physics',
    chapterId: 'phy-c03',
    topicId: 'topic-phy-c03-02',
    medium: 'BANGLA_MEDIUM',
    status: 'RECORDING_AVAILABLE',
    scheduledStartTime: Date.now() - 259200000,
    actualStartTime: Date.now() - 259200000,
    endTime: Date.now() - 252000000,
    recordingUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
    approvalStatus: 'APPROVED',
    isOfficial: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const INITIAL_APP_CONFIG: AppConfig = {
  defaultQuestionCount: 10,
  defaultPassMark: 50,
  aiModel: "gemini-3.8-flash",
  maintenanceMode: false,
  maintenanceMessage: "CLEAR EDU is undergoing scheduled maintenance. Please check back shortly.",
  allowPublicGuestPractice: true,
  allowAiGeneratedQuestionsDraft: true,
  enableAppCheckDebug: true,
};

/**
 * Seeds or synchronizes the complete NCTB curriculum, classes, books, questions and configs
 */
export async function seedInitialCurriculum(): Promise<{ success: boolean; message: string }> {
  try {
    const timestamp = Date.now();

    // 1. Academic Years
    const yearsMap: Record<string, any> = {};
    NCTB_ACADEMIC_YEARS.forEach((y) => {
      yearsMap[y.id] = y;
    });
    await set(ref(database, 'academicYears'), yearsMap);

    // 2. Curriculum Versions
    const versionsMap: Record<string, any> = {};
    NCTB_CURRICULUM_VERSIONS.forEach((v) => {
      versionsMap[v.id] = v;
    });
    await set(ref(database, 'curriculumVersions'), versionsMap);

    // 3. Subject Groups
    const groupsMap: Record<string, any> = {};
    NCTB_SUBJECT_GROUPS.forEach((g) => {
      groupsMap[g.id] = g;
    });
    await set(ref(database, 'subjectGroups'), groupsMap);

    // 4. Subjects
    const subjectsMap: Record<string, any> = {};
    NCTB_SUBJECTS.forEach((sub) => {
      subjectsMap[sub.id] = { ...sub, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'subjects'), subjectsMap);

    // 5. Chapters
    const chaptersMap: Record<string, any> = {};
    NCTB_CHAPTERS.forEach((chap) => {
      chaptersMap[chap.id] = { ...chap, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'chapters'), chaptersMap);

    // 6. Books
    const booksMap: Record<string, any> = {};
    NCTB_BOOKS.forEach((book) => {
      booksMap[book.id] = { ...book, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'books'), booksMap);

    // 7. Playlists
    const playlistsMap: Record<string, any> = {};
    INITIAL_PLAYLISTS.forEach((pl) => {
      playlistsMap[pl.id] = { ...pl, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'playlists'), playlistsMap);

    // 8. Classes
    const classesMap: Record<string, any> = {};
    INITIAL_CLASSES.forEach((cls) => {
      classesMap[cls.id] = { ...cls, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'classes'), classesMap);

    // 9. Playlist Items Mapping
    const playlistItemsMap: Record<string, any> = {
      'playlist-phy-motion': {
        'phy-c02-01': { order: 1 },
        'phy-c02-02': { order: 2 },
        'phy-c02-03': { order: 3 },
        'phy-c02-04': { order: 4 },
      },
      'playlist-chem-matter': {
        'chem-c03-01': { order: 1 },
        'chem-c03-02': { order: 2 },
      },
      'playlist-phy-force': {
        'phy-c03-01': { order: 1 },
      }
    };
    await set(ref(database, 'playlistItems'), playlistItemsMap);

    // 10. Resources
    const resourcesMap: Record<string, any> = {};
    INITIAL_RESOURCES.forEach((res) => {
      resourcesMap[res.id] = { ...res, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'resources'), resourcesMap);

    // 11. Chapter Exam Configurations
    await set(ref(database, 'chapterExamConfigs'), INITIAL_EXAM_CONFIGS);

    // 12. Question Bank
    const questionsMap: Record<string, any> = {};
    INITIAL_QUESTIONS.forEach((q) => {
      questionsMap[q.id] = { ...q, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'questions'), questionsMap);

    // 13. Education Sources (YouTube & Facebook)
    const sourcesMap: Record<string, any> = {};
    INITIAL_EDUCATION_SOURCES.forEach((s) => {
      sourcesMap[s.id] = { ...s, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'educationSources'), sourcesMap);

    // 14. Live Classes
    const liveClassesMap: Record<string, any> = {};
    INITIAL_LIVE_CLASSES.forEach((lc) => {
      liveClassesMap[lc.id] = { ...lc, createdAt: timestamp, updatedAt: timestamp };
    });
    await set(ref(database, 'liveClasses'), liveClassesMap);

    // 15. App Config (only if not existing to preserve admin custom configs)
    const currentConfigSnap = await get(ref(database, 'appConfig'));
    if (!currentConfigSnap.exists()) {
      await set(ref(database, 'appConfig'), INITIAL_APP_CONFIG);
    }

    return {
      success: true,
      message: `Curriculum successfully seeded with ${NCTB_SUBJECTS.length} NCTB subjects, ${NCTB_CHAPTERS.length} chapters, ${NCTB_BOOKS.length} books, ${INITIAL_CLASSES.length} classes, ${INITIAL_QUESTIONS.length} authenticated MCQs, ${INITIAL_EDUCATION_SOURCES.length} education sources, and live classes!`
    };
  } catch (error: any) {
    console.error('Seed curriculum error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to seed curriculum. Check Realtime Database rules.'
    };
  }
}

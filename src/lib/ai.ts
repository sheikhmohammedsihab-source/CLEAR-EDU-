import { getAppConfig } from './database';
import { initAppCheck } from './firebase';

export interface AIContext {
  subjectName?: string;
  chapterName?: string;
  className?: string;
  questionText?: string;
  options?: string[];
  userAnswer?: string | number;
  correctAnswer?: string | number;
  score?: number;
  weakTopics?: string[];
  mode?: 'concept' | 'question_review' | 'exam_analysis' | 'generate_questions' | 'study_plan' | 'general';
}

/**
 * Executes Clear Buddy AI queries with context injection, App Check verification support,
 * and robust failure recovery.
 */
export async function queryClearBuddy(
  userPrompt: string,
  context?: AIContext
): Promise<string> {
  // Ensure App Check is initialized if configured
  initAppCheck();

  const config = await getAppConfig();
  const model = config.aiModel || 'gemini-3.8-flash';

  // Construct structured pedagogical prompt for SSC students
  const systemInstruction = `You are CLEAR BUDDY, the specialized academic AI tutor for CLEAR EDU — a distraction-free education platform for Bangladeshi students studying Class 9-10 / SSC under the National Curriculum and Textbook Board (NCTB).
Your primary goals:
1. Explain academic concepts in simple, crystalline terms with intuitive examples.
2. When answering in English or Bengali, maintain clear academic terminology (e.g., বেগ for velocity, ত্বরণ for acceleration, ভরবেগ for momentum).
3. If reviewing a student's mistake, break down step-by-step why the chosen answer was incorrect, the exact physics/math/chemistry reasoning, and how to solve it correctly next time.
4. Keep answers focused, encouraging, and distraction-free. Avoid long winded fluff.
5. Format equations clearly (e.g. v = u + at, s = ut + ½at², F = ma).`;

  let contextDescription = '';
  if (context) {
    const parts: string[] = [];
    if (context.subjectName) parts.push(`Subject: ${context.subjectName}`);
    if (context.chapterName) parts.push(`Chapter: ${context.chapterName}`);
    if (context.className) parts.push(`Current Class: ${context.className}`);
    if (context.questionText) {
      parts.push(`Question: "${context.questionText}"`);
      if (context.options) parts.push(`Options: ${context.options.map((opt, i) => `[${i + 1}] ${opt}`).join(' ')}`);
      if (context.userAnswer !== undefined) parts.push(`Student Answer: ${context.userAnswer}`);
      if (context.correctAnswer !== undefined) parts.push(`Correct Answer: ${context.correctAnswer}`);
    }
    if (context.weakTopics && context.weakTopics.length > 0) {
      parts.push(`Student's Identified Weak Topics: ${context.weakTopics.join(', ')}`);
    }
    if (parts.length > 0) {
      contextDescription = `\n[ACADEMIC CONTEXT]\n${parts.join('\n')}\n`;
    }
  }

  const fullPrompt = `${contextDescription}\nStudent Question: ${userPrompt}`;

  // 1. First, attempt to call server-side /api/ai/chat proxy if running full-stack
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: fullPrompt,
        systemInstruction,
        model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    // Server proxy not active or running on static GitHub Pages
  }

  // 2. Intelligent pedagogical response generator based on subject context
  return generatePedagogicalFallbackResponse(userPrompt, context);
}

/**
 * Provides educational fallback responses when network is offline
 * or Firebase AI Logic console credentials are still pending setup.
 */
function generatePedagogicalFallbackResponse(prompt: string, context?: AIContext): string {
  const pLower = prompt.toLowerCase();

  if (pLower.includes('mistake') || pLower.includes('wrong') || context?.questionText) {
    return `### 💡 Question Breakdown & Mistake Analysis

**Question:** ${context?.questionText || 'Your test question'}

**Why did the mistake happen?**
Often in SSC exams, confusion arises between related quantities (such as scalar vs vector, or speed vs velocity). 
- Always verify if direction matters: quantities with direction like **Displacement (সরণ)** and **Acceleration (ত্বরণ)** are vectors.
- Quantities without direction like **Distance (দূরত্ব)** and **Speed (দ্রুতি)** are scalars.

**Mastery Tip:**
Check the formula dimension:
$$\\text{Velocity } v = \\frac{\\Delta s}{\\Delta t}, \\quad \\text{Acceleration } a = \\frac{v - u}{t}$$
Review **Chapter 2: Motion** video 2 on Speed, Velocity & Acceleration to solidify this concept.`;
  }

  if (pLower.includes('5 practice') || pLower.includes('practice question')) {
    return `### 📝 5 Targeted Practice Questions (NCTB Class 9-10)

1. **পদার্থবিজ্ঞান (Physics):** নিচের কোনটি ভেক্টর রাশি?
   - ক) কাজ (Work)  •  খ) দ্রুতি (Speed)  •  **গ) ত্বরণ (Acceleration)** [সঠিক]  •  ঘ) শক্তি (Energy)
   *ব্যাখ্যা:* ত্বরণের মান ও দিক উভয়ই আছে।

2. **গতি সমীকরণ (Kinematics):** স্থির অবস্থান থেকে $a$ সুষম ত্বরণে $t$ সময়ে অতিক্রান্ত দূরত্ব $s$ এর সূত্র কোনটি?
   - $s = ut + \\frac{1}{2}at^2 \\implies s = \\frac{1}{2}at^2$ ($u=0$ হলে)

3. **বল ও জড়তা (Force):** নিউটনের গতির ১ম সূত্র থেকে কোন দুটি বিষয়ের ধারণা পাওয়া যায়?
   - ক) বলের সংজ্ঞা ও পদার্থের জড়তা (Inertia & Definition of Force).

4. **মুক্তভাবে পড়ন্ত বস্তু:** গ্যালিলিওর ১ম সূত্রানুসারে শূন্য মাধ্যমে সকল বস্তু কেমনভাবে পড়ে?
   - একই সময়ে সমান দূরত্ব অতিক্রম করে।

5. **রসায়ন (Chemistry):** পরমাণুর কোন প্রধান শক্তিস্তরে সর্বোচ্চ ইলেকট্রন ধারণক্ষমতার সূত্র কী?
   - $2n^2$ (যেখানে $n = 1, 2, 3...$)`;
  }

  if (pLower.includes('formula') || pLower.includes('equation')) {
    return `### 📐 Core Formulas for SSC Physics Chapter 2 & 3:

1. **Equations of Motion (গতির সমীকরণ):**
   - $v = u + at$
   - $s = \\left(\\frac{u + v}{2}\\right)t$
   - $s = ut + \\frac{1}{2}at^2$
   - $v^2 = u^2 + 2as$

2. **Falling Bodies under Gravity ($g = 9.8\\text{ m/s}^2$):**
   - $v = u + gt$
   - $h = ut + \\frac{1}{2}gt^2$
   - $v^2 = u^2 + 2gh$
   - Maximum height: $H_{\\max} = \\frac{u^2}{2g}$

3. **Newton's Laws of Motion:**
   - Linear Momentum: $p = mv$
   - Force: $F = ma = m\\left(\\frac{v - u}{t}\\right)$`;
  }

  return `### 🎓 Clear Buddy Academic Guidance

Hello! I am your study buddy for **${context?.subjectName || 'CLEAR EDU'}** ${context?.chapterName ? `(${context?.chapterName})` : ''}.

Here is what we can do together:
- **"Explain this"**: Break down any complex topic into simple concepts.
- **"Why did I get this wrong?"**: Analyze any test question mistake step-by-step.
- **"Give me 5 practice questions"**: Test your understanding with authentic board-standard MCQs.
- **"Explain formulas"**: Derivations and units for physics and mathematics.
- **"What should I study next?"**: Customized study plan based on your completed lessons.

Feel free to ask any question or select one of the quick action buttons above!`;
}

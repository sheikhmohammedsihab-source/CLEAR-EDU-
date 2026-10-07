# CLEAR EDU — Learn without the noise

> **CLEAR** = Curated Learning, Education & Accessible Resources  
> **Tagline**: *Learn without the noise.*  
> **Core Target**: Distraction-free educational platform for Bangladesh students, initially focused on Class 9–10 / SSC with scalable architecture for HSC, admission, and university.

---

## 🧭 Core Educational Experience
**Study → Complete → Test → Analyze → Practice → Master → Continue**

CLEAR EDU decides what the student should watch and structures their learning journey into sequential academic paths.
- Official YouTube classes without recommendations, comments, or Shorts feeds.
- Automatic cross-device resume position saving.
- Automated chapter completion detection & idempotent chapter exam unlocks.
- Complete Question Bank with authentic board standard MCQs and practice modes.
- Exam engine with live timer, question palette, and mistake analysis.
- Clear Buddy AI academic tutor for step-by-step guidance.

---

## 🛠️ Tech Stack & Platform
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: `HashRouter` (guarantees 100% static hosting compatibility on GitHub Pages)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-In)
- **AI Logic**: Firebase AI Logic / Gemini API SDK (`gemini-3.8-flash` configurable)
- **Security & Integrity**: Firebase App Check (reCAPTCHA v3 & Debug Provider)
- **Video Delivery**: Official YouTube IFrame Player API (`enablejsapi=1`, `playsinline=1`, `rel=0`)
- **Admin Authority**: Single authoritative Admin UID (`Kyh57omRpLd8Zbmbt2CqL4GvhN92`) verified at database security rules and UX route guard.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Production Build
```bash
npm run build
```
Generates production-optimized artifacts in `dist/`.

### 4. Type Check / Lint
```bash
npm run lint
```

---

## 🔥 Firebase Configuration & Setup

### 1. Firebase Project Details
The application is pre-configured to connect modularly to:
- **Project ID**: `clear-edu`
- **Auth Domain**: `clear-edu.firebaseapp.com`
- **Realtime Database URL**: `https://clear-edu-default-rtdb.firebaseio.com`
- **Storage Bucket**: `clear-edu.firebasestorage.app`

### 2. Authentication Setup
In the [Firebase Console](https://console.firebase.google.com/):
1. Navigate to **Build** → **Authentication** → **Sign-in method**.
2. Enable **Email/Password** and **Google**.
3. Under **Settings** → **Authorized domains**, ensure:
   - `localhost`
   - `<username>.github.io`
   - Your custom domain or preview URL

### 3. Realtime Database Security Rules
1. In Firebase Console, go to **Realtime Database** → **Rules**.
2. Paste the full contents of `firebase-rules.json`.
3. Click **Publish**.

Security is enforced at the database level:
- Students can only read published courses and read/write their own progress, bookmarks, exam attempts, and chat sessions.
- Only Admin UID `Kyh57omRpLd8Zbmbt2CqL4GvhN92` can create or modify subjects, chapters, classes, books, questions, and app configuration.

---

## 🤖 Firebase AI Logic & App Check Setup

CLEAR BUDDY is powered by Firebase AI Logic / Gemini API (`gemini-3.8-flash`).

### 1. Enable Firebase AI Logic in Firebase Console
1. In Firebase Console, navigate to **Build** → **AI Logic** (or **Vertex AI for Firebase**).
2. Click **Get Started** and enable the APIs for your project.
3. Choose the default model: `gemini-3.8-flash`.

### 2. App Check Configuration
App Check protects Firebase resources and AI Logic from abuse.
1. In Firebase Console, go to **Build** → **App Check**.
2. Click **Apps** → select your Web App.
3. Provider: Select **reCAPTCHA v3**.
4. Enter your reCAPTCHA v3 Secret Key in the console, and copy your public Site Key.
5. In your local or deployment environment, set:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
   ```

### 3. Local Development with App Check Debug Token
When running on `localhost`, CLEAR EDU automatically activates the App Check Debug Provider:
1. Open DevTools console on `http://localhost:3000`.
2. Look for `Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`.
3. Copy this token and register it in **Firebase Console** → **App Check** → **Apps** → **Manage debug tokens**.

---

## 📚 NCTB Curriculum & 1-Click Database Seeding
CLEAR EDU comes with a built-in seed synchronizer for official NCTB Class 9-10 (SSC) subjects, chapters, classes, textbooks, and authenticated board questions:
1. Log in with the Admin account (`Kyh57omRpLd8Zbmbt2CqL4GvhN92`).
2. Go to `/admin` or click **Admin CMS** in the navigation.
3. Click **Sync/Seed NCTB Data**.
4. The database is instantly populated with:
   - Compulsory Subjects (Bangla, English, General Math, ICT, Religion, Career & Health)
   - Science Group (Physics, Chemistry, Biology, Higher Math, Bangladesh & Global Studies)
   - Humanities & Business Studies groups
   - Official NCTB textbook links (`nctb.gov.bd`)
   - Sequential video lessons with YouTube IDs
   - MCQ Question Bank & Chapter Exam configurations

---

## 🚢 GitHub Pages Deployment via GitHub Actions
A GitHub Actions workflow is provided in `.github/workflows/deploy.yml`:
1. Push your changes to the `main` branch:
   ```bash
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` automatically runs `npm ci`, compiles `npm run build`, and deploys to `https://<username>.github.io/<repo-name>/`.
4. Because `HashRouter` is used, refreshing any route (e.g. `/#/subjects` or `/#/question-bank`) will never throw a 404 error.

---

## 🛡️ Security & Privacy Architecture
- **No Client-side Secrets**: No private service account keys or raw Gemini API secrets are ever committed or exposed to frontend bundles.
- **Admin Verification**: The permanent Admin UID `Kyh57omRpLd8Zbmbt2CqL4GvhN92` is checked in Realtime Database rules (`auth.uid === 'Kyh57omRpLd8Zbmbt2CqL4GvhN92'`). Public editable flags in `appConfig` cannot elevate a user's permissions.
- **Zero Distractions**: Strictly distraction-free YouTube embeds via `enablejsapi=1`, `rel=0`, and `playsinline=1`. No video recommendations, comments, or external discovery feeds.

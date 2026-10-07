import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Student Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Subjects } from './pages/Subjects';
import { SubjectPage } from './pages/Subject';
import { ChapterPage } from './pages/Chapter';
import { PlaylistPage } from './pages/Playlist';
import { ClassPlayer } from './pages/ClassPlayer';
import { Profile } from './pages/Profile';
import { Saved } from './pages/Saved';
import { Progress } from './pages/Progress';
import { QuestionBank } from './pages/QuestionBank';
import { Exam } from './pages/Exam';
import { ExamResult } from './pages/ExamResult';
import { ClearBuddy } from './pages/ClearBuddy';
import { LiveClasses } from './pages/LiveClasses';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminChapters } from './pages/admin/AdminChapters';
import { AdminBooks } from './pages/admin/AdminBooks';
import { AdminPlaylists } from './pages/admin/AdminPlaylists';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminClassForm } from './pages/admin/AdminClassForm';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminQuestionForm } from './pages/admin/AdminQuestionForm';
import { AdminQuestionSets } from './pages/admin/AdminQuestionSets';
import { AdminExams } from './pages/admin/AdminExams';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSources } from './pages/admin/AdminSources';
import { AdminLiveClasses } from './pages/admin/AdminLiveClasses';

// Scroll to top helper on hash route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
          <Header />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              {/* Student Public & Learning Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
              <Route path="/class/:classId" element={<ClassPlayer />} />

              {/* Assessment, Question Bank & Clear Buddy */}
              <Route path="/live-classes" element={<LiveClasses />} />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/exam/:id" element={<Exam />} />
              <Route path="/exam/:id/result" element={<ExamResult />} />
              <Route path="/clear-buddy" element={<ClearBuddy />} />

              {/* Student Library & Progress (Protected) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />

              {/* Admin CMS Routes (Admin UID Protected) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <AdminRoute>
                    <AdminSubjects />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/chapters"
                element={
                  <AdminRoute>
                    <AdminChapters />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <AdminRoute>
                    <AdminBooks />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/playlists"
                element={
                  <AdminRoute>
                    <AdminPlaylists />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <AdminRoute>
                    <AdminClasses />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/classes/new"
                element={
                  <AdminRoute>
                    <AdminClassForm />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/classes/edit/:classId"
                element={
                  <AdminRoute>
                    <AdminClassForm />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/resources"
                element={
                  <AdminRoute>
                    <AdminResources />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <AdminRoute>
                    <AdminQuestions />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/questions/new"
                element={
                  <AdminRoute>
                    <AdminQuestionForm />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/questions/edit/:id"
                element={
                  <AdminRoute>
                    <AdminQuestionForm />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/question-sets"
                element={
                  <AdminRoute>
                    <AdminQuestionSets />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/exams"
                element={
                  <AdminRoute>
                    <AdminExams />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <AdminRoute>
                    <AdminStudents />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/sources"
                element={
                  <AdminRoute>
                    <AdminSources />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/live-classes"
                element={
                  <AdminRoute>
                    <AdminLiveClasses />
                  </AdminRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { AboutPage } from './pages/public/AboutPage';

// Student pages
import { DashboardPage } from './pages/student/DashboardPage';
import { ClassNotesPage } from './pages/student/ClassNotesPage';
import { StudyHubPage } from './pages/student/StudyHubPage';
import { SubjectDetailPage } from './pages/student/SubjectDetailPage';
import { ChapterDetailPage } from './pages/student/ChapterDetailPage';
import { MaterialsDirectoryPage } from './pages/student/MaterialsDirectoryPage';
import { PdfViewerPage } from './pages/student/PdfViewerPage';
import { DownloadsPage } from './pages/student/DownloadsPage';
import { EbooksPage } from './pages/student/EbooksPage';
import { PurchasesPage } from './pages/student/PurchasesPage';
import { CheckoutPage } from './pages/student/CheckoutPage';
import { TestsListPage } from './pages/student/TestsListPage';
import { TestExamPage } from './pages/student/TestExamPage';
import { TestResultPage } from './pages/student/TestResultPage';
import { AnnouncementsPage } from './pages/student/AnnouncementsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminPurchasesPage } from './pages/admin/AdminPurchasesPage';
import { AdminPaymentSettingsPage } from './pages/admin/AdminPaymentSettingsPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminCurriculumPage } from './pages/admin/AdminCurriculumPage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';
import { AdminEbooksPage } from './pages/admin/AdminEbooksPage';
import { AdminTestsPage } from './pages/admin/AdminTestsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Protected Student Route wrapper
const ProtectedStudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Protected Administrator Route wrapper
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Verifying administrative authority...
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Main Layout Wrapper
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedStudentRoute>
                    <DashboardPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route path="/class/11" element={<ClassNotesPage forcedGrade={11} />} />
              <Route path="/class/12" element={<ClassNotesPage forcedGrade={12} />} />
              <Route path="/study" element={<StudyHubPage />} />
              <Route path="/study/:classId/:subjectId" element={<SubjectDetailPage />} />
              <Route path="/study/:classId/:subjectId/:chapterId" element={<ChapterDetailPage />} />
              <Route path="/materials" element={<MaterialsDirectoryPage />} />
              <Route path="/pdf/:materialId" element={<PdfViewerPage />} />
              <Route
                path="/downloads"
                element={
                  <ProtectedStudentRoute>
                    <DownloadsPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route path="/ebooks" element={<EbooksPage />} />
              <Route
                path="/purchases"
                element={
                  <ProtectedStudentRoute>
                    <PurchasesPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route
                path="/checkout/:packageId"
                element={
                  <ProtectedStudentRoute>
                    <CheckoutPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route path="/tests" element={<TestsListPage />} />
              <Route
                path="/tests/:testId"
                element={
                  <ProtectedStudentRoute>
                    <TestExamPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route
                path="/results/:attemptId"
                element={
                  <ProtectedStudentRoute>
                    <TestResultPage />
                  </ProtectedStudentRoute>
                }
              />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedStudentRoute>
                    <ProfilePage />
                  </ProtectedStudentRoute>
                }
              />

              {/* Administrator Routes (Protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedAdminRoute>
                    <AdminStudentsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/purchases"
                element={
                  <ProtectedAdminRoute>
                    <AdminPurchasesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/payment-settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminPaymentSettingsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <ProtectedAdminRoute>
                    <AdminBannersPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedAdminRoute>
                    <AdminAnnouncementsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedAdminRoute>
                    <AdminCurriculumPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedAdminRoute>
                    <AdminCurriculumPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/chapters"
                element={
                  <ProtectedAdminRoute>
                    <AdminCurriculumPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedAdminRoute>
                    <AdminCurriculumPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/materials"
                element={
                  <ProtectedAdminRoute>
                    <AdminMaterialsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/ebooks"
                element={
                  <ProtectedAdminRoute>
                    <AdminEbooksPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/tests"
                element={
                  <ProtectedAdminRoute>
                    <AdminTestsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminSettingsPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import StudentSidebar from './components/common/StudentSidebar';
import RecruiterSidebar from './components/recruiter/RecruiterSidebar';
import AdminSidebar from './components/admin/AdminSidebar';
import MobileBottomNav from './components/common/MobileBottomNav';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import InternshipList from './pages/student/InternshipList';
import InternshipDetail from './pages/student/InternshipDetail';
import StudentProfile from './pages/student/StudentProfile';
import ApplicationTracker from './pages/student/ApplicationTracker';
import SavedPage from './pages/student/SavedPage';
import './App.css';

const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const ExternalJobDetailPage = lazy(() => import('./pages/jobs/ExternalJobDetailPage'));
const CompaniesPage = lazy(() => import('./pages/companies/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/companies/CompanyDetailPage'));
const ResourcesPage = lazy(() => import('./pages/resources/ResourcesPage'));
const StudentsPage = lazy(() => import('./pages/students/StudentsPage'));

const StudentInterviewsPage = lazy(() => import('./pages/student/StudentInterviewsPage'));
const StudentMessagesPage = lazy(() => import('./pages/student/StudentMessagesPage'));
const StudentNotificationsPage = lazy(() => import('./pages/student/StudentNotificationsPage'));

const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const MyInternships = lazy(() => import('./pages/recruiter/MyInternships'));
const PostInternship = lazy(() => import('./pages/recruiter/PostInternship'));
const EditInternship = lazy(() => import('./pages/recruiter/EditInternship'));
const ApplicantsPage = lazy(() => import('./pages/recruiter/ApplicantsPage'));
const ShortlistedPage = lazy(() => import('./pages/recruiter/ShortlistedPage'));
const CandidateProfile = lazy(() => import('./pages/recruiter/CandidateProfile'));
const RecruiterInterviews = lazy(() => import('./pages/recruiter/InterviewsPage'));
const RecruiterMessages = lazy(() => import('./pages/recruiter/MessagesPage'));
const RecruiterNotifications = lazy(() => import('./pages/recruiter/NotificationsPage'));
const RecruiterAnalytics = lazy(() => import('./pages/recruiter/AnalyticsPage'));
const RecruiterActive = lazy(() => import('./pages/recruiter/ActivePage'));
const RecruiterCompany = lazy(() => import('./pages/recruiter/CompanyProfile'));
const RecruiterCompanyDashboard = lazy(() => import('./pages/recruiter/CompanyDashboard'));
const RecruiterSettings = lazy(() => import('./pages/recruiter/SettingsPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'));
const AdminInternships = lazy(() => import('./pages/admin/AdminInternships'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminIngestion = lazy(() => import('./pages/admin/AdminIngestion'));

const LoadingFallback = () => (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#667085' }}>Loading...</div>
);

const PublicLayout = () => (
    <>
        <Navbar />
        <main id="main" role="main">
            <Outlet />
        </main>
    </>
);

const StudentLayout = () => (
    <>
        <Navbar />
        <div className="app-shell">
            <StudentSidebar />
            <div className="app-shell-main">
                <Outlet />
            </div>
        </div>
        <MobileBottomNav />
    </>
);

const RecruiterLayout = () => (
    <>
        <Navbar />
        <div className="app-shell">
            <RecruiterSidebar />
            <div className="app-shell-main">
                <Outlet />
            </div>
        </div>
    </>
);

const AdminLayout = () => (
    <>
        <Navbar />
        <div className="app-shell">
            <AdminSidebar />
            <div className="app-shell-main">
                <Outlet />
            </div>
        </div>
    </>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/signup" element={<Navigate to="/register" replace />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/internships" element={<InternshipList />} />
                            <Route path="/internships/:id" element={<InternshipDetail />} />
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/jobs/:id" element={<JobDetailPage />} />
                            <Route path="/external-jobs/:id" element={<ExternalJobDetailPage />} />
                            <Route path="/companies" element={<CompaniesPage />} />
                            <Route path="/companies/:id" element={<CompanyDetailPage />} />
                            <Route path="/resources" element={<ResourcesPage />} />
                            <Route path="/students" element={<StudentsPage />} />
                        </Route>

                        <Route element={<ProtectedRoute />}>
                            <Route element={<StudentLayout />}>
                                <Route path="/student/dashboard" element={<StudentDashboard />} />
                                <Route path="/student/profile" element={<StudentProfile />} />
                                <Route path="/student/saved" element={<SavedPage />} />
                                <Route path="/student/applications" element={<ApplicationTracker />} />
                                <Route path="/student/search" element={<InternshipList />} />
                                <Route path="/student/interviews" element={<StudentInterviewsPage />} />
                                <Route path="/student/messages" element={<StudentMessagesPage />} />
                                <Route path="/student/notifications" element={<StudentNotificationsPage />} />
                                <Route path="/student/settings" element={<Navigate to="/student/profile" replace />} />
                            </Route>

                            <Route element={<RecruiterLayout />}>
                                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                                <Route path="/recruiter/internships" element={<MyInternships />} />
                                <Route path="/recruiter/internships/new" element={<PostInternship />} />
                                <Route path="/recruiter/internships/:id" element={<EditInternship />} />
                                <Route path="/recruiter/post-internship" element={<PostInternship />} />
                                <Route path="/recruiter/applicants" element={<ApplicantsPage />} />
                                <Route path="/recruiter/applications" element={<ApplicantsPage />} />
                                <Route path="/recruiter/shortlisted" element={<ShortlistedPage />} />
                                <Route path="/recruiter/candidates/:id" element={<CandidateProfile />} />
                                <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
                                <Route path="/recruiter/messages" element={<RecruiterMessages />} />
                                <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
                                <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
                                <Route path="/recruiter/active" element={<RecruiterActive />} />
                                <Route path="/recruiter/company" element={<RecruiterCompany />} />
                                <Route path="/recruiter/company-dashboard" element={<RecruiterCompanyDashboard />} />
                                <Route path="/recruiter/settings" element={<RecruiterSettings />} />
                            </Route>

                            <Route element={<AdminLayout />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/overview" element={<AdminOverview />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/companies" element={<AdminCompanies />} />
                                <Route path="/admin/internships" element={<AdminInternships />} />
                                <Route path="/admin/applications" element={<AdminApplications />} />
                                <Route path="/admin/reports" element={<AdminReports />} />
                                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                                <Route path="/admin/ingestion" element={<AdminIngestion />} />
                            </Route>
                        </Route>

                        {/* Legacy flat-path redirects */}
                        <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
                        <Route path="/profile" element={<Navigate to="/student/profile" replace />} />
                        <Route path="/applications" element={<Navigate to="/student/applications" replace />} />
                        <Route path="/saved" element={<Navigate to="/student/saved" replace />} />
                        <Route path="/interviews" element={<Navigate to="/student/interviews" replace />} />
                        <Route path="/messages" element={<Navigate to="/student/messages" replace />} />
                        <Route path="/notifications" element={<Navigate to="/student/notifications" replace />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;

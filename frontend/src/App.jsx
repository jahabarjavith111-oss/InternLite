import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import InternshipList from './pages/student/InternshipList';
import InternshipDetail from './pages/student/InternshipDetail';
import StudentProfile from './pages/student/StudentProfile';
import ApplicationTracker from './pages/student/ApplicationTracker';
import './App.css';

const Layout = () => (
    <>
        <Navbar />
        <Outlet />
    </>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route element={<Layout />}>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="internships" element={<InternshipList />} />
                            <Route path="internships/:id" element={<InternshipDetail />} />
                            <Route path="profile" element={<StudentProfile />} />
                            <Route path="applications" element={<ApplicationTracker />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

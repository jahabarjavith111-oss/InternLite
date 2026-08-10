import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import InternshipList from './pages/student/InternshipList';
import ApplicationTracker from './pages/student/ApplicationTracker';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="internships" element={<InternshipList />} />
                        <Route path="applications" element={<ApplicationTracker />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

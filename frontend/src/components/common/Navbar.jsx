import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    if (isAuthPage) return null;

    const homeForRole = user?.role === 'RECRUITER' ? '/recruiter/dashboard' : user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
    const notifPath = user?.role === 'RECRUITER' ? '/recruiter/notifications' : '/student/notifications';

    return (
        <header className="site-header" role="banner">
            <button
                type="button"
                className="skip-link"
                onClick={() => document.getElementById('main')?.scrollIntoView()}>
                Skip to main content
            </button>
            <div className="container header-inner">
                <button
                    type="button"
                    className="mobile-menu-btn"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
                <Link to="/" className="site-brand" aria-label="InternLite home">
                    <Logo size="md" />
                </Link>

                <nav className="site-nav" aria-label="Main navigation">
                    <ul className="nav-links" role="list">
                        <li>
                            <NavLink to="/internships" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                Internships
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/jobs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                Jobs
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/companies" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                Companies
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/resources" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                Resources
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions" role="group" aria-label="Account actions">
                    {user ? (
                        <>
                            <Link to={notifPath} className="btn btn-ghost btn-sm btn-icon" aria-label="Notifications">
                                <Bell size={18} />
                            </Link>
                            <div className="dropdown">
                                <button
                                    type="button"
                                    className="user-menu"
                                    onClick={() => setUserOpen((v) => !v)}
                                    aria-haspopup="menu"
                                    aria-expanded={userOpen}
                                >
                                    <span className="user-avatar" aria-hidden="true">
                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                    <span className="user-name">{user.name?.split(' ')[0] || 'Account'}</span>
                                    <span aria-hidden="true" style={{ fontSize: '0.7rem' }}>
                                        ▾
                                    </span>
                                </button>
                                {userOpen && (
                                    <div className="dropdown-menu" role="menu">
                                        <Link to={homeForRole} className="dropdown-item" role="menuitem" onClick={() => setUserOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <Link to="/student/profile" className="dropdown-item" role="menuitem" onClick={() => setUserOpen(false)}>
                                            Profile
                                        </Link>
                                        <Link to="/student/applications" className="dropdown-item" role="menuitem" onClick={() => setUserOpen(false)}>
                                            Applications
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <button type="button" onClick={handleLogout} className="dropdown-item" role="menuitem">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="header-actions">
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                Log in
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            {menuOpen && (
                <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
                    <Link to="/internships" onClick={() => setMenuOpen(false)}>
                        Internships
                    </Link>
                    <Link to="/jobs" onClick={() => setMenuOpen(false)}>
                        Jobs
                    </Link>
                    <Link to="/companies" onClick={() => setMenuOpen(false)}>
                        Companies
                    </Link>
                    <Link to="/resources" onClick={() => setMenuOpen(false)}>
                        Resources
                    </Link>
                    {user && (
                        <Link to={homeForRole} onClick={() => setMenuOpen(false)}>
                            Dashboard
                        </Link>
                    )}
                </nav>
            )}
        </header>
    );
};

export default Navbar;

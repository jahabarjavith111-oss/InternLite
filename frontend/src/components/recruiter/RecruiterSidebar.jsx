import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../api/recruiterAPI';
import { Icon } from '../common/Icon';
import Logo from '../common/Logo';

const RecruiterSidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [company, setCompany] = useState(null);

    useEffect(() => {
        recruiterAPI.getMyCompany().then(r => setCompany(r.data)).catch(() => {});
    }, []);

    const navItems = [
      { path: '/recruiter/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/recruiter/internships', label: 'Internships', icon: 'internships' },
      { path: '/recruiter/applicants', label: 'Applicants', icon: 'users' },
      { path: '/recruiter/shortlisted', label: 'Shortlisted', icon: 'shortlisted' },
      { path: '/recruiter/interviews', label: 'Interviews', icon: 'interviews' },
      { path: '/recruiter/messages', label: 'Messages', icon: 'messages' },
      { path: '/recruiter/analytics', label: 'Analytics', icon: 'analytics' },
      { path: '/recruiter/active', label: 'Active', icon: 'active' },
      { path: '/recruiter/company', label: 'Company', icon: 'company' },
      { path: '/recruiter/post-internship', label: 'Post Internship', icon: 'post' },
      { path: '/recruiter/notifications', label: 'Notifications', icon: 'notifications' },
      { path: '/recruiter/settings', label: 'Settings', icon: 'settings' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className={`recruiter-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Link to="/recruiter/dashboard" className="sidebar-logo" style={{display: 'inline-flex'}}><Logo size={collapsed ? 'sm' : 'sm'} withText={!collapsed} /></Link>
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="sidebar-icon"><Icon name={item.icon} size={16} /></span>
                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{(user?.name || 'R').charAt(0).toUpperCase()}</div>
                    {!collapsed && (
                        <div className="sidebar-profile-info">
                            <div className="sidebar-profile-name">{user?.name || 'Recruiter'}</div>
                            <div className="sidebar-profile-company">{company?.companyName || '—'}</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default RecruiterSidebar;

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { Icon } from './Icon';

const LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/internships', label: 'Find Internships', icon: 'search' },
    { to: '/jobs', label: 'Jobs', icon: 'jobs' },
    { to: '/companies', label: 'Companies', icon: 'companies' },
    { to: '/saved', label: 'Saved', icon: 'saved' },
    { to: '/applications', label: 'Applications', icon: 'applications' },
    { to: '/interviews', label: 'Interviews', icon: 'interviews' },
    { to: '/messages', label: 'Messages', icon: 'messages' },
    { to: '/notifications', label: 'Notifications', icon: 'notifications' },
];

const StudentSidebar = () => {
    const { user } = useAuth();
    return (
        <aside className="student-sidebar">
            <div className="brand" style={{padding: '0 0.75rem 1.25rem'}}><Logo size="sm" /></div>
            <nav>
                {LINKS.map(l => (
                    <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
                        <span className="ico"><Icon name={l.icon} size={16} /></span>{l.label}
                    </NavLink>
                ))}
            </nav>
            <div className="side-divider" />
            <NavLink to="/profile" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
                <span className="ico"><Icon name="profile" size={16} /></span>My Profile
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
                <span className="ico"><Icon name="resources" size={16} /></span>Resources
            </NavLink>
            <div className="side-divider" />
            <div className="side-profile">
                <span className="side-avatar">{(user?.name || 'S').charAt(0).toUpperCase()}</span>
                <div>
                    <div style={{fontWeight: 700, fontSize: '0.85rem'}}>{user?.name}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>{user?.role}</div>
                </div>
            </div>
        </aside>
    );
};

export default StudentSidebar;

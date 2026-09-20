import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icon';
import Logo from '../common/Logo';

const AdminSidebar = () => {
    const { user } = useAuth();
    const items = [
        { to: '/admin/overview', label: 'Overview', icon: 'overview' },
        { to: '/admin/users', label: 'Users', icon: 'users' },
        { to: '/admin/companies', label: 'Companies', icon: 'companies' },
        { to: '/admin/internships', label: 'Internships', icon: 'internships' },
        { to: '/admin/applications', label: 'Applications', icon: 'applications' },
        { to: '/admin/reports', label: 'Reports', icon: 'reports' },
        { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'audit' },
        { to: '/admin/ingestion', label: 'Ingestion', icon: 'active' },
    ];
    return (
        <aside className="student-sidebar" style={{top: '57px', height: 'calc(100vh - 57px)'}}>
            <div style={{padding: '0 0.75rem 1.1rem'}}><Logo size="sm" /></div>
            <nav>
                {items.map(l => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
                        <span className="ico"><Icon name={l.icon} size={16} /></span>{l.label}
                    </NavLink>
                ))}
            </nav>
            <div className="side-divider" />
            <div className="side-profile">
                <span className="side-avatar">{(user?.name || 'A').charAt(0).toUpperCase()}</span>
                <div>
                    <div style={{fontWeight: 700, fontSize: '0.85rem'}}>{user?.name}</div>
                    <div className="text-muted" style={{fontSize: '0.75rem'}}>ADMIN</div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;

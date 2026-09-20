import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import { Icon } from '../common/Icon';

const AdminTopbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="recruiter-topbar" style={{background: '#fff'}}>
            <Link to="/admin/overview" className="recruiter-topbar-brand" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}><Logo size="sm" /><span style={{fontWeight: 800, fontSize: '0.85rem', color: '#64748B', letterSpacing: '0.06em'}}>ADMIN</span></Link>
            <div className="recruiter-topbar-actions">
                <div className="topbar-company" ref={ref} onClick={() => setOpen(o => !o)}>
                    <span className="topbar-company-icon" style={{display: 'inline-flex'}}><Icon name="profile" size={16} /></span>
                    <span className="topbar-company-name">{user?.name || 'Admin'}</span>
                    <span className="topbar-caret">▼</span>
                    {open && (
                        <div className="topbar-dropdown">
                            <div className="topbar-dropdown-item" style={{cursor: 'default', fontWeight: 600}}>{user?.email}</div>
                            <button className="topbar-dropdown-item topbar-dropdown-danger" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../api/recruiterAPI';
import { notificationAPI } from '../../api/notificationAPI';
import { Icon } from '../common/Icon';
import Logo from '../common/Logo';

const RecruiterTopbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        recruiterAPI.getMyCompany().then(r => setCompany(r.data)).catch(() => {});
        if (user?.userId) {
            notificationAPI.getUnreadCount(user.userId).then(r => setUnread(Number(r.data) || 0)).catch(() => {});
        }
    }, [user?.userId]);

    useEffect(() => {
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="recruiter-topbar">
            <Link to="/recruiter/dashboard" className="recruiter-topbar-brand" style={{display: 'inline-flex'}}><Logo size="sm" /></Link>
            <div className="recruiter-topbar-actions">
                <Link to="/recruiter/notifications" className="topbar-icon" title="Notifications" style={{display: 'inline-flex', position: 'relative'}}>
                    <Icon name="notifications" size={20} />{unread > 0 && <span className="topbar-badge">{unread > 9 ? '9+' : unread}</span>}
                </Link>
                <Link to="/recruiter/messages" className="topbar-icon" title="Messages" style={{display: 'inline-flex'}}><Icon name="messages" size={20} /></Link>
                <div className="topbar-company" ref={ref} onClick={() => setOpen(o => !o)}>
                    <Icon name="company" size={16} />
                    <span className="topbar-company-name">{company?.companyName || 'Company'}</span>
                    <span className="topbar-caret">▼</span>
                    {open && (
                        <div className="topbar-dropdown">
                            <Link to="/recruiter/company" className="topbar-dropdown-item" onClick={() => setOpen(false)}>Company Profile</Link>
                            <Link to="/recruiter/settings" className="topbar-dropdown-item" onClick={() => setOpen(false)}>Settings</Link>
                            <button className="topbar-dropdown-item topbar-dropdown-danger" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default RecruiterTopbar;

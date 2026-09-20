import { useState, useEffect } from 'react';
import { notificationAPI } from '../../api/notificationAPI';
import { Icon } from '../../components/common/Icon';

const StudentNotificationsPage = () => {
    const [notifs, setNotifs] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await notificationAPI.getMyNotifications();
            const data = Array.isArray(res.data) ? res.data : [];
            setNotifs(data.map(n => ({ id: n.notificationId, message: n.message, time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '', read: n.read, type: (n.type || 'SYSTEM').toLowerCase(), raw: n })));
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const markOne = async (n) => {
        if (n.read) return;
        try { await notificationAPI.markNotificationRead(n.raw.notificationId); } catch { /* ignore */ }
        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    };

    const markAll = async () => {
        for (const n of notifs.filter(x => !x.read)) {
            try { await notificationAPI.markNotificationRead(n.raw.notificationId); } catch { /* ignore */ }
        }
        setNotifs(prev => prev.map(x => ({ ...x, read: true })));
    };

    const filtered = notifs.filter(n => filter === 'ALL' || (filter === 'UNREAD' ? !n.read : n.read));

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Notifications</h1>
                <p>Application updates, interviews and alerts.</p>
            </div>
            <div className="card" style={{marginBottom: '1.5rem'}}>
                <div className="d-flex" style={{justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'}}>
                    <div className="d-flex" style={{gap: '0.5rem'}}>
                        {['ALL', 'UNREAD', 'READ'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{f}</button>
                        ))}
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={markAll}>Mark all as read</button>
                </div>
            </div>
            {loading ? <div className="loading-spinner">Loading notifications...</div> : filtered.length === 0 ? (
                <div className="empty-state"><span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span><h3>No notifications</h3><p>You&apos;re all caught up!</p></div>
            ) : (
                <div className="notification-list">
                    {filtered.map(n => (
                        <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`} onClick={() => markOne(n)} style={{cursor: 'pointer'}}>
                            <div className="notification-content">
                                <p className="notification-message">{n.message}</p>
                                <span className="text-muted" style={{fontSize: '0.85rem'}}>{n.time}</span>
                            </div>
                            {!n.read && <span className="notification-dot"></span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentNotificationsPage;

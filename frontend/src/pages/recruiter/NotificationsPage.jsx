import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { notificationAPI } from '../../api/notificationAPI';
import { Icon } from '../../components/common/Icon';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        setLoading(true);
        notificationAPI.getMyNotifications().then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setNotifications(data.map(n => ({
                    id: n.notificationId, message: n.message,
                    time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
                    read: n.read, type: (n.type || 'SYSTEM').toLowerCase(), _raw: n
                })));
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const filtered = notifications.filter(n => filter === 'ALL' || (filter === 'UNREAD' ? !n.read : n.read));

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.read && n._raw);
        for (const n of unread) { try { await notificationAPI.markNotificationRead(n._raw.notificationId); } catch { /* ignore */ } }
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markOneRead = async (n) => {
        if (n._raw) { try { await notificationAPI.markNotificationRead(n._raw.notificationId); } catch { /* ignore */ } }
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    };

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Notifications"
                    subtitle="Stay updated with your recruitment activities."
                />

                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="d-flex" style={{justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'}}>
                            <div className="d-flex" style={{gap: '0.5rem'}}>
                                {['ALL', 'UNREAD', 'READ'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{f}</button>
                                ))}
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {loading ? <div className="loading-spinner">Loading notifications...</div> : filtered.length === 0 ? <p className="text-muted">No notifications.</p> : filtered.map(notification => (
                            <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`} onClick={() => markOneRead(notification)} style={{cursor: 'pointer'}}>
                                <div className="notification-icon" style={{display: 'inline-flex'}}>
                                    {notification.type === 'application' && <Icon name="applications" size={16} />}
                                    {notification.type === 'message' && <Icon name="messages" size={16} />}
                                    {notification.type === 'interview' && <Icon name="interviews" size={16} />}
                                    {notification.type === 'deadline' && <Icon name="duration" size={16} />}
                                    {notification.type === 'report' && <Icon name="analytics" size={16} />}
                                    {!['application','message','interview','deadline','report'].includes(notification.type) && <Icon name="notifications" size={16} />}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="text-muted" style={{fontSize: '0.85rem'}}>{notification.time}</span>
                                </div>
                                {!notification.read && <span className="notification-dot"></span>}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;

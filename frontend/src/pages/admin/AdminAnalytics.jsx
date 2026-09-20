import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    useEffect(() => {
        Promise.allSettled([adminAPI.getAdminStats(), adminAPI.getAllUsers(), adminAPI.getAllApplicationsAdmin()]).then(([s, u, a]) => {
            if (s.status === 'fulfilled') setStats(s.value.data);
            if (u.status === 'fulfilled' && Array.isArray(u.value.data)) setUsers(u.value.data);
            if (a.status === 'fulfilled' && Array.isArray(a.value.data)) setApplications(a.value.data);
        });
    }, []);
    const byStatus = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].map(s => ({ label: s, count: applications.filter(a => a.status === s).length }));
    const max = Math.max(1, ...byStatus.map(r => r.count));
    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Analytics</h1><p className="text-secondary">Platform-wide analytics.</p></div>
            <div className="stats-grid" style={{marginBottom: '2rem'}}>
                <div className="stat-card"><div className="num">{stats?.totalUsers ?? users.length}</div><div className="label">Users</div></div>
                <div className="stat-card"><div className="num">{stats?.totalApplications ?? applications.length}</div><div className="label">Applications</div></div>
                <div className="stat-card"><div className="num">{stats?.totalInternships ?? '—'}</div><div className="label">Internships</div></div>
            </div>
            <div className="card">
                <h3 style={{marginBottom: '1rem'}}>Applications by Status</h3>
                {byStatus.map(r => (
                    <div key={r.label} className="activity-bar">
                        <span className="lbl">{r.label} ({r.count})</span>
                        <div className="track"><div className="fill" style={{width: `${(r.count / max) * 100}%`}}></div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminAnalytics;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/adminAPI';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString();

const AdminOverview = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [internships, setInternships] = useState([]);
    const [applications, setApplications] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [s, u, i, a, l] = await Promise.allSettled([
                    adminAPI.getAdminStats(), adminAPI.getAllUsers(),
                    adminAPI.getAllInternshipsAdmin(), adminAPI.getAllApplicationsAdmin(), adminAPI.getAuditLogs(),
                ]);
                if (s.status === 'fulfilled') setStats(s.value.data);
                if (u.status === 'fulfilled' && Array.isArray(u.value.data)) setUsers(u.value.data);
                if (i.status === 'fulfilled' && Array.isArray(i.value.data)) setInternships(i.value.data);
                if (a.status === 'fulfilled' && Array.isArray(a.value.data)) setApplications(a.value.data);
                if (l.status === 'fulfilled' && Array.isArray(l.value.data)) setLogs(l.value.data);
            } finally { setLoading(false); }
        })();
    }, []);

    const students = users.filter(u => u.role === 'STUDENT');
    const recruiters = users.filter(u => u.role === 'RECRUITER');

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading admin...</div></div>;

    const topRow = [
        { label: 'Students', value: stats?.totalStudents ?? students.length },
        { label: 'Recruiters', value: stats?.totalRecruiters ?? recruiters.length },
        { label: 'Companies', value: stats?.totalCompanies ?? '—' },
    ];
    const secondRow = [
        { label: 'Internships', value: stats?.totalInternships ?? internships.length },
        { label: 'Applications', value: stats?.totalApplications ?? applications.length },
    ];

    const activity = [
        { label: 'User registrations', value: stats?.totalUsers ?? users.length },
        { label: 'Applications', value: stats?.totalApplications ?? applications.length },
        { label: 'New internships', value: stats?.totalInternships ?? internships.length },
        { label: 'Reports', value: logs.length },
    ];
    const max = Math.max(1, ...activity.map(r => Number(r.value) || 0));

    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header" style={{marginBottom: '1.5rem'}}>
                <h1>Platform Overview</h1>
                <p className="text-secondary">Live platform overview from backend.</p>
            </div>

            {/* Wireframe row 1: Students | Recruiters | Companies */}
            <div className="stats-grid" style={{marginBottom: '1.25rem', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'}}>
                {topRow.map(c => (
                    <div key={c.label} className="stat-card" style={{textAlign: 'center'}}>
                        <div className="label" style={{marginBottom: '0.35rem'}}>{c.label}</div>
                        <div className="num" style={{fontSize: '1.9rem'}}>{fmt(c.value)}</div>
                    </div>
                ))}
            </div>

            {/* Wireframe row 2: Internships | Applications */}
            <div className="stats-grid" style={{marginBottom: '1.75rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'}}>
                {secondRow.map(c => (
                    <div key={c.label} className="stat-card" style={{textAlign: 'center'}}>
                        <div className="label" style={{marginBottom: '0.35rem'}}>{c.label}</div>
                        <div className="num" style={{fontSize: '1.9rem'}}>{fmt(c.value)}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{marginBottom: '2rem'}}>
                <h3 style={{marginBottom: '1.25rem'}}>Platform Activity</h3>
                {activity.map(r => (
                    <div key={r.label} className="activity-bar">
                        <span className="lbl">{r.label} ({fmt(r.value)})</span>
                        <div className="track"><div className="fill" style={{width: `${((Number(r.value) || 0) / max) * 100}%`}}></div></div>
                    </div>
                ))}
            </div>

            <div style={{textAlign: 'center', padding: '1rem 0'}}>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </div>
        </div>
    );
};

export default AdminOverview;

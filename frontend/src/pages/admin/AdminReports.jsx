import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminReports = () => {
    const [stats, setStats] = useState(null);
    useEffect(() => { adminAPI.getAdminStats().then(r => setStats(r.data)).catch(() => {}); }, []);
    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Reports</h1><p className="text-secondary">High-level report snapshot.</p></div>
            <div className="stats-grid" style={{marginBottom: '2rem'}}>
                <div className="stat-card"><div className="num">{stats?.totalUsers ?? '—'}</div><div className="label">Users</div></div>
                <div className="stat-card"><div className="num">{stats?.totalInternships ?? '—'}</div><div className="label">Internships</div></div>
                <div className="stat-card"><div className="num">{stats?.totalApplications ?? '—'}</div><div className="label">Applications</div></div>
            </div>
            <div className="card"><p className="text-secondary">Detailed export / reporting can be added once report endpoints exist. Current data is live from admin stats.</p></div>
        </div>
    );
};

export default AdminReports;

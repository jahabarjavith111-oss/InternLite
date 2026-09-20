import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/adminAPI';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
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

    const changeRole = async (id, role) => {
        try { await adminAPI.updateUserRole(id, role); setUsers(prev => prev.map(u => u.userId === id ? { ...u, role } : u)); }
        catch { alert('Failed to update role'); }
    };
    const removeUser = async (id) => {
        if (!confirm('Delete user?')) return;
        try { await adminAPI.deleteUser(id); setUsers(prev => prev.filter(u => u.userId !== id)); }
        catch { alert('Failed to delete'); }
    };

    const students = users.filter(u => u.role === 'STUDENT');
    const recruiters = users.filter(u => u.role === 'RECRUITER');

    const tabs = [
      { id: 'overview', label: 'Overview' }, { id: 'students', label: 'Students' },
      { id: 'companies', label: 'Recruiters' }, { id: 'internships', label: 'Internships' },
      { id: 'applications', label: 'Applications' }, { id: 'reports', label: 'Audit Logs' },
    ];

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading admin...</div></div>;

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header"><h1>Admin Console</h1><p>Live platform overview from backend.</p></div>
            <div style={{marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{tab.label}</button>)}
            </div>
            {activeTab === 'overview' && (
                <>
                <div className="stats-grid" style={{marginBottom: '2rem'}}>
                    <div className="stat-card"><div className="num">{stats?.totalStudents ?? students.length}</div><div className="label">Students</div></div>
                    <div className="stat-card"><div className="num">{stats?.totalRecruiters ?? recruiters.length}</div><div className="label">Recruiters</div></div>
                    <div className="stat-card"><div className="num">{stats?.totalCompanies ?? '—'}</div><div className="label">Companies</div></div>
                    <div className="stat-card"><div className="num">{stats?.totalInternships ?? internships.length}</div><div className="label">Internships</div></div>
                    <div className="stat-card"><div className="num">{stats?.totalApplications ?? applications.length}</div><div className="label">Applications</div></div>
                    <div className="stat-card"><div className="num">{logs.length}</div><div className="label">Audit Logs</div></div>
                </div>
                <div className="card">
                    <h3 style={{marginBottom: '1.25rem'}}>Platform Activity</h3>
                    {(() => {
                        const rows = [
                            { label: 'Users Registered', value: stats?.totalUsers ?? users.length },
                            { label: 'Applications', value: stats?.totalApplications ?? applications.length },
                            { label: 'Internships Posted', value: stats?.totalInternships ?? internships.length },
                            { label: 'Companies', value: stats?.totalCompanies ?? 0 },
                        ];
                        const max = Math.max(1, ...rows.map(r => Number(r.value) || 0));
                        return rows.map(r => (
                            <div key={r.label} className="activity-bar">
                                <span className="lbl">{r.label} ({r.value})</span>
                                <div className="track"><div className="fill" style={{width: `${((Number(r.value) || 0) / max) * 100}%`}}></div></div>
                            </div>
                        ));
                    })()}
                </div>
                </>
            )}
            {activeTab === 'students' && (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>{students.map(s => <tr key={s.userId}><td><strong>{s.name}</strong></td><td>{s.email}</td><td><span className="badge badge-primary">{s.role}</span></td><td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</td><td><div style={{display: 'flex', gap: '0.4rem'}}><button className="btn btn-outline btn-sm" onClick={() => changeRole(s.userId, 'RECRUITER')}>Make Recruiter</button><button className="btn btn-danger btn-sm" onClick={() => removeUser(s.userId)}>Delete</button></div></td></tr>)}</tbody></table></div>
            )}
            {activeTab === 'companies' && (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>{recruiters.map(c => <tr key={c.userId}><td><strong>{c.name}</strong></td><td>{c.email}</td><td><span className="badge badge-success">{c.role}</span></td><td><div style={{display: 'flex', gap: '0.4rem'}}><button className="btn btn-outline btn-sm" onClick={() => changeRole(c.userId, 'STUDENT')}>Make Student</button><button className="btn btn-outline btn-sm" onClick={() => changeRole(c.userId, 'ADMIN')}>Make Admin</button><button className="btn btn-danger btn-sm" onClick={() => removeUser(c.userId)}>Delete</button></div></td></tr>)}</tbody></table></div>
            )}
            {activeTab === 'internships' && (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Location</th></tr></thead>
                <tbody>{internships.map(i => <tr key={i.internshipId}><td><strong>{i.title}</strong></td><td>{i.company?.companyName}</td><td><span className="badge badge-info">{i.status}</span></td><td>{i.location}</td></tr>)}</tbody></table></div>
            )}
            {activeTab === 'applications' && (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>ID</th><th>Internship</th><th>Student</th><th>Status</th><th>Applied</th></tr></thead>
                <tbody>{applications.map(a => <tr key={a.applicationId}><td>{a.applicationId}</td><td>{a.internship?.title}</td><td>{a.student?.user?.name}</td><td><span className={`badge status-${a.status}`}>{a.status}</span></td><td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : ''}</td></tr>)}</tbody></table></div>
            )}
            {activeTab === 'reports' && (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>ID</th><th>Action</th><th>Entity</th><th>Details</th><th>At</th></tr></thead>
                <tbody>{logs.slice(0, 100).map(l => <tr key={l.logId}><td>{l.logId}</td><td>{l.action}</td><td>{l.entityType}</td><td>{l.details}</td><td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td></tr>)}</tbody></table></div>
            )}
            <div style={{textAlign: 'center', padding: '2rem 0'}}><button onClick={logout} className="btn btn-danger">Logout</button></div>
        </div>
    );
};

export default AdminDashboard;

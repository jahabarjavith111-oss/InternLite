import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { adminAPI.getAllApplicationsAdmin().then(r => setApplications(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false)); }, []);
    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Applications</h1><p className="text-secondary">Every application on the platform.</p></div>
            {loading ? <div className="loading-spinner">Loading applications...</div> : (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>ID</th><th>Internship</th><th>Student</th><th>Status</th><th>Applied</th></tr></thead>
                <tbody>{applications.map(a => <tr key={a.applicationId}><td>{a.applicationId}</td><td>{a.internship?.title || '—'}</td><td>{a.student?.user?.name || '—'}</td><td><span className={`badge status-${a.status}`}>{a.status}</span></td><td>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : ''}</td></tr>)}</tbody></table></div>
            )}
        </div>
    );
};

export default AdminApplications;

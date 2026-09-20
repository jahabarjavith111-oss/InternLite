import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { adminAPI.getAllInternshipsAdmin().then(r => setInternships(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false)); }, []);
    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Internships</h1><p className="text-secondary">All internships posted on the platform.</p></div>
            {loading ? <div className="loading-spinner">Loading internships...</div> : (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Location</th></tr></thead>
                <tbody>{internships.map(i => <tr key={i.internshipId}><td><strong>{i.title}</strong></td><td>{i.company?.companyName || '—'}</td><td><span className="badge badge-info">{i.status}</span></td><td>{i.location || '—'}</td></tr>)}</tbody></table></div>
            )}
        </div>
    );
};

export default AdminInternships;

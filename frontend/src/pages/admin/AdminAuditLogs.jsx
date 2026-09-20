import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { adminAPI.getAuditLogs().then(r => setLogs(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false)); }, []);
    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Audit Logs</h1><p className="text-secondary">Immutable platform audit trail.</p></div>
            {loading ? <div className="loading-spinner">Loading logs...</div> : (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>ID</th><th>Action</th><th>Entity</th><th>Details</th><th>At</th></tr></thead>
                <tbody>{logs.slice(0, 200).map(l => <tr key={l.logId}><td>{l.logId}</td><td>{l.action}</td><td>{l.entityType || '—'}</td><td>{l.details || '—'}</td><td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td></tr>)}</tbody></table></div>
            )}
        </div>
    );
};

export default AdminAuditLogs;

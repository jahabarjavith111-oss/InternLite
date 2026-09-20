import { useState, useEffect } from 'react';
import { companyAPI } from '../../api/companyAPI';

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await companyAPI.getCompanies(q || undefined);
                setCompanies(Array.isArray(res.data) ? res.data : []);
            } finally { setLoading(false); }
        })();
    }, []);

    const search = async () => {
        setLoading(true);
        try {
            const res = await companyAPI.getCompanies(q || undefined);
            setCompanies(Array.isArray(res.data) ? res.data : []);
        } finally { setLoading(false); }
    };

    return (
        <div className="dashboard animate-fade-in" style={{padding: '1.5rem'}}>
            <div className="dashboard-header"><h1>Companies</h1><p className="text-secondary">All companies on the platform.</p></div>
            <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem'}}>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search companies..." className="form-control" style={{maxWidth: '360px'}} />
                <button className="btn btn-primary btn-sm" onClick={search}>Search</button>
            </div>
            {loading ? <div className="loading-spinner">Loading companies...</div> : companies.length === 0 ? <p className="text-muted">No companies found.</p> : (
                <div style={{overflowX: 'auto'}}><table className="data-table"><thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Website</th></tr></thead>
                <tbody>{companies.map(c => <tr key={c.companyId}><td><strong>{c.companyName}</strong></td><td>{c.industry || '—'}</td><td>{c.location || '—'}</td><td>{c.website ? <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer">{c.website}</a> : '—'}</td></tr>)}</tbody></table></div>
            )}
        </div>
    );
};

export default AdminCompanies;

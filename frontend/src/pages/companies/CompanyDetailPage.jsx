import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { companyAPI } from '../../api/companyAPI';

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        companyAPI.getCompanyById(id).then(r => setCompany(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading company...</div></div>;
    if (!company) return <div className="dashboard"><div className="empty-state"><h3>Company not found</h3><Link to="/companies" className="btn btn-primary">Back to Companies</Link></div></div>;

    const open = (company.internships || []).filter(i => i.status === 'OPEN');

    return (
        <div className="dashboard animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn-back">← Back to Companies</button>
            <div className="card" style={{marginBottom: '2rem', padding: '2rem'}}>
                <div className="card-header" style={{marginBottom: '1rem'}}>
                    <div>
                        <h1 style={{fontSize: '1.75rem'}}>{company.companyName}</h1>
                        <div className="company">{company.industry || '—'} • {company.location || '—'}</div>
                    </div>
                    <div className="company-logo" style={{width: '64px', height: '64px', fontSize: '1.5rem'}}>{company.companyName?.charAt(0)}</div>
                </div>
                <p className="text-secondary" style={{lineHeight: '1.8'}}>{company.description || 'No description yet.'}</p>
                {company.website && <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{marginTop: '1rem'}}>🌐 {company.website}</a>}
            </div>

            <h2 style={{fontSize: '1.4rem', marginBottom: '1rem'}}>Open Internships ({open.length})</h2>
            {open.length === 0 ? <p className="text-muted">No open internships right now.</p> : (
                <div className="grid grid-cols-1" style={{gap: '1rem'}}>
                    {open.map(i => (
                        <Link to={`/internships/${i.internshipId}`} key={i.internshipId} className="internship-card">
                            <div className="card-header"><div><h3>{i.title}</h3><div className="company">{i.location} • {i.workType}</div></div></div>
                            <div className="card-footer">
                                <span className="badge badge-muted">Deadline: {i.applicationDeadline || '—'}</span>
                                <span className="btn btn-primary btn-sm" style={{pointerEvents: 'none'}}>Apply</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompanyDetailPage;

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { companyAPI } from '../../api/companyAPI';
import InternshipCard from '../../components/internships/InternshipCard';
import { stipendRange } from '../../utils/format';

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        companyAPI
            .getCompanyById(id)
            .then((r) => setCompany(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    if (loading)
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <div className="loading-spinner">Loading company...</div>
            </div>
        );
    if (!company)
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <div className="card empty-state">
                    <h3>Company not found</h3>
                    <Link to="/companies" className="btn btn-primary">
                        Back to Companies
                    </Link>
                </div>
            </div>
        );

    const open = (company.internships || []).filter((i) => i.status === 'OPEN');

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
                ← Back to companies
            </button>
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div className="company-logo" style={{ width: 56, height: 56, fontSize: '1.4rem' }} aria-hidden="true">
                        {String(company.companyName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.6rem' }}>{company.companyName}</h1>
                        <div className="text-secondary">
                            {[company.industry, 'Software', 'SaaS'].filter(Boolean).slice(0, 3).join(' • ')} • {company.location || 'Chennai, India'}
                        </div>
                        <div className="caption" style={{ marginTop: '0.3rem' }}>
                            11–50 employees {company.website ? '• ✓ Verified' : ''}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' })}>
                        View Open Positions
                    </button>
                    {company.website && (
                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                            🌐 {company.website}
                        </a>
                    )}
                </div>
            </div>

            <div className="detail-layout">
                <div className="card" style={{ padding: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About</h2>
                    <p className="text-secondary" style={{ lineHeight: 1.75 }}>
                        {company.description || `${company.companyName} is hiring interns. Check open positions to find a role that matches your skills.`}
                    </p>
                </div>
                <aside className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Company</h2>
                    <div className="caption">Industry</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.6rem' }}>{company.industry || '—'}</div>
                    <div className="caption">Location</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.6rem' }}>{company.location || '—'}</div>
                    <div className="caption">Open roles</div>
                    <div style={{ fontWeight: 600 }}>{open.length} internships</div>
                </aside>
            </div>

            <h2 id="open-roles" style={{ fontSize: '1.3rem', margin: '1.75rem 0 1rem' }}>
                Open Positions {open.length > 0 && `(${open.length} internships)`}
            </h2>
            {open.length === 0 ? (
                <p className="text-muted">No open internships right now.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {open.slice(0, 8).map((i) =>
                        i.internshipId ? (
                            <InternshipCard key={i.internshipId} job={{ ...i, company }} />
                        ) : (
                            <Link to={`/internships/${i.internshipId}`} key={i.internshipId} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{i.title}</div>
                                    <div className="caption">
                                        {i.location} • {i.workType}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700 }}>{stipendRange(i)}</div>
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyDetailPage;

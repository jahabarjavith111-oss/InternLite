import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../api/companyAPI';
import { Icon } from '../../components/common/Icon';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async (name) => {
        setLoading(true);
        try {
            const res = await companyAPI.getCompanies(name || undefined);
            setCompanies(Array.isArray(res.data) ? res.data : []);
        } catch { setCompanies([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCompanies(''); }, []);

    const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];
    const filtered = companies.filter(c => !industry || c.industry === industry);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Companies</h1>
                <p>Discover top companies hiring interns and freshers.</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); fetchCompanies(search); }} className="search-bar" style={{marginBottom: '2rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search companies..." className="form-control" style={{flex: 2, minWidth: '180px'}} />
                <select value={industry} onChange={e=>setIndustry(e.target.value)} className="form-control" style={{flex: 1, minWidth: '160px'}}>
                    <option value="">All industries</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {loading ? <div className="loading-spinner">Loading companies...</div> : filtered.length === 0 ? (
                <div className="empty-state"><span className="empty-icon"><Icon name="companies" size={14} /></span><h3>No companies found</h3><p>Try a different search.</p></div>
            ) : (
                <div className="grid grid-cols-1" style={{gap: '1rem'}}>
                    {filtered.map(c => (
                        <Link to={`/companies/${c.companyId}`} key={c.companyId} className="internship-card">
                            <div className="card-header">
                                <div>
                                    <h3>{c.companyName}</h3>
                                    <div className="company">{c.industry || '—'} • {c.location || '—'}</div>
                                </div>
                                <div className="company-logo">{c.companyName?.charAt(0)}</div>
                            </div>
                            <p className="text-secondary" style={{margin: '0.75rem 0', lineHeight: '1.6'}}>{c.description?.slice(0, 160)}{c.description?.length > 160 ? '…' : ''}</p>
                            <div className="card-footer">
                                <span className="badge badge-muted">{c.internships?.length ?? ''} {c.internships ? 'openings listed' : ''} {c.website || ''}</span>
                                <span className="btn btn-outline btn-sm" style={{pointerEvents: 'none'}}>View Profile</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompaniesPage;

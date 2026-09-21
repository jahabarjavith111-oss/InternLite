import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../../api/companyAPI';
import { Icon } from '../../components/common/Icon';

const QUICK_FILTERS = ['AI', 'Fintech', 'SaaS', 'EdTech', 'HealthTech'];

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
        } catch {
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies('');
    }, []);

    const industries = useMemo(() => [...new Set(companies.map((c) => c.industry).filter(Boolean))], [companies]);
    const filtered = companies.filter((c) => {
        if (industry && c.industry !== industry) return false;
        if (search && !`${c.companyName || ''} ${c.description || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <div className="dashboard-header" style={{ textAlign: 'center' }}>
                <h1>Explore Companies</h1>
                <p>Discover startups and companies hiring interns right now.</p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    fetchCompanies(search);
                }}
                className="hero-search"
                style={{ maxWidth: 640, margin: '0 auto 1rem' }}
                role="search"
            >
                <div className="search-field">
                    <Icon name="search" size={16} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." aria-label="Search companies" />
                </div>
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button type="button" className={`skill-chip${industry === '' ? ' skill-highlight' : ''}`} onClick={() => setIndustry('')}>
                    All
                </button>
                {[...QUICK_FILTERS, ...industries.filter((i) => !QUICK_FILTERS.includes(i))].slice(0, 8).map((i) => (
                    <button key={i} type="button" className={`skill-chip${industry === i ? ' skill-highlight' : ''}`} onClick={() => setIndustry(industry === i ? '' : i)}>
                        {i}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner">Loading companies...</div>
            ) : filtered.length === 0 ? (
                <div className="card empty-state">
                    <span className="empty-icon">
                        <Icon name="companies" size={20} />
                    </span>
                    <h3>No companies found</h3>
                    <p className="text-secondary">Try a different search.</p>
                </div>
            ) : (
                <div className="grid-3">
                    {filtered.map((c) => (
                        <article key={c.companyId} className="card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div className="company-mark" aria-hidden="true">
                                {String(c.companyName || '?').charAt(0).toUpperCase()}
                            </div>
                            <h3 style={{ fontSize: '1.05rem' }}>
                                <Link to={`/companies/${c.companyId}`}>{c.companyName}</Link>
                            </h3>
                            <div className="text-secondary" style={{ fontSize: '0.88rem' }}>
                                {c.industry || 'Company'} • {c.location || 'India'}
                            </div>
                            <p className="text-secondary line-clamp-2" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                                {c.description || 'No description yet.'}
                            </p>
                            <div className="caption">
                                {(c.internships?.length ?? 0) > 0 ? `${c.internships.length} open roles` : 'View open roles'}
                                {c.website ? ' • ✓ Verified' : ''}
                            </div>
                            <Link to={`/companies/${c.companyId}`} className="btn btn-outline btn-sm" style={{ marginTop: '0.4rem' }}>
                                View Company
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompaniesPage;

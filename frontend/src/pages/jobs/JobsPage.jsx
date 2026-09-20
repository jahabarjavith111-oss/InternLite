import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../api/jobAPI';
import { categoryAPI } from '../../api/categoryAPI';
import { Icon } from '../../components/common/Icon';

const SOURCE_OPTIONS = [
    { value: 'all', label: 'All Sources' },
    { value: 'internal', label: 'InternLite' },
    { value: 'openintern', label: 'OpenIntern' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'lever', label: 'Lever' },
    { value: 'ashby', label: 'Ashby' },
    { value: 'workable', label: 'Workable' },
    { value: 'smartrecruiters', label: 'SmartRecruiters' },
    { value: 'recruitee', label: 'Recruitee' },
];

const formatWorkMode = (v) => {
    if (!v) return '—';
    const s = String(v).toLowerCase();
    if (s.includes('remote')) return 'Remote';
    if (s.includes('hybrid')) return 'Hybrid';
    if (s.includes('onsite') || s.includes('on-site')) return 'On-site';
    return v;
};

const formatPay = (min, max, currency) => {
    const cur = currency || '₹';
    const hasMin = min != null && String(min).trim() !== '';
    const hasMax = max != null && String(max).trim() !== '';
    if (!hasMin && !hasMax) return null;
    const fmt = (n) => {
        const num = Number(String(n).replace(/[^0-9.]/g, ''));
        if (isNaN(num) || !num) return String(n);
        if (/[₹$€]/.test(String(n))) return String(n);
        return `${cur}${num.toLocaleString('en-IN')}`;
    };
    if (hasMin && hasMax && String(min) !== String(max)) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(hasMin ? min : max);
};

const shortDesc = (t, n = 140) => {
    if (!t) return 'No description provided.';
    const s = String(t).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
};

const sourceBadge = (source) => {
    const map = {
        internal: { bg: '#EEF2FF', color: '#4F46E5', label: 'InternLite' },
        openintern: { bg: '#DEF7EC', color: '#03543F', label: 'OpenIntern' },
        greenhouse: { bg: '#EDE9FE', color: '#6D28D9', label: 'Greenhouse' },
        lever: { bg: '#FEF3C7', color: '#92400E', label: 'Lever' },
        ashby: { bg: '#E0F2FE', color: '#0C4A6E', label: 'Ashby' },
        workable: { bg: '#FCE7F3', color: '#9D174D', label: 'Workable' },
        smartrecruiters: { bg: '#DCFCE7', color: '#14532D', label: 'SmartRecruiters' },
        recruitee: { bg: '#FEF9C3', color: '#713F12', label: 'Recruitee' },
    };
    const s = map[source?.toLowerCase()] || { bg: '#F1F5F9', color: '#475569', label: source || 'External' };
    return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [workType, setWorkType] = useState('');
    const [source, setSource] = useState('all');
    const [isRemote, setIsRemote] = useState(false);
    const [unified, setUnified] = useState(true);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            if (unified) {
                const res = await jobAPI.getUnifiedJobs({
                    keyword: search || undefined,
                    location: location || undefined,
                    source: source !== 'all' ? source : undefined,
                    isRemote: isRemote || undefined,
                    page: 0,
                    size: 5000,
                });
                const data = res.data;
                const list = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
                setJobs(list);
                setTotal(data.totalElements ?? list.length);
                setPage(0);
            } else {
                const res = await jobAPI.getJobs({
                    keyword: search || undefined,
                    location: location || undefined,
                    category: category || undefined,
                    workType: workType || undefined,
                });
                setJobs(Array.isArray(res.data) ? res.data.map(j => ({
                    id: 'int-' + j.jobId,
                    source: 'internal',
                    isExternal: false,
                    title: j.title,
                    companyName: j.company?.companyName || 'Company',
                    location: j.location,
                    workplaceType: j.workType ? j.workType.toLowerCase() : '',
                    isRemote: j.workType === 'REMOTE',
                    employmentType: j.employmentType,
                    stipendMin: j.salary,
                    description: j.description,
                    tags: j.requiredSkills,
                    departments: j.category?.categoryName || '',
                    applyUrl: `/jobs/${j.jobId}`,
                    postedAt: j.createdAt,
                })) : []);
                setTotal(Array.isArray(res.data) ? res.data.length : 0);
            }
        } catch (e) {
            console.error(e);
            setJobs([]);
        } finally { setLoading(false); }
    }, [search, location, category, workType, source, isRemote, unified]);

    useEffect(() => {
        categoryAPI.getCategories().then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleSearch = (e) => { e.preventDefault(); fetchJobs(); };

    // Client-side filtering for category/workType when unified (ensures filters work across all 5000)
    const filtered = unified ? jobs.filter(j => {
        if (category) {
            const cat = category.toLowerCase();
            const hay = `${j.departments || ''} ${j.tags || ''} ${j.title || ''}`.toLowerCase();
            if (!hay.includes(cat)) return false;
        }
        if (workType) {
            const wt = (j.workplaceType || j.workType || '').toUpperCase();
            if (wt !== workType) return false;
        }
        return true;
    }) : jobs;

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
    const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1>Find Jobs</h1>
                        <p>Full-time and early-career openings — InternLite + live external feeds (real-time).</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
                        <input type="checkbox" checked={unified} onChange={e => setUnified(e.target.checked)} />
                        Live external feed
                    </label>
                </div>
            </div>

            <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '1.2rem', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Title, skill or keyword" className="form-control" style={{ flex: 2, minWidth: '180px' }} />
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="form-control" style={{ flex: 1, minWidth: '140px' }} />
                <select value={source} onChange={e => { setSource(e.target.value); setPage(0); }} className="form-control" style={{ flex: 1, minWidth: '140px' }}>
                    {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={isRemote} onChange={e => { setIsRemote(e.target.checked); setPage(0); }} /> Remote only
                </label>
                <select value={category} onChange={e=> { setCategory(e.target.value); setPage(0); }} className="form-control" style={{ flex: 1, minWidth: '140px' }}>
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryName}>{c.categoryName}</option>)}
                </select>
                <select value={workType} onChange={e=> { setWorkType(e.target.value); setPage(0); }} className="form-control" style={{ minWidth: '130px' }}>
                    <option value="">Any work type</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                </select>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{totalFiltered} results • {unified ? 'Unified (internal + external)' : 'Internal only'} {unified && category && `• ${category}`} {workType && `• ${workType}`}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Category & work type filters work live — try them!</span>
            </div>

            {loading ? <div className="loading-spinner">Loading jobs...</div> : paginated.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                    <h3>No jobs found</h3>
                    <p>Try a different category, work type or keyword. External feeds update every few hours.</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setCategory(''); setWorkType(''); setPage(0); }}>Clear category/work type</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
                        {paginated.map((job) => {
                            const isExt = job.isExternal ?? job.source !== 'internal';
                            const key = job.id || job.sourceId || job.title + job.companyName;
                            const title = job.title;
                            const company = job.companyName || job.company?.companyName || 'Company';
                            const loc = job.location || '—';
                            const wt = formatWorkMode(job.workplaceType || job.workType);
                            const emp = job.employmentType?.replace('_', ' ') || 'Full time';
                            const pay = formatPay(job.stipendMin ?? job.salary, job.stipendMax, job.stipendCurrency) || formatPay(job.salary, null, '₹');
                            const applyUrl = job.applyUrl || job.sourceUrl || '#';
                            const isExternalApply = isExt;
                            const numericId = job.id ? job.id.replace(/^ext-|^int-/, '') : job.sourceId;
                            const detailLink = isExt ? `/external-jobs/${numericId}` : `/jobs/${numericId || job.sourceId}`;
                            const desc = shortDesc(job.description, 160);
                            return (
                                <div key={key} className="internship-card" style={{ position: 'relative' }}>
                                    <div className="card-header">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                                <h3 style={{ margin: 0 }}>{title}</h3>
                                                {sourceBadge(job.source)}
                                                {job.isRemote && <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Remote</span>}
                                            </div>
                                            <div className="company">{company}</div>
                                        </div>
                                        <div className="company-logo">{company.charAt(0)}</div>
                                    </div>
                                    <div className="meta">
                                        <span><Icon name="location" size={14} /> {loc}</span>
                                        <span><Icon name="work" size={14} /> {wt}</span>
                                        <span><Icon name="duration" size={14} /> {emp}</span>
                                        <span><Icon name="stipend" size={14} /> {pay || 'Not disclosed'}</span>
                                        {job.postedAt && <span><Icon name="date" size={14} /> {new Date(job.postedAt).toLocaleDateString()}</span>}
                                    </div>
                                    <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0.5rem 0' }}>{desc}</p>
                                    <div className="skills" style={{marginBottom: '0.5rem'}}>
                                        {(job.tags || job.departments || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6).map(s => <span key={s} className="skill">{s}</span>)}
                                        {!(job.tags || job.departments) && <span className="skill" style={{opacity: 0.6}}>General</span>}
                                    </div>
                                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{isExternalApply ? `via ${job.source} • ` : ''}{job.sourceUrl ? <a href={job.sourceUrl} target="_blank" rel="noopener" style={{ textDecoration: 'underline' }}>View source</a> : ''}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link to={detailLink} className="btn btn-ghost btn-sm">View Details</Link>
                                            {isExternalApply ? (
                                                <a href={applyUrl} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Apply on {company} ↗</a>
                                            ) : (
                                                <Link to={applyUrl} className="btn btn-primary btn-sm">View & Apply</Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalFiltered > pageSize && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
                            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))}>Previous</button>
                            <span className="text-muted" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>Page {page + 1} / {Math.ceil(totalFiltered/pageSize)}</span>
                            <button className="btn btn-ghost btn-sm" disabled={(page + 1) * pageSize >= totalFiltered} onClick={() => setPage(p => p+1)}>Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JobsPage;

import { useState, useEffect, useCallback } from 'react';
import { jobAPI } from '../../api/jobAPI';
import SearchBar from '../../components/common/SearchBar';
import InternshipCard from '../../components/internships/InternshipCard';
import { stipendValue } from '../../utils/format';

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
const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'stipend', label: 'Stipend' },
];
const PAGE_SIZE = 12;

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [source, setSource] = useState('all');
    const [isRemote, setIsRemote] = useState(false);
    const [sort, setSort] = useState('relevance');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [liveNote, setLiveNote] = useState('');

    const fetchJobs = useCallback(
        async (pageNum = 0, kw = search, loc = location, src = source, remote = isRemote) => {
            setLoading(true);
            // Live board hit when a single external company feed is selected;
            // cached DB for "all"/internal (fast) — backend falls back to cache anyway.
            const useLive = src !== 'all' && src !== 'internal';
            setLiveNote(useLive ? ' ● Live feed' : '');
            try {
                const res = await jobAPI.getUnifiedJobs({
                    keyword: kw || undefined,
                    location: loc || undefined,
                    source: src !== 'all' ? src : undefined,
                    isRemote: remote || undefined,
                    live: useLive || undefined,
                    page: pageNum,
                    size: PAGE_SIZE,
                });
                const data = res.data || {};
                const list = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
                let sorted = [...list];
                if (sort === 'newest') sorted.sort((a, b) => new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0));
                if (sort === 'stipend') sorted.sort((a, b) => stipendValue(b) - stipendValue(a));
                setJobs(sorted);
                setTotal(data.totalElements ?? sorted.length);
                setPage(data.number ?? pageNum);
            } catch {
                setJobs([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sort]
    );

    useEffect(() => {
        fetchJobs(0, '', '', 'all', false);
        jobAPI
            .getIngestStats()
            .then((r) => setStats(r.data || null))
            .catch(() => {});
    }, [fetchJobs]);

    const handleSearch = () => {
        setPage(0);
        fetchJobs(0, search, location, source, isRemote);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <div className="dashboard-header" style={{ textAlign: 'center' }}>
                <h1>Find Jobs</h1>
                <p>Full-time and early-career openings — InternLite plus open-source company feeds.</p>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto 1rem' }}>
                <SearchBar keyword={search} location={location} onKeyword={setSearch} onLocation={setLocation} onSubmit={handleSearch} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.5rem' }}>
                {SOURCE_OPTIONS.map((o) => {
                    const count = stats && o.value !== 'all' && o.value !== 'internal' ? stats[o.value] : null;
                    const isEmpty = typeof count === 'number' && count === 0;
                    return (
                        <button
                            key={o.value}
                            type="button"
                            className={`skill-chip${source === o.value ? ' skill-highlight' : ''}`}
                            title={typeof count === 'number' ? `${count} cached roles` : o.label}
                            style={isEmpty ? { opacity: 0.45 } : undefined}
                            onClick={() => {
                                setSource(o.value);
                                setPage(0);
                                fetchJobs(0, search, location, o.value, isRemote);
                            }}
                        >
                            {o.label}
                            {typeof count === 'number' && o.value !== 'all' && o.value !== 'internal' ? ` (${count})` : ''}
                        </button>
                    );
                })}
                <button
                    type="button"
                    className={`skill-chip${isRemote ? ' skill-highlight' : ''}`}
                    onClick={() => {
                        setIsRemote((v) => {
                            fetchJobs(0, search, location, source, !v);
                            return !v;
                        });
                        setPage(0);
                    }}
                >
                    📍 Remote only
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem' }}>
                    {loading ? 'Searching…' : `${total} jobs`}
                    {liveNote && !loading && <span className="caption" style={{ marginLeft: '0.5rem' }}>{liveNote}</span>}
                </h2>
                <select
                    className="input"
                    style={{ maxWidth: 180 }}
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(0);
                        fetchJobs(0, search, location, source, isRemote);
                    }}
                    aria-label="Sort by"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading jobs...</div>
            ) : jobs.length === 0 ? (
                <div className="card empty-state">
                    <h3>No jobs found{source !== 'all' ? ` from ${SOURCE_OPTIONS.find((o) => o.value === source)?.label || source}` : ''}</h3>
                    <p className="text-secondary">
                        {source !== 'all' && source !== 'internal'
                            ? 'This company feed may still be syncing — try another company tab, or check back after the next sync.'
                            : 'Try a different keyword, source or location.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 860, margin: '0 auto' }}>
                    {jobs.map((job) => (
                        <InternshipCard key={job.id} job={job} detailPath="/jobs" />
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="pagination">
                    <button type="button" className="pagination-btn" disabled={page <= 0} onClick={() => fetchJobs(page - 1, search, location, source, isRemote)}>
                        ← Prev
                    </button>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        type="button"
                        className="pagination-btn"
                        disabled={page + 1 >= totalPages}
                        onClick={() => fetchJobs(page + 1, search, location, source, isRemote)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobsPage;

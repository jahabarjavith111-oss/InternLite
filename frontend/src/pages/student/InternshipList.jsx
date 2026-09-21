import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';
import { savedAPI } from '../../api/savedAPI';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../components/common/SearchBar';
import InternshipCard from '../../components/internships/InternshipCard';
import { stipendValue, isExternalItem, numericId } from '../../utils/format';

const ROLE_OPTIONS = ['Software', 'Data', 'AI'];
const LOCATION_OPTIONS = ['Chennai', 'Bengaluru', 'Remote'];
const MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];
const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'stipend', label: 'Stipend' },
];
const PAGE_SIZE = 12;

const InternshipList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [savedIds, setSavedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [modes, setModes] = useState([]);
    const [minStipend, setMinStipend] = useState('');
    const [sort, setSort] = useState('relevance');

    const fetchPage = useCallback(
        async (pageNum = 0, kw, loc) => {
            setLoading(true);
            try {
                const skill = searchParams.get('skill') || undefined;
                const res = await internshipAPI.getUnifiedInternships({
                    keyword: kw || undefined,
                    location: loc || undefined,
                    skill,
                    page: pageNum,
                    size: PAGE_SIZE,
                });
                const data = res.data || {};
                setItems(Array.isArray(data.content) ? data.content : []);
                setTotal(data.totalElements ?? 0);
                setPage(data.number ?? pageNum);
            } catch {
                setItems([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [searchParams]
    );

    useEffect(() => {
        const kw = searchParams.get('keyword') || '';
        const loc = searchParams.get('location') || '';
        setKeyword(kw);
        setLocation(loc);
        setPage(0);
        fetchPage(0, kw, loc);
    }, [searchParams, fetchPage]);

    useEffect(() => {
        if (!user) return;
        savedAPI
            .getSaved()
            .then((r) => {
                const ids = new Set((Array.isArray(r.data) ? r.data : []).map((s) => s.internship?.internshipId).filter(Boolean));
                setSavedIds(ids);
            })
            .catch(() => {});
    }, [user]);

    const toggleIn = (list, v, set) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

    const runSearch = () => {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (location) params.location = location;
        const skill = searchParams.get('skill');
        if (skill) params.skill = skill;
        setSearchParams(params);
    };

    const filtered = useMemo(() => {
        let list = [...items];
        if (roles.length) {
            list = list.filter((j) => {
                const hay = `${j.title || ''} ${j.tags || ''} ${j.departments || ''}`.toLowerCase();
                return roles.some((r) => hay.includes(r.toLowerCase()));
            });
        }
        if (locations.length) {
            list = list.filter((j) => {
                const jl = (j.location || '').toLowerCase();
                const wt = (j.workplaceType || j.workType || '').toLowerCase();
                return locations.some((l) =>
                    l === 'Remote' ? wt.includes('remote') || jl.includes('remote') || j.isRemote : jl.includes(l.toLowerCase())
                );
            });
        }
        if (modes.length) {
            list = list.filter((j) => {
                const wt = (j.workplaceType || j.workType || '').toLowerCase();
                return modes.some((m) => wt.includes(m.toLowerCase()));
            });
        }
        if (minStipend) list = list.filter((j) => stipendValue(j) >= Number(minStipend));
        if (sort === 'newest') list.sort((a, b) => new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0));
        if (sort === 'stipend') list.sort((a, b) => stipendValue(b) - stipendValue(a));
        return list;
    }, [items, roles, locations, modes, minStipend, sort]);

    const toggleSave = async (job) => {
        if (isExternalItem(job)) return;
        if (!user) {
            navigate('/login');
            return;
        }
        const id = Number(numericId(job));
        try {
            if (savedIds.has(id)) {
                await savedAPI.unsaveInternship(id);
                setSavedIds((prev) => {
                    const n = new Set(prev);
                    n.delete(id);
                    return n;
                });
            } else {
                await savedAPI.saveInternship(id);
                setSavedIds((prev) => new Set(prev).add(id));
            }
        } catch {
            /* ignore */
        }
    };

    const savedFor = (job) => (isExternalItem(job) ? false : savedIds.has(Number(numericId(job))));
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <div style={{ maxWidth: 900, margin: '0 auto 1.5rem' }}>
                <SearchBar keyword={keyword} location={location} onKeyword={setKeyword} onLocation={setLocation} onSubmit={runSearch} />
            </div>

            <div className="search-layout">
                <aside className="card filters-card" aria-label="Filters">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <div className="filter-title">Role</div>
                        {ROLE_OPTIONS.map((r) => (
                            <label key={r} className="filter-option">
                                <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleIn(roles, r, setRoles)} /> {r}
                            </label>
                        ))}
                    </div>
                    <div className="filter-group">
                        <div className="filter-title">Location</div>
                        {LOCATION_OPTIONS.map((l) => (
                            <label key={l} className="filter-option">
                                <input type="checkbox" checked={locations.includes(l)} onChange={() => toggleIn(locations, l, setLocations)} /> {l}
                            </label>
                        ))}
                    </div>
                    <div className="filter-group">
                        <div className="filter-title">Work Mode</div>
                        {MODE_OPTIONS.map((m) => (
                            <label key={m} className="filter-option">
                                <input type="checkbox" checked={modes.includes(m)} onChange={() => toggleIn(modes, m, setModes)} /> {m}
                            </label>
                        ))}
                    </div>
                    <div className="filter-group">
                        <div className="filter-title">Stipend</div>
                        <input
                            type="number"
                            min="0"
                            className="input"
                            placeholder="₹ Minimum"
                            value={minStipend}
                            onChange={(e) => setMinStipend(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                            setRoles([]);
                            setLocations([]);
                            setModes([]);
                            setMinStipend('');
                            setKeyword('');
                            setLocation('');
                            setSearchParams({});
                        }}
                    >
                        Clear all filters
                    </button>
                </aside>

                <section aria-live="polite">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                        <h1 style={{ fontSize: '1.35rem' }}>{loading ? 'Searching…' : `${total} internships`}</h1>
                        <select className="input" style={{ maxWidth: 180 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading internships…</div>
                    ) : filtered.length === 0 ? (
                        <div className="card empty-state">
                            <h3>No internships match your filters</h3>
                            <p className="text-secondary">Try a different keyword or clear your filters.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filtered.map((job) => (
                                <InternshipCard key={job.id} job={job} saved={savedFor(job)} onToggleSave={toggleSave} detailPath="/internships" />
                            ))}
                        </div>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={page <= 0}
                                onClick={() => fetchPage(page - 1, searchParams.get('keyword') || '', searchParams.get('location') || '')}
                            >
                                ← Prev
                            </button>
                            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={page + 1 >= totalPages}
                                onClick={() => fetchPage(page + 1, searchParams.get('keyword') || '', searchParams.get('location') || '')}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default InternshipList;

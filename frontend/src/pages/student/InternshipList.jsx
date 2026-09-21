import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';
import { savedAPI } from '../../api/savedAPI';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../../components/common/SearchBar';
import InternshipCard from '../../components/internships/InternshipCard';
import { stipendValue } from '../../utils/format';

const ROLE_OPTIONS = ['Software', 'Data', 'AI'];
const LOCATION_OPTIONS = ['Chennai', 'Bengaluru', 'Remote'];
const MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];
const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'stipend', label: 'Stipend' },
];

const InternshipList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [all, setAll] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [roles, setRoles] = useState(searchParams.get('skill') ? [] : []);
    const [locations, setLocations] = useState([]);
    const [modes, setModes] = useState([]);
    const [minStipend, setMinStipend] = useState('');
    const [sort, setSort] = useState('relevance');

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const res = await internshipAPI.getInternships({});
                if (mounted) setAll(Array.isArray(res.data) ? res.data : []);
            } catch {
                if (mounted) setAll([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        if (user) {
            savedAPI
                .getSaved()
                .then((r) => {
                    const ids = new Set((Array.isArray(r.data) ? r.data : []).map((s) => s.internship?.internshipId).filter(Boolean));
                    setSavedIds(ids);
                })
                .catch(() => {});
        }
        return () => {
            mounted = false;
        };
    }, [user]);

    useEffect(() => {
        setKeyword(searchParams.get('keyword') || '');
        setLocation(searchParams.get('location') || '');
    }, [searchParams]);

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
        const kw = (searchParams.get('keyword') || keyword).toLowerCase();
        const loc = (searchParams.get('location') || location).toLowerCase();
        const skill = (searchParams.get('skill') || '').toLowerCase();
        let list = all.filter((j) => {
            const hay = `${j.title || ''} ${j.company?.companyName || ''} ${j.requiredSkills || ''} ${j.category?.categoryName || ''}`.toLowerCase();
            if (kw && !hay.includes(kw)) return false;
            if (skill && !hay.includes(skill)) return false;
            if (loc && !(j.location || '').toLowerCase().includes(loc)) return false;
            if (roles.length && !roles.some((r) => hay.includes(r.toLowerCase()))) return false;
            if (locations.length) {
                const jl = (j.location || '').toLowerCase();
                const wt = (j.workType || '').toLowerCase();
                if (!locations.some((l) => (l === 'Remote' ? wt.includes('remote') || jl.includes('remote') : jl.includes(l.toLowerCase())))) return false;
            }
            if (modes.length && !modes.some((m) => (j.workType || '').toLowerCase().includes(m.toLowerCase()))) return false;
            if (minStipend && stipendValue(j) < Number(minStipend)) return false;
            return true;
        });
        if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (sort === 'stipend') list = [...list].sort((a, b) => stipendValue(b) - stipendValue(a));
        return list;
    }, [all, searchParams, keyword, location, roles, locations, modes, minStipend, sort]);

    const toggleSave = async (job) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const id = job.internshipId;
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
                        <h1 style={{ fontSize: '1.35rem' }}>{loading ? 'Searching…' : `${filtered.length} internships`}</h1>
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
                                <InternshipCard key={job.internshipId} job={job} saved={savedIds.has(job.internshipId)} onToggleSave={toggleSave} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default InternshipList;

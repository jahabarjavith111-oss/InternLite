import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { savedAPI } from '../../api/savedAPI';
import InternshipCard from '../../components/internships/InternshipCard';
import { stipendValue, timeAgo } from '../../utils/format';

const SORTS = [
    { value: 'newest', label: 'Newest' },
    { value: 'stipend', label: 'Stipend' },
    { value: 'relevance', label: 'Relevance' },
];

const SavedPage = () => {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        savedAPI
            .getSaved()
            .then((res) => setSaved(Array.isArray(res.data) ? res.data : []))
            .catch(() => setSaved([]))
            .finally(() => setLoading(false));
    }, []);

    const items = useMemo(() => {
        const list = [...saved];
        if (sort === 'stipend') list.sort((a, b) => stipendValue(b.internship) - stipendValue(a.internship));
        else if (sort === 'newest') list.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
        return list;
    }, [saved, sort]);

    const unsave = async (job) => {
        const id = job.internshipId;
        try {
            await savedAPI.unsaveInternship(id);
            setSaved((prev) => prev.filter((s) => s.internship?.internshipId !== id));
        } catch {
            /* ignore */
        }
    };

    return (
        <div>
            <div className="dashboard-header">
                <h1>Saved Internships</h1>
                <p>{saved.length ? `${saved.length} saved ${saved.length === 1 ? 'opportunity' : 'opportunities'}` : 'Your bookmarked opportunities — apply when ready.'}</p>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading saved...</div>
            ) : saved.length === 0 ? (
                <div className="card empty-state">
                    <h3>No saved internships</h3>
                    <p className="text-secondary">Tap ♡ on any internship to save it here.</p>
                    <Link to="/internships" className="btn btn-primary">
                        Browse Internships
                    </Link>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <label className="text-secondary" style={{ fontSize: '0.85rem', marginRight: '0.5rem', alignSelf: 'center' }}>
                            Sort:
                        </label>
                        <select className="input" style={{ maxWidth: 180 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort saved">
                            {SORTS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map((s) => {
                            const job = s.internship;
                            if (!job) return null;
                            return (
                                <div key={s.savedId || job.internshipId}>
                                    <InternshipCard job={job} saved onToggleSave={unsave} />
                                    <div className="caption" style={{ marginTop: '0.35rem' }}>
                                        Saved {s.savedAt ? timeAgo(s.savedAt) || new Date(s.savedAt).toLocaleDateString() : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default SavedPage;

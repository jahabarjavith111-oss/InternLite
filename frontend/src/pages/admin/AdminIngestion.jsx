import { useState, useEffect } from 'react';
import { jobAPI } from '../../api/jobAPI';

const AdminIngestion = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const loadStats = async () => {
        try {
            const res = await jobAPI.getIngestStats();
            setStats(res.data);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally { setLoading(false); }
    };

    useEffect(() => { loadStats(); const id = setInterval(loadStats, 30000); return () => clearInterval(id); }, []);

    const trigger = async (source) => {
        setTriggering(source || 'all');
        setError('');
        setResult(null);
        try {
            const res = await jobAPI.triggerIngest(source);
            setResult(res.data);
            await loadStats();
        } catch (e) {
            setError(e.response?.data?.message || e.response?.data || e.message);
        } finally { setTriggering(null); }
    };

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading ingestion...</div></div>;

    return (
        <div className="dashboard animate-fade-in" style={{ padding: '1.5rem' }}>
            <div className="dashboard-header">
                <h1>External Ingestion</h1>
                <p className="text-secondary">Live feeds from OpenIntern, Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee — 1943+ jobs real-time. Freshness: every 4h. Manual trigger below.</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Current Inventory</h3>
                {stats ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Total External</div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalExternal ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>OpenIntern</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.openintern ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Greenhouse</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.greenhouse ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Lever</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.lever ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Ashby</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.ashby ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Workable</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.workable ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>SmartRecruiters</div><div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.smartrecruiters ?? 0}</div></div>
                        <div className="card" style={{ textAlign: 'center', padding: '0.75rem' }}><div className="text-muted" style={{ fontSize: '0.8rem' }}>Recruitee</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.recruitee ?? 0}</div></div>
                    </div>
                ) : <p className="text-muted">No stats available.</p>}
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Auto-refresh every 30s. Manual sync respects rate limits (cached per source).</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>Manual Sync</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" disabled={!!triggering} onClick={() => trigger(null)}>{triggering === 'all' ? 'Syncing…' : 'Sync All Sources'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('openintern')}>{triggering === 'openintern' ? 'Syncing…' : 'Sync OpenIntern'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('greenhouse')}>{triggering === 'greenhouse' ? 'Syncing…' : 'Sync Greenhouse'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('lever')}>{triggering === 'lever' ? 'Syncing…' : 'Sync Lever'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('ashby')}>{triggering === 'ashby' ? 'Syncing…' : 'Sync Ashby'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('workable')}>{triggering === 'workable' ? 'Syncing…' : 'Sync Workable'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('smartrecruiters')}>{triggering === 'smartrecruiters' ? 'Syncing…' : 'Sync SR'}</button>
                    <button className="btn btn-ghost" disabled={!!triggering} onClick={() => trigger('recruitee')}>{triggering === 'recruitee' ? 'Syncing…' : 'Sync Recruitee'}</button>
                </div>
                {result && <div style={{ marginTop: '0.75rem', background: '#F0FDF4', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>Fetched {result.totalFetched} • Inserted {result.inserted} • Updated {result.updated} • Skipped {result.skipped} • Errors {result.errors}</div>}
                {error && <div style={{ marginTop: '0.75rem', background: '#FEF2F2', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#991B1B' }}>{String(error)}</div>}
            </div>

            <div className="card" style={{ fontSize: '0.85rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Ops Notes</h3>
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                    <li>Scheduler: every 4h (initial delay 30s after boot).</li>
                    <li>Dedup: (source + source_id) unique, content_hash skips unchanged rows.</li>
                    <li>Legal: read-only public feeds, no PII stored, apply via <code>applyUrl</code> redirect.</li>
                    <li>Rate limit: cached per-source, between 4–12h. Never hammer on page view.</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminIngestion;

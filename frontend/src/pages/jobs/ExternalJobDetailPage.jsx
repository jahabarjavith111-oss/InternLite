import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI } from '../../api/jobAPI';

const ExternalJobDetailPage = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        jobAPI.getExternalJobById(id)
            .then(res => { if (mounted) setJob(res.data); })
            .catch(err => { if (mounted) setError(err.response?.data?.message || err.message || 'Failed to load'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id]);

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading...</div></div>;
    if (error || !job) return <div className="dashboard"><div className="empty-state"><h3>Job not found</h3><p>{error}</p><Link to="/jobs" className="btn btn-primary">Back to Jobs</Link></div></div>;

    const sourceBadge = (s) => {
        const map = { openintern: '#DEF7EC', greenhouse: '#EDE9FE', lever: '#FEF3C7' };
        return <span className="badge" style={{ background: map[s?.toLowerCase()] || '#F1F5F9' }}>{s || 'External'}</span>;
    };

    return (
        <div className="dashboard animate-fade-in">
            <Link to="/jobs" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-flex' }}>← Back to Jobs</Link>
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{job.title}</h1>
                            {sourceBadge(job.source)}
                            {job.isRemote && <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Remote</span>}
                        </div>
                        <div className="text-muted" style={{ marginTop: '0.25rem' }}>{job.companyName} • {job.location || '—'} • {job.workplaceType || ''}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'recently'} • Source: {job.source}</div>
                    </div>
                    <a href={job.applyUrl} target="_blank" rel="noopener" className="btn btn-primary btn-lg" style={{ height: 'fit-content' }}>Apply on {job.companyName} ↗</a>
                </div>

                <div style={{ marginTop: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Never apply via proxy.</strong> You will be redirected to the company's official page ({job.source} → {job.sourceUrl}). InternLite does not store your external application data.</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <a href={job.applyUrl} target="_blank" rel="noopener" className="btn btn-primary">Apply now ↗</a>
                        {job.sourceUrl && job.sourceUrl !== job.applyUrl && <a href={job.sourceUrl} target="_blank" rel="noopener" className="btn btn-ghost">View source</a>}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
                    {job.descriptionHtml ? <div dangerouslySetInnerHTML={{ __html: job.descriptionHtml }} style={{ fontSize: '0.9rem', lineHeight: 1.7 }} /> : <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{job.descriptionMd || 'No description provided.'}</p>}
                </div>

                {(job.tags || job.departments) && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(job.tags ? job.tags.split(',') : []).map(t => t.trim()).filter(Boolean).map(tag => <span key={tag} className="badge" style={{ background: '#F1F5F9' }}>{tag}</span>)}
                        {(job.departments ? job.departments.split(',') : []).map(d => d.trim()).filter(Boolean).map(dep => <span key={dep} className="badge badge-primary">{dep}</span>)}
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', fontSize: '0.8rem' }} className="text-muted">
                    <div>Source ID: {job.source} / {job.sourceId}</div>
                    <div>Company domain: {job.companyDomain || '—'}</div>
                    <div>Freshness: updated {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : 'recently'}</div>
                </div>
            </div>
        </div>
    );
};

export default ExternalJobDetailPage;

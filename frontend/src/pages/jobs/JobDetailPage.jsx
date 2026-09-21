import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI } from '../../api/jobAPI';
import { resumeAPI } from '../../api/resumeAPI';
import { Icon } from '../../components/common/Icon';

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

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [applied, setApplied] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [resumeId, setResumeId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [jRes, rRes, aRes] = await Promise.allSettled([
                    jobAPI.getJobById(id),
                    resumeAPI.getMyResumes(),
                    jobAPI.getMyJobApplications(),
                ]);
                if (!mounted) return;
                if (jRes.status === 'fulfilled') setJob(jRes.value.data);
                if (rRes.status === 'fulfilled' && Array.isArray(rRes.value.data)) {
                    setResumes(rRes.value.data);
                    const def = rRes.value.data.find(x => x.default);
                    if (def) setResumeId(def.resumeId);
                }
                if (aRes.status === 'fulfilled' && Array.isArray(aRes.value.data)) {
                    if (aRes.value.data.some(a => String(a.job?.jobId) === String(id))) setApplied(true);
                }
            } finally { if (mounted) setLoading(false); }
        })();
        return () => { mounted = false; };
    }, [id]);

    const handleApply = async () => {
        try {
            await jobAPI.applyJob(job.jobId, coverLetter, resumeId || null);
            setApplied(true);
            alert('Job application submitted!');
            navigate('/student/applications');
        } catch (err) {
            alert(err.response?.data || 'Failed to apply');
        }
    };

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading job details...</div></div>;
    if (!job) return <div className="dashboard"><div className="empty-state"><h3>Job not found</h3><Link to="/jobs" className="btn btn-primary">Back to Jobs</Link></div></div>;

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

    if (!job) return <div className="dashboard"><div className="empty-state"><h3>Job not found</h3><Link to="/jobs" className="btn btn-primary">Back to Jobs</Link></div></div>;

    return (
        <div className="dashboard animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{marginBottom: '1rem'}}>← Back to Jobs</button>

            <div className="internship-card" style={{padding: '2rem'}}>
                <div className="card-header" style={{marginBottom: '1.5rem'}}>
                    <div>
                        <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>{job.title}</h1>
                        <div className="company" style={{fontSize: '1.1rem'}}>{job.company?.companyName}</div>
                    </div>
                    <div className="company-logo" style={{width: '64px', height: '64px', fontSize: '1.5rem', borderRadius: 'var(--radius-lg)'}}>
                        {job.company?.companyName?.charAt(0)}
                    </div>
                </div>

                <div className="meta" style={{fontSize: '1rem', marginBottom: '1.5rem'}}>
                    <span className="badge badge-secondary"><Icon name="location" size={14} /> {job.location || '—'}</span>
                    <span className="badge badge-secondary"><Icon name="work" size={14} /> {job.workType}</span>
                    <span className="badge badge-secondary">⏱ {job.duration}</span>
                    <span className="badge badge-success"><Icon name="stipend" size={14} /> {job.salary}</span>
                    <span className="badge badge-muted">🗓 Apply before {job.applicationDeadline || '—'}</span>
                </div>

                <div style={{display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                    {!applied && <button onClick={() => document.getElementById('apply-box')?.scrollIntoView({behavior: 'smooth'})} className="btn btn-primary btn-lg">Apply Now</button>}
                    <button onClick={toggleSave} className="btn btn-outline btn-lg">{saved ? '★ Saved' : '♡ Save'}</button>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                    <h4 style={{marginBottom: '0.5rem', fontSize: '1rem'}}>About this role</h4>
                    <p className="text-secondary" style={{lineHeight: '1.8'}}>{job.description}</p>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                    <h4 style={{marginBottom: '0.75rem', fontSize: '1rem'}}>Required Skills</h4>
                    <div className="skills">
                        {job.requiredSkills && job.requiredSkills.split(',').map(s =>
                            <span key={s} className="skill">{s.trim()}</span>)}
                    </div>
                </div>

                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.5rem 0', borderTop: '1px solid var(--border-color)', marginTop: '1.5rem'}}>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Category</div>
                        <div style={{fontWeight: '600'}}>{job.category?.categoryName}</div>
                    </div>
                    <div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Deadline</div>
                        <div style={{fontWeight: '600'}}>{job.applicationDeadline}</div>
                    </div>
                </div>

                {applied ? (
                    <div style={{background: '#ECFDF5', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #A7F3D0', marginTop: '1.5rem'}}>
                        <p className="text-success" style={{fontWeight: '600', fontSize: '1rem'}}>✓ Application submitted successfully!</p>
                        <p className="text-secondary" style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>The recruiter will review your application and get back to you soon.</p>
                    </div>
                ) : (
                    <div id="apply-box" style={{marginTop: '2rem', background: 'var(--bg-muted)', padding: '1.5rem', borderRadius: 'var(--radius-lg)'}}>
                        <h4 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Apply for this job</h4>
                        <div style={{display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                            <button onClick={() => document.getElementById('apply-box')?.scrollIntoView({behavior: 'smooth'})} className="btn btn-outline btn-lg">{saved ? '★ Saved' : '☆ Save'}</button>
                            <button onClick={handleApply} className="btn btn-primary btn-lg">Apply Now</button>
                        </div>
                        {resumes.length > 0 && (
                            <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="form-control" style={{marginBottom: '1rem'}}>
                                <option value="">Select resume (optional)</option>
                                {resumes.map(r => <option key={r.resumeId} value={r.resumeId}>{r.resumeName}</option>)}
                            </select>
                        )}
                        <textarea
                            value={coverLetter}
                            onChange={e=>setCoverLetter(e.target.value)}
                            placeholder="Write a brief cover letter explaining why you're a great fit..."
                            rows="5"
                            className="form-control"
                            style={{marginBottom: '1rem'}}
                        />
                        <button onClick={handleApply} className="btn btn-success btn-lg">Submit Application</button>
                    </div>
                )}

                {related.length > 0 && (
                    <div style={{marginTop: '2rem'}}>
                        <h2 style={{fontSize: '1.4rem', marginBottom: '1rem'}}>Related Jobs</h2>
                        <div className="grid grid-cols-1" style={{gap: '1rem'}}>
                            {related.map(r => (
                                <Link to={`/jobs/${r.jobId}`} key={r.jobId} className="job-card">
                                    <div className="card-header">
                                        <div>
                                            <h3>{r.title}</h3>
                                            <div className="company">{r.company?.companyName}</div>
                                        </div>
                                    </div>
                                    <div className="meta">
                                        <span>📍 {r.location}</span>
                                        <span>💼 {r.workType}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetailPage;
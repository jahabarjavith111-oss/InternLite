import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI } from '../../api/jobAPI';
import { resumeAPI } from '../../api/resumeAPI';
import { Icon } from '../../components/common/Icon';

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
            navigate('/applications');
        } catch (err) {
            alert(err.response?.data || 'Failed to apply');
        }
    };

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading job details...</div></div>;
    if (!job) return <div className="dashboard"><div className="empty-state"><h3>Job not found</h3><Link to="/jobs" className="btn btn-primary">Back to Jobs</Link></div></div>;

    return (
        <div className="dashboard animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn-back">← Back to Jobs</button>
            <div className="internship-card" style={{padding: '2rem'}}>
                <div className="card-header" style={{marginBottom: '1.5rem'}}>
                    <div>
                        <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>{job.title}</h1>
                        <div className="company" style={{fontSize: '1.1rem'}}>{job.company?.companyName}</div>
                    </div>
                    <div className="company-logo" style={{width: '64px', height: '64px', fontSize: '1.5rem'}}>{job.company?.companyName?.charAt(0)}</div>
                </div>
                <div className="meta" style={{fontSize: '1rem', marginBottom: '1.5rem'}}>
                    <span className="badge badge-secondary"><Icon name="location" size={14} /> {job.location || '—'}</span>
                    <span className="badge badge-secondary"><Icon name="work" size={14} /> {job.workType || '—'}</span>
                    <span className="badge badge-secondary"><Icon name="duration" size={14} /> {job.employmentType?.replace('_', ' ')}</span>
                    {job.salary != null && <span className="badge badge-success"><Icon name="stipend" size={14} /> {job.salary}</span>}
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                    <h4 style={{marginBottom: '0.5rem'}}>About this role</h4>
                    <p className="text-secondary" style={{lineHeight: '1.8'}}>{job.description}</p>
                </div>
                {job.experience && <p className="text-secondary" style={{marginBottom: '1rem'}}><b>Experience:</b> {job.experience}</p>}
                <div style={{marginBottom: '1.5rem'}}>
                    <h4 style={{marginBottom: '0.75rem'}}>Required Skills</h4>
                    <div className="skills">{job.requiredSkills && job.requiredSkills.split(',').map(s => <span key={s} className="skill">{s.trim()}</span>)}</div>
                </div>
                {applied ? (
                    <div style={{background: '#ECFDF5', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #A7F3D0', marginTop: '1.5rem'}}>
                        <p className="text-success" style={{fontWeight: '600'}}>✓ Application submitted successfully!</p>
                    </div>
                ) : (
                    <div style={{marginTop: '2rem', background: 'var(--bg-muted)', padding: '1.5rem', borderRadius: 'var(--radius-lg)'}}>
                        <h4 style={{marginBottom: '1rem'}}>Apply for this job</h4>
                        {resumes.length > 0 && (
                            <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="form-control" style={{marginBottom: '1rem'}}>
                                <option value="">Select resume (optional)</option>
                                {resumes.map(r => <option key={r.resumeId} value={r.resumeId}>{r.resumeName}</option>)}
                            </select>
                        )}
                        <textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} placeholder="Write a brief cover letter..." rows="5" className="form-control" style={{marginBottom: '1rem'}} />
                        <button onClick={handleApply} className="btn btn-success btn-lg">Submit Application</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetailPage;

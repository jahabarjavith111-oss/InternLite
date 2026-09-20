import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import api from '../../api/api';
import { recruiterAPI } from '../../api/recruiterAPI';

const CandidateProfile = () => {
    const { id } = useParams();
    const [live, setLive] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get(`/applications/${id}`).then(r => setLive(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, [id]);
    const app = live ? {
        applicationId: live.applicationId,
        candidate: { name: live.student?.user?.name || 'Student', email: live.student?.user?.email || '', location: live.student?.location || '', phone: live.student?.user?.phone || '' },
        education: [live.student?.degree, live.student?.college].filter(Boolean).join(', '),
        skills: (live.internship?.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
        status: live.status, coverLetter: live.coverLetter,
        internship: { title: live.internship?.title },
        appliedAt: live.appliedAt, bio: live.student?.bio || ''
    } : null;
    const candidate = app?.candidate;

    const setStatus = async (status) => {
        try {
            await recruiterAPI.updateApplicationStatus(id, status);
            alert(`Candidate ${status.toLowerCase()}`);
            setLive(prev => prev ? { ...prev, status } : prev);
        } catch { alert('Failed'); }
    };

    if (loading) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="loading-spinner">Loading candidate...</div></main></div>;
    if (!candidate) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="dashboard">Candidate not found</div></main></div>;

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <div className="recruiter-content">
                    <button onClick={() => window.history.back()} className="btn-back">← Back to Applicants</button>

                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="candidate-profile-header">
                            <div className="candidate-profile-avatar">{candidate.name.charAt(0)}</div>
                            <div className="candidate-profile-info">
                                <h1 style={{fontSize: '1.75rem', marginBottom: '0.25rem'}}>{candidate.name}</h1>
                                <p className="text-secondary">{candidate.location} • {candidate.email} • {candidate.phone}</p>
                            </div>
                            <div className="candidate-profile-actions">
                                <button className="btn btn-success btn-sm" onClick={() => setStatus('SHORTLISTED')}>Shortlist</button>
                                <button className="btn btn-danger btn-sm" onClick={() => setStatus('REJECTED')}>Reject</button>
                                <button className="btn btn-primary btn-sm" onClick={() => setStatus('INTERVIEW')}>Schedule Interview</button>
                                <button className="btn btn-outline btn-sm">Download Resume</button>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-left">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>About</h3>
                                <p className="text-secondary" style={{lineHeight: '1.7'}}>
                                    Passionate developer with strong fundamentals and internship experience. Enjoys building scalable solutions and learning new technologies.
                                </p>
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Education</h3>
                                <div className="education-item">
                                    <div className="education-degree">{app.education}</div>
                                    <div className="text-muted">2022 - 2026</div>
                                </div>
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Experience</h3>
                                <div className="experience-item">
                                    <div className="experience-role">{app.experience}</div>
                                    <div className="text-muted">Previous internship</div>
                                </div>
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Skills</h3>
                                <div className="skills-list">
                                    {app.skills.map(skill => <span key={skill} className="skill-chip">{skill}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-right">
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Application Details</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Position</span>
                                    <span className="detail-value">{app.internship?.title}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Department</span>
                                    <span className="detail-value">{app.internship?.department}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className={`badge status-${app.status}`}>{app.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Applied</span>
                                    <span className="detail-value">{new Date(app.appliedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Cover Letter</h3>
                                <p className="text-secondary" style={{lineHeight: '1.7', fontSize: '0.95rem'}}>{app.coverLetter}</p>
                            </div>

                            <div className="card">
                                <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Links</h3>
                                <div className="action-links" style={{margin: 0}}>
                                    <a href="#" className="btn btn-outline btn-sm">GitHub</a>
                                    <a href="#" className="btn btn-outline btn-sm">LinkedIn</a>
                                    <a href="#" className="btn btn-outline btn-sm">Portfolio</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CandidateProfile;

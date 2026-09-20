import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { Icon } from '../../components/common/Icon';

const ShortlistedPage = () => {
    const [search, setSearch] = useState('');
    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const my = await recruiterAPI.getMyInternships();
                const list = Array.isArray(my.data) ? my.data : [];
                const acc = [];
                for (const i of list) {
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        (Array.isArray(r.data) ? r.data : [])
                            .filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW')
                            .forEach(a => acc.push({
                                applicationId: a.applicationId,
                                candidate: { name: a.student?.user?.name || 'Student', location: a.student?.location || '' },
                                internship: { title: a.internship?.title || i.title },
                                skills: (a.internship?.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
                                status: a.status, appliedAt: a.appliedAt
                            }));
                    } catch { /* ignore */ }
                }
                setAll(acc);
            } catch { /* ignore */ } finally { setLoading(false); }
        })();
    }, []);
    const shortlisted = all.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW');

    const filtered = shortlisted.filter(app =>
        app.candidate.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Shortlisted Candidates"
                    subtitle="Candidates you have shortlisted for interviews."
                />

                <div className="recruiter-content">
                    <div className="search-bar" style={{marginBottom: '1.5rem'}}>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search shortlisted candidates..."
                            className="form-control"
                            style={{flex: 1}}
                        />
                    </div>

                    {loading ? <div className="loading-spinner">Loading shortlisted...</div> : filtered.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon"><Icon name="match" size={14} /></span>
                            <h3>No shortlisted candidates</h3>
                            <p>Shortlist candidates from the applicants page to see them here.</p>
                        </div>
                    ) : (
                        <div className="candidate-grid">
                            {filtered.map(app => (
                                <div key={app.applicationId} className="candidate-card">
                                    <div className="candidate-card-header">
                                        <div className="candidate-avatar-lg">{app.candidate.name.charAt(0)}</div>
                                        <div>
                                            <div className="candidate-name">{app.candidate.name}</div>
                                            <div className="candidate-position">{app.internship?.title}</div>
                                        </div>
                                    </div>
                                    <div className="candidate-card-body">
                                        <div className="candidate-detail">
                                            <span className="candidate-detail-label">Education</span>
                                            <span className="candidate-detail-value">{app.education}</span>
                                        </div>
                                        <div className="skills-list" style={{marginTop: '0.75rem'}}>
                                            {app.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                                        </div>
                                        <div className="text-muted mt-2" style={{fontSize: '0.85rem'}}>Shortlisted: {new Date(app.appliedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="candidate-card-actions">
                                        <Link to={`/recruiter/candidate/${app.applicationId}`} className="btn btn-outline btn-sm">View Profile</Link>
                                        <button className="btn btn-primary btn-sm">Schedule Interview</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ShortlistedPage;

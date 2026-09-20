import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import api from '../../api/api';
import { Icon } from '../../components/common/Icon';

const ActivePage = () => {
    const [internships, setInternships] = useState([]);
    const [apps, setApps] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const my = await recruiterAPI.getMyInternships();
                const list = Array.isArray(my.data) ? my.data : [];
                if (!mounted) return;
                setInternships(list);
                const all = [];
                for (const i of list) {
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        (Array.isArray(r.data) ? r.data : []).forEach(a => all.push(a));
                    } catch { /* skip */ }
                }
                if (!mounted) return;
                setApps(all);
                const withIv = all.filter(a => a.status === 'INTERVIEW');
                const details = await Promise.allSettled(withIv.map(a => api.get(`/interviews/application/${a.applicationId}`)));
                if (!mounted) return;
                const ivs = details
                    .map((d, idx) => ({ raw: d.status === 'fulfilled' ? d.value.data : null, app: withIv[idx] }))
                    .filter(x => x.raw)
                    .filter(({ raw }) => {
                        if (!raw.scheduledAt) return true;
                        const diff = (new Date(raw.scheduledAt) - new Date()) / (1000 * 60 * 60 * 24);
                        return diff >= 0 && diff <= 7;
                    });
                setInterviews(ivs);
            } finally { if (mounted) setLoading(false); }
        })();
        return () => { mounted = false; };
    }, []);

    const newApps = apps.filter(a => a.status === 'APPLIED').slice(0, 8);
    const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').slice(0, 8);

    if (loading) return <div className="recruiter-layout"><RecruiterSidebar /><main className="recruiter-main"><div className="loading-spinner">Loading Active...</div></main></div>;

    const empty = newApps.length === 0 && shortlisted.length === 0 && interviews.length === 0;

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader title="Active" subtitle="Only what needs your action — new applications, shortlisted awaiting interviews, upcoming interviews." />
                <div className="recruiter-content">
                    {empty ? (
                        <div className="empty-state">
                            <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                            <h3>All caught up!</h3>
                            <p>Nothing needs your attention right now.</p>
                        </div>
                    ) : (
                        <>
                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem'}}>New Applications to Review ({newApps.length})</h3>
                                {newApps.length === 0 ? <p className="text-muted">No new applications pending review.</p> : (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
                                        {newApps.map(a => (
                                            <div key={a.applicationId} className="d-flex justify-between items-center" style={{padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'}}>
                                                <div>
                                                    <strong>{a.student?.user?.name || 'Student'}</strong> • {a.internship?.title}
                                                    <div className="text-muted" style={{fontSize: '0.8rem'}}>{new Date(a.appliedAt).toLocaleDateString()}</div>
                                                </div>
                                                <Link to={`/recruiter/applicants?internshipId=${a.internship?.internshipId}`} className="btn btn-outline btn-sm">Review</Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem'}}>Shortlisted — Ready to Interview ({shortlisted.length})</h3>
                                {shortlisted.length === 0 ? <p className="text-muted">No shortlisted candidates awaiting scheduling.</p> : (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
                                        {shortlisted.map(a => (
                                            <div key={a.applicationId} className="d-flex justify-between items-center" style={{padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'}}>
                                                <div>
                                                    <strong>{a.student?.user?.name || 'Student'}</strong> • {a.internship?.title}
                                                    <span className="badge badge-warning" style={{marginLeft: '0.5rem'}}>SHORTLISTED</span>
                                                </div>
                                                <Link to={`/recruiter/interviews?schedule=${a.applicationId}`} className="btn btn-primary btn-sm">Schedule</Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card" style={{marginBottom: '1.5rem'}}>
                                <h3 style={{marginBottom: '1rem'}}>Upcoming Interviews (next 7 days) — {interviews.length}</h3>
                                {interviews.length === 0 ? <p className="text-muted">No interviews in the next 7 days.</p> : (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
                                        {interviews.map(({ raw, app }) => (
                                            <div key={raw.interviewId} className="d-flex justify-between items-center" style={{padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'}}>
                                                <div>
                                                    <strong>{app.student?.user?.name}</strong> • {app.internship?.title}
                                                    <div className="text-muted" style={{fontSize: '0.8rem'}}>📅 {raw.scheduledAt ? new Date(raw.scheduledAt).toLocaleString() : '—'} • {raw.interviewType}</div>
                                                </div>
                                                {raw.meetingLink ? <a href={raw.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join</a> : <span className="badge badge-success">{raw.status}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="text-muted" style={{fontSize: '0.85rem'}}>Internships: {internships.filter(i => i.status === 'OPEN').length} active • Total applications: {apps.length}</div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ActivePage;

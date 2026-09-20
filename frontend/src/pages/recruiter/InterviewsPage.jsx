import { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import api from '../../api/api';
import { Icon } from '../../components/common/Icon';

const InterviewsPage = () => {
    const [view, setView] = useState('list');
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduling, setScheduling] = useState(false);
    const [schedForm, setSchedForm] = useState({ applicationId: '', scheduledAt: '', meetingLink: '', interviewerName: '', interviewType: 'ONLINE' });

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const my = await recruiterAPI.getMyInternships();
            const list = Array.isArray(my.data) ? my.data : [];
            const acc = [];
            for (const i of list) {
                try {
                    const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                    const apps = Array.isArray(r.data) ? r.data : [];
                    for (const a of apps.filter(x => x.status === 'INTERVIEW' || x.status === 'SHORTLISTED')) {
                        try {
                            const iv = await api.get(`/interviews/application/${a.applicationId}`);
                            if (iv.data) acc.push({ ...iv.data, candidateName: a.student?.user?.name || 'Student', position: a.internship?.title || i.title, applicationId: a.applicationId });
                        } catch { /* no interview yet */ }
                    }
                } catch { /* skip */ }
            }
            setInterviews(acc);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchInterviews(); }, []);

    const schedule = async () => {
        if (!schedForm.applicationId || !schedForm.scheduledAt) { alert('Application ID and date/time required'); return; }
        setScheduling(true);
        try {
            await recruiterAPI.scheduleInterview(schedForm.applicationId, {
                scheduledAt: schedForm.scheduledAt,
                meetingLink: schedForm.meetingLink,
                interviewerName: schedForm.interviewerName,
                interviewType: schedForm.interviewType
            });
            alert('Interview scheduled');
            setSchedForm({ applicationId: '', scheduledAt: '', meetingLink: '', interviewerName: '', interviewType: 'ONLINE' });
            fetchInterviews();
        } catch { alert('Failed to schedule (check application ID)'); }
        finally { setScheduling(false); }
    };

    const updateIvStatus = async (id, status) => {
        try { await api.put(`/interviews/${id}/status`, null, { params: { status } }); fetchInterviews(); }
        catch { alert('Failed to update interview'); }
    };

    const dayLabel = (dt) => {
        if (!dt) return 'Unscheduled';
        const d = new Date(dt);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const day = new Date(d); day.setHours(0, 0, 0, 0);
        if (day.getTime() === today.getTime()) return `Today — ${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
        if (day.getTime() === tomorrow.getTime()) return 'Tomorrow';
        return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const grouped = interviews.reduce((acc, iv) => {
        const k = dayLabel(iv.scheduledAt);
        acc[k] = acc[k] || [];
        acc[k].push(iv);
        return acc;
    }, {});

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="Interviews"
                    subtitle="Manage your scheduled interviews."
                />

                <div className="recruiter-content">
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="d-flex" style={{gap: '0.5rem'}}>
                            {['list', 'day', 'week', 'month'].map(v => (
                                <button key={v} onClick={() => setView(v)} className={`btn ${view === v ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {view === 'list' && (
                        <div className="interview-list">
                            <div className="card" style={{marginBottom: '1.5rem', padding: '1.25rem'}}>
                                <h3 style={{marginBottom: '1rem'}}>Schedule Interview (live API)</h3>
                                <div className="profile-grid">
                                    <div className="form-group"><label>Application ID</label><input value={schedForm.applicationId} onChange={e => setSchedForm({ ...schedForm, applicationId: e.target.value })} className="form-control" placeholder="e.g. 1" /></div>
                                    <div className="form-group"><label>Date & Time</label><input type="datetime-local" value={schedForm.scheduledAt} onChange={e => setSchedForm({ ...schedForm, scheduledAt: e.target.value })} className="form-control" /></div>
                                    <div className="form-group"><label>Meeting Link</label><input value={schedForm.meetingLink} onChange={e => setSchedForm({ ...schedForm, meetingLink: e.target.value })} className="form-control" placeholder="https://meet..." /></div>
                                    <div className="form-group"><label>Interviewer</label><input value={schedForm.interviewerName} onChange={e => setSchedForm({ ...schedForm, interviewerName: e.target.value })} className="form-control" placeholder="Name" /></div>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{marginTop: '1rem'}} onClick={schedule} disabled={scheduling}>{scheduling ? 'Scheduling...' : 'Schedule via API'}</button>
                            </div>
                            {loading ? <div className="loading-spinner">Loading interviews...</div> : interviews.length === 0 ? (
                                <div className="empty-state"><h3>No interviews scheduled</h3><p>Schedule interviews for shortlisted candidates using the form above.</p></div>
                            ) : Object.entries(grouped).map(([day, list]) => (
                                <div key={day} className="day-group">
                                    <h3>{day}</h3>
                                    {list.map(interview => (
                                <div key={interview.interviewId} className="interview-card">
                                    <div className="interview-card-left">
                                        <div className="interview-avatar-lg">{(interview.candidateName || 'S').charAt(0)}</div>
                                        <div>
                                            <div className="interview-candidate">{interview.candidateName}</div>
                                            <div className="interview-position">{interview.position} (App #{interview.applicationId})</div>
                                            <div className="text-muted" style={{fontSize: '0.85rem'}}>Interviewer: {interview.interviewerName || '—'}</div>
                                        </div>
                                    </div>
                                    <div className="interview-card-meta">
                                        <div className="interview-meta-item"><Icon name="duration" size={14} /> {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}</div>
                                        <div className="interview-meta-item">💻 {interview.interviewType}</div>
                                        {interview.meetingLink && <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="interview-meta-item">Google Meet</a>}
                                        <span className={`badge ${interview.status === 'SCHEDULED' ? 'badge-success' : 'badge-warning'}`}>{interview.status}</span>
                                    </div>
                                    <div className="interview-card-actions">
                                        {interview.meetingLink && <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Join Meeting</a>}
                                        <button className="btn btn-outline btn-sm" onClick={() => updateIvStatus(interview.interviewId, 'COMPLETED')}>Complete</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => updateIvStatus(interview.interviewId, 'CANCELLED')}>Cancel</button>
                                    </div>
                                </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {view !== 'list' && (
                        <div className="card">
                            <div className="empty-state">
                                <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                                <h3>Calendar View</h3>
                                <p>Calendar integration coming soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterviewsPage;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';
import api from '../../api/api';
import { Icon } from '../../components/common/Icon';

const StudentInterviewsPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await internshipAPI.getMyApplications();
                const apps = Array.isArray(res.data) ? res.data.filter(a => a.status === 'INTERVIEW' || a.status === 'SELECTED') : [];
                const details = await Promise.allSettled(apps.map(a => api.get(`/interviews/application/${a.applicationId}`)));
                if (!mounted) return;
                setInterviews(details.map((d, i) => ({ ...(d.status === 'fulfilled' ? d.value.data : null), application: apps[i] })).filter(x => x && x.interviewId));
            } finally { if (mounted) setLoading(false); }
        })();
        return () => { mounted = false; };
    }, []);

    const dayLabel = (dt) => {
        if (!dt) return 'Upcoming';
        const d = new Date(dt);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const day = new Date(d); day.setHours(0, 0, 0, 0);
        if (day.getTime() === today.getTime()) return 'Today';
        if (day.getTime() === tomorrow.getTime()) return 'Tomorrow';
        return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const groups = interviews.reduce((acc, iv) => {
        const k = dayLabel(iv.scheduledAt);
        acc[k] = acc[k] || [];
        acc[k].push(iv);
        return acc;
    }, {});

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Interviews</h1>
                <p>Your scheduled interviews with recruiters.</p>
            </div>
            {loading ? <div className="loading-spinner">Loading interviews...</div> : interviews.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                    <h3>No interviews scheduled</h3>
                    <p>Keep applying — invites will appear here.</p>
                    <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
                </div>
            ) : Object.entries(groups).map(([day, list]) => (
                <div key={day} className="day-group">
                    <h3>{day}</h3>
                    <div className="application-list">
                        {list.map(iv => (
                            <div key={iv.interviewId} className="application-card" style={{borderLeftColor: 'var(--secondary)'}}>
                                <div className="d-flex justify-between items-center">
                                    <div>
                                        <div className="app-title">{iv.application?.internship?.title}</div>
                                        <div className="app-company">{iv.interviewType} • {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''} {iv.interviewerName ? `• ${iv.interviewerName}` : ''}</div>
                                    </div>
                                    <span className="badge badge-info">{iv.status}</span>
                                </div>
                                {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{marginTop: '0.75rem'}}>Join Meeting</a>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentInterviewsPage;

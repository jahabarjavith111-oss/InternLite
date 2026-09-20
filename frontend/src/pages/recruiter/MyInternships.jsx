import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import { recruiterAPI } from '../../api/recruiterAPI';
import { Icon } from '../../components/common/Icon';

const MyInternships = () => {
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        recruiterAPI.getMyInternships().then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            const mapped = data.map(i => ({
                    internshipId: i.internshipId,
                    title: i.title,
                    department: i.category?.categoryName || 'General',
                    location: i.location,
                    workMode: i.workType,
                    stipend: i.stipend,
                    applicants: 0,
                    views: 0,
                    deadline: i.applicationDeadline,
                    status: i.status === 'OPEN' ? 'ACTIVE' : i.status === 'DRAFT' ? 'DRAFT' : 'CLOSED',
                    _raw: i
                }));
                setInternships(mapped);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const changeStatus = async (int, backendStatus) => {
        try {
            await recruiterAPI.updateInternshipStatus(int.internshipId, backendStatus);
            setInternships(prev => prev.map(x => x.internshipId === int.internshipId
                ? { ...x, status: backendStatus === 'OPEN' ? 'ACTIVE' : backendStatus === 'DRAFT' ? 'DRAFT' : 'CLOSED' } : x));
        } catch { alert('Failed to update status'); }
    };

    const filtered = internships.filter(i => i.status === activeTab);

    const tabs = [
        { id: 'ACTIVE', label: 'Active', count: internships.filter(i => i.status === 'ACTIVE').length },
        { id: 'DRAFT', label: 'Draft', count: internships.filter(i => i.status === 'DRAFT').length },
        { id: 'PAUSED', label: 'Paused', count: internships.filter(i => i.status === 'PAUSED').length },
        { id: 'CLOSED', label: 'Closed', count: 0 }
    ];

    return (
        <div className="recruiter-layout">
            <RecruiterSidebar />
            <main className="recruiter-main">
                <RecruiterHeader
                    title="My Internships"
                    subtitle="Manage all your internship listings."
                />

                <div className="recruiter-content">
                    {loading ? <div className="loading-spinner">Loading internships...</div> : (
                    <>
                    <div className="card" style={{marginBottom: '1.5rem'}}>
                        <div className="d-flex" style={{gap: '0.5rem', flexWrap: 'wrap'}}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                            <h3>No {activeTab.toLowerCase()} internships</h3>
                            <p>Start by posting a new internship.</p>
                            <Link to="/recruiter/post-internship" className="btn btn-primary">Post Internship</Link>
                        </div>
                    ) : (
                        <div className="internship-grid">
                            {filtered.map(int => (
                                <div key={int.internshipId} className="internship-card">
                                    <div className="card-header" style={{marginBottom: '0.75rem'}}>
                                        <div>
                                            <h3 style={{fontSize: '1.05rem', marginBottom: '0.25rem'}}>{int.title}</h3>
                                            <div className="company-meta">{int.department} • {int.location} • {int.workMode}</div>
                                        </div>
                                        <span className={`badge ${int.status === 'ACTIVE' ? 'badge-success' : int.status === 'PAUSED' ? 'badge-warning' : 'badge-muted'}`}>{int.status}</span>
                                    </div>
                                    <div className="internship-stats">
                                        <div className="internship-stat">
                                            <span className="internship-stat-value">{int.applicants}</span>
                                            <span className="internship-stat-label">Applicants</span>
                                        </div>
                                        <div className="internship-stat">
                                            <span className="internship-stat-value">{int.views}</span>
                                            <span className="internship-stat-label">Views</span>
                                        </div>
                                        <div className="internship-stat">
                                            <span className="internship-stat-value">{int.stipend}</span>
                                            <span className="internship-stat-label">Stipend</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <span className="text-muted">Deadline: {int.deadline}</span>
                                        <div className="d-flex" style={{gap: '0.5rem'}}>
                                            <Link to={`/internships/${int.internshipId}`} className="btn btn-outline btn-sm">View</Link>
                                            <Link to={`/recruiter/internships/${int.internshipId}/applicants`} className="btn btn-primary btn-sm">Manage</Link>
                                            {int.status === 'ACTIVE' && <button className="btn btn-ghost btn-sm" onClick={() => changeStatus(int, 'CLOSED')}>Pause</button>}
                                            {int.status !== 'ACTIVE' && <button className="btn btn-success btn-sm" onClick={() => changeStatus(int, 'OPEN')}>Resume</button>}
                                            <button className="btn btn-danger btn-sm" onClick={() => changeStatus(int, 'CLOSED')}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyInternships;

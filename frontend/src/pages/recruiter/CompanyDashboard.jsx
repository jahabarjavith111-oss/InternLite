import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../api/recruiterAPI';
import { Icon } from '../../components/common/Icon';

const CompanyDashboard = () => {
    const { user, logout } = useAuth();
    const [internships, setInternships] = useState([]);
    const [appMap, setAppMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await recruiterAPI.getMyInternships();
                const list = Array.isArray(res.data) ? res.data : [];
                setInternships(list);
                const map = {};
                for (const i of list) {
                    try {
                        const r = await recruiterAPI.getInternshipApplications(i.internshipId);
                        map[i.internshipId] = Array.isArray(r.data) ? r.data : [];
                    } catch { map[i.internshipId] = []; }
                }
                setAppMap(map);
            } catch {
                setInternships([]);
            } finally { setLoading(false); }
        })();
    }, []);

    const allApps = Object.values(appMap).flat();
    const totalApplications = allApps.length;
    const shortlistedCount = allApps.filter(a => a.status === 'SHORTLISTED').length;
    const interviewCount = allApps.filter(a => a.status === 'INTERVIEW').length;

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
                <p>Manage your internships and applications.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="internships" size={22} /></div>
                    <div className="num">{internships.length}</div>
                    <div className="label">Internships Posted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="applications" size={22} /></div>
                    <div className="num">{totalApplications}</div>
                    <div className="label">Total Applications</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="shortlisted" size={22} /></div>
                    <div className="num">{shortlistedCount}</div>
                    <div className="label">Shortlisted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{display: 'inline-flex'}}><Icon name="target" size={22} /></div>
                    <div className="num">{interviewCount}</div>
                    <div className="label">Interviews</div>
                </div>
            </div>

            <div className="action-links" style={{margin: '2rem 0'}}>
                <Link to="/recruiter/post-internship" className="btn btn-primary">+ Post New Internship</Link>
                <Link to="/internships" className="btn btn-outline">Browse Internships</Link>
            </div>

            <div className="section" style={{padding: '0'}}>
                <div className="d-flex justify-between items-center" style={{marginBottom: '1.5rem'}}>
                    <h2 style={{fontSize: '1.5rem'}}>Your Internships</h2>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : internships.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                        <h3>No internships posted yet</h3>
                        <p>Post your first internship to start receiving applications.</p>
                        <Link to="/recruiter/post-internship" className="btn btn-primary">Post an Internship</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1" style={{gap: '1rem'}}>
                        {internships.map(int => (
                            <div key={int.internshipId} className="internship-card">
                                <div className="card-header">
                                    <div>
                                        <h3>{int.title}</h3>
                                        <div className="meta">
                                            <span><Icon name="location" size={14} /> {int.location}</span>
                                            <span><Icon name="work" size={14} /> {int.workType}</span>
                                            <span><Icon name="duration" size={14} /> {int.duration}</span>
                                            <span><Icon name="stipend" size={14} /> {int.stipend}</span>
                                        </div>
                                    </div>
                                    <span className="badge badge-info">{(appMap[int.internshipId] || []).length} Applications</span>
                                </div>
                                <div className="card-footer">
                                    <div className="pipeline">
                                        <span className="pipeline-step badge badge-warning">Applied: {(appMap[int.internshipId] || []).filter(a => a.status === 'APPLIED').length}</span>
                                        <span className="pipeline-arrow">→</span>
                                        <span className="pipeline-step badge badge-secondary">Shortlisted: {(appMap[int.internshipId] || []).filter(a => a.status === 'SHORTLISTED').length}</span>
                                        <span className="pipeline-arrow">→</span>
                                        <span className="pipeline-step badge badge-info">Interview: {(appMap[int.internshipId] || []).filter(a => a.status === 'INTERVIEW').length}</span>
                                    </div>
                                    <Link to="/recruiter/applicants" className="btn btn-outline btn-sm">Manage</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="section" style={{padding: '2rem 0'}}>
                <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>Recent Applications</h2>
                {internships.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon" style={{display:"inline-flex", justifyContent:"center"}}><Icon name="emptySearch" size={28} /></span>
                        <h3>No applications yet</h3>
                        <p>Applications will appear here once candidates apply.</p>
                    </div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Internship</th>
                                    <th>Status</th>
                                    <th>Applied</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allApps.slice(0, 20).map(app => (
                                    <tr key={app.applicationId}>
                                        <td><strong>{app.student?.user?.name || 'Student'}</strong></td>
                                        <td>{app.internship?.title}</td>
                                        <td><span className={`badge status-${app.status}`}>{app.status}</span></td>
                                        <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ''}</td>
                                        <td>
                                            <Link to={`/recruiter/candidate/${app.applicationId}`} className="btn btn-outline btn-sm">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{textAlign: 'center', padding: '2rem 0'}}>
                <button onClick={logout} className="btn btn-danger">Logout</button>
            </div>
        </div>
    );
};

export default CompanyDashboard;

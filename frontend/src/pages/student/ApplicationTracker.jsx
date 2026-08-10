import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { internshipAPI } from '../../api/internshipAPI';

const ApplicationTracker = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        internshipAPI.getMyApplications()
            .then(res => setApplications(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="dashboard">Loading...</div>;

    const statusColors = {
        APPLIED: '#ffc107', SHORTLISTED: '#17a2b8',
        INTERVIEW: '#007bff', SELECTED: '#28a745',
        REJECTED: '#dc3545', WITHDRAWN: '#6c757d'
    };

    return (
        <div className="dashboard">
            <h1>My Applications</h1>
            {applications.length === 0 ? <p>No applications yet.</p> : applications.map(app => (
                <div key={app.applicationId} className="internship-card">
                    <h3>{app.internship?.title}</h3>
                    <p>Company: {app.internship?.company?.companyName}</p>
                    <span style={{background: statusColors[app.status] || '#6c757d', color:'#fff', padding:'4px 12px', borderRadius:4}}>
                        {app.status}
                    </span>
                    <p style={{fontSize:13, color:'#888'}}>Applied: {app.appliedAt}</p>
                </div>
            ))}
        </div>
    );
};

export default ApplicationTracker;

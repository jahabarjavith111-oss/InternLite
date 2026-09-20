import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../api/studentAPI';
import { useAuth } from '../../context/AuthContext';

const StudentPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

    useEffect(() => {
        studentAPI.getStudentById(id).then(r => setProfile(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="dashboard"><div className="loading-spinner">Loading profile...</div></div>;
    if (!profile) return <div className="dashboard"><div className="empty-state"><h3>Student not found</h3></div></div>;

    return (
        <div className="dashboard animate-fade-in">
            <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
            <div className="card" style={{marginBottom: '1.5rem', padding: '2rem'}}>
                <div className="candidate-profile-header">
                    <div className="candidate-profile-avatar">{(profile.name || 'S').charAt(0)}</div>
                    <div className="candidate-profile-info">
                        <h1 style={{fontSize: '1.75rem'}}>{profile.name}</h1>
                        <p className="text-secondary">{[profile.degree, profile.branch].filter(Boolean).join(' • ')}</p>
                        <p className="text-muted" style={{fontSize: '0.9rem'}}>{profile.college || ''} {profile.location ? `• ${profile.location}` : ''}</p>
                    </div>
                </div>
                {profile.bio && <p className="text-secondary" style={{marginTop: '1rem', lineHeight: '1.7'}}>{profile.bio}</p>}
                <div className="skills-list" style={{marginTop: '1rem'}}>
                    {(profile.skills || []).map(s => <span key={s} className="skill-chip">{s}</span>)}
                </div>
                {isRecruiter && (profile.email || profile.phone) && (
                    <div className="card" style={{marginTop: '1.5rem', background: 'var(--bg-muted)'}}>
                        <h3 style={{fontSize: '1rem', marginBottom: '0.5rem'}}>Contact (recruiter view)</h3>
                        {profile.email && <div className="text-secondary">✉️ {profile.email}</div>}
                        {profile.phone && <div className="text-secondary">📞 {profile.phone}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPublicProfile;

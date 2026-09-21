import React, { useState, useEffect, useMemo } from 'react';
import { studentAPI } from '../../api/studentAPI';
import { skillAPI } from '../../api/skillAPI';
import { resumeAPI } from '../../api/resumeAPI';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ college: '', degree: '', branch: '', graduationYear: '', location: '', bio: '' });
    const [skills, setSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        studentAPI
            .getProfile()
            .then((res) => {
                const d = res.data || {};
                setProfile({
                    college: d.college || '',
                    degree: d.degree || '',
                    branch: d.branch || '',
                    graduationYear: d.graduationYear || '',
                    location: d.location || '',
                    bio: d.bio || '',
                });
            })
            .catch(() => {});
        studentAPI
            .getSkills()
            .then((res) => setSkills((Array.isArray(res.data) ? res.data : []).map((s) => s.skill?.skillId).filter(Boolean)))
            .catch(() => {});
        skillAPI
            .getAll()
            .then((res) => setAllSkills(Array.isArray(res.data) ? res.data : []))
            .catch(() => {});
        resumeAPI
            .getMyResumes()
            .then((res) => setResumes(Array.isArray(res.data) ? res.data : []))
            .catch(() => {});
    }, []);

    const completion = useMemo(() => {
        const fields = [profile.college, profile.degree, profile.branch, profile.location, profile.bio];
        const filled = fields.filter(Boolean).length;
        return Math.round(((filled + (skills.length ? 1 : 0) + (resumes.length ? 1 : 0)) / (fields.length + 2)) * 100);
    }, [profile, skills, resumes]);

    const handleChange = (field, value) => {
        setProfile({ ...profile, [field]: value });
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await studentAPI.updateProfile(profile);
            setSaved(true);
        } catch {
            /* ignore */
        } finally {
            setSaving(false);
        }
    };

    const toggleSkill = async (id) => {
        try {
            if (skills.includes(id)) {
                await studentAPI.removeSkill(id);
                setSkills(skills.filter((s) => s !== id));
            } else {
                await studentAPI.addSkill(id);
                setSkills([...skills, id]);
            }
        } catch {
            /* ignore */
        }
    };

    return (
        <div>
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.5rem' }}>
                <div className="avatar avatar-lg" style={{ margin: '0 auto 0.75rem', width: '4.5rem', height: '4.5rem', fontSize: '1.6rem' }} aria-hidden="true">
                    {(user?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <h1 style={{ fontSize: '1.5rem' }}>{user?.name || 'Student'}</h1>
                <p className="text-secondary">
                    {[profile.degree, profile.branch].filter(Boolean).join(' • ') || 'Add your headline'}
                </p>
                <p className="caption">{[profile.college, profile.location].filter(Boolean).join(' • ')}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="profile-completion" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Profile completion</strong>
                    <span className="text-secondary">{completion}%</span>
                </div>
                <div className="progress">
                    <div className="progress-fill" style={{ width: `${completion}%` }} />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                    About
                </h2>
                <textarea className="input textarea" placeholder="Tell recruiters about yourself…" value={profile.bio} onChange={(e) => handleChange('bio', e.target.value)} />
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                    Skills
                </h2>
                <div className="skills">
                    {allSkills.map((s) => (
                        <button
                            key={s.skillId}
                            type="button"
                            className={`skill${skills.includes(s.skillId) ? ' skill-highlight' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleSkill(s.skillId)}
                        >
                            {s.skillName}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                    Education
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input className="input" placeholder="College" value={profile.college} onChange={(e) => handleChange('college', e.target.value)} />
                    <input className="input" placeholder="Degree (e.g. B.E. Computer Science)" value={profile.degree} onChange={(e) => handleChange('degree', e.target.value)} />
                    <input className="input" placeholder="Branch" value={profile.branch} onChange={(e) => handleChange('branch', e.target.value)} />
                    <input className="input" placeholder="Graduation Year" value={profile.graduationYear} onChange={(e) => handleChange('graduationYear', e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                    Preferences
                </h2>
                <input className="input" placeholder="Preferred location" value={profile.location} onChange={(e) => handleChange('location', e.target.value)} />
            </div>

            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                    Resume
                </h2>
                {resumes.length === 0 ? (
                    <p className="text-secondary">No resume uploaded yet. Upload one from the dashboard to auto-attach on apply.</p>
                ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {resumes.map((r) => (
                            <li key={r.resumeId} className="skill" style={{ justifyContent: 'space-between', padding: '0.6rem 0.9rem' }}>
                                <span>{r.resumeName || `Resume ${r.resumeId}`}</span>
                                {r.default && <span className="badge badge-success">Default</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Profile saved' : 'Save Profile'}
            </button>
        </div>
    );
};

export default StudentProfile;

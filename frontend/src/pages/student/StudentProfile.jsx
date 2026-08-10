import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/studentAPI';
import { skillAPI } from '../../api/skillAPI';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ college: '', degree: '', branch: '', graduationYear: '', location: '', bio: '' });
    const [skills, setSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);

    useEffect(() => {
        studentAPI.getProfile().then(res => setProfile({
            college: res.data.college || '', degree: res.data.degree || '',
            branch: res.data.branch || '', graduationYear: res.data.graduationYear || '',
            location: res.data.location || '', bio: res.data.bio || ''
        })).catch(console.error);
        studentAPI.getSkills().then(res => setSkills(res.data.map(s => s.skill.skillId))).catch(console.error);
        skillAPI.getAll().then(res => setAllSkills(res.data)).catch(console.error);
    }, []);

    const handleChange = (field, value) => setProfile({ ...profile, [field]: value });
    const handleSave = () => studentAPI.updateProfile(profile).then(() => alert('Profile saved!')).catch(console.error);
    const toggleSkill = (id) => {
        if (skills.includes(id)) studentAPI.removeSkill(id).then(() => setSkills(skills.filter(s => s !== id)));
        else studentAPI.addSkill(id).then(() => setSkills([...skills, id]));
    };

    return (
        <div className="dashboard">
            <button onClick={() => navigate(-1)}>Back</button>
            <h1>My Profile</h1>
            <input placeholder="College" value={profile.college} onChange={e => handleChange('college', e.target.value)} />
            <input placeholder="Degree" value={profile.degree} onChange={e => handleChange('degree', e.target.value)} />
            <input placeholder="Branch" value={profile.branch} onChange={e => handleChange('branch', e.target.value)} />
            <input placeholder="Graduation Year" value={profile.graduationYear} onChange={e => handleChange('graduationYear', e.target.value)} />
            <input placeholder="Location" value={profile.location} onChange={e => handleChange('location', e.target.value)} />
            <textarea placeholder="Bio" value={profile.bio} onChange={e => handleChange('bio', e.target.value)} />
            <button onClick={handleSave}>Save Profile</button>
            <h2>Skills</h2>
            <div className="skills">{allSkills.map(s =>
                <span key={s.skillId} className="skill" style={{background: skills.includes(s.skillId) ? '#007bff' : '#e9ecef', color: skills.includes(s.skillId) ? '#fff' : '#333', cursor: 'pointer'}} onClick={() => toggleSkill(s.skillId)}>{s.skillName}</span>
            )}</div>
        </div>
    );
};

export default StudentProfile;

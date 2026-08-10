import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';
import { useAuth } from '../../context/AuthContext';

const InternshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [internship, setInternship] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        internshipAPI.getInternshipById(id)
            .then(res => setInternship(res.data))
            .catch(console.error);
    }, [id]);

    const handleApply = async () => {
        try {
            await internshipAPI.applyInternship(internship.internshipId, coverLetter, null);
            setApplied(true);
            alert('Application submitted!');
            navigate('/applications');
        } catch (err) {
            alert(err.response?.data || 'Failed to apply');
        }
    };

    if (!internship) return <div className="dashboard">Loading...</div>;

    return (
        <div className="dashboard">
            <button onClick={() => navigate(-1)} style={{marginBottom:15}}>Back</button>
            <div className="internship-card">
                <h1>{internship.title}</h1>
                <p><strong>{internship.company?.companyName}</strong> - {internship.location} - {internship.workType}</p>
                <p>Duration: {internship.duration} | Stipend: {internship.stipend}</p>
                <p>Deadline: {internship.applicationDeadline}</p>
                <p>Category: {internship.category?.categoryName}</p>
                <p style={{color:'#666'}}>{internship.description}</p>
                <div className="skills">
                    {internship.requiredSkills && internship.requiredSkills.split(',').map(s =>
                        <span key={s} className="skill">{s.trim()}</span>)}
                </div>
                {applied ? <p style={{color:'green'}}>Application submitted!</p> : (
                    <div style={{marginTop:20}}>
                        <textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)}
                            placeholder="Cover letter..." rows="4" style={{width:'100%',padding:10,marginBottom:10}} />
                        <br />
                        <button onClick={handleApply} style={{padding:'10px 20px',background:'#28a745',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Apply Now</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternshipDetail;

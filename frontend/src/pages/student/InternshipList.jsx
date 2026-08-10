import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { internshipAPI } from '../../api/internshipAPI';

const InternshipList = () => {
    const [internships, setInternships] = useState([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => { fetchInternships(); }, []);

    const fetchInternships = async () => {
        try {
            const res = await internshipAPI.getInternships({ keyword: search, location, category });
            setInternships(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchInternships();
    };

    return (
        <div className="dashboard">
            <h1>Find Internships</h1>
            <form onSubmit={handleFilter} style={{marginBottom:20}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Keywords" style={{padding:8,marginRight:8}} />
                <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" style={{padding:8,marginRight:8}} />
                <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" style={{padding:8,marginRight:8}} />
                <button type="submit" style={{padding:8,background:'#007bff',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Filter</button>
            </form>
            {internships.map(int => (
                <Link to={`/internships/${int.internshipId}`} key={int.internshipId} className="internship-card" style={{display:'block',textDecoration:'none',color:'inherit'}}>
                    <h3>{int.title}</h3>
                    <p>{int.company?.companyName} - {int.location} - {int.workType}</p>
                    <p>Duration: {int.duration} | Stipend: {int.stipend}</p>
                    <div className="skills">
                        {int.requiredSkills && int.requiredSkills.split(',').map(s => <span key={s} className="skill">{s.trim()}</span>)}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default InternshipList;

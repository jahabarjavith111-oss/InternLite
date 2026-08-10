import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { internshipAPI } from '../../api/internshipAPI';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [internships, setInternships] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        internshipAPI.getInternships({}).then(res => {
            setInternships(res.data);
            setFiltered(res.data);
        }).catch(console.error);
    }, []);

    const handleSearch = () => {
        let result = [...internships];
        if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
        if (location) result = result.filter(i => i.location && i.location.toLowerCase().includes(location.toLowerCase()));
        setFiltered(result);
    };

    return (
        <div className="dashboard">
            <h1>Welcome, {user?.name}</h1>
            <p style={{color:'#666'}}>Student Dashboard</p>

            <div className="search-bar" style={{margin:'20px 0'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search internships..." style={{padding:10,marginRight:10,width:200}} />
                <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" style={{padding:10,marginRight:10,width:150}} />
                <button onClick={handleSearch} style={{padding:10,background:'#007bff',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Search</button>
            </div>

            <Link to="/internships" style={{display:'inline-block',marginBottom:20}}>View All Internships</Link>
            <Link to="/profile" style={{display:'inline-block',marginBottom:20,marginLeft:20}}>My Profile</Link>

            <div className="stats">
                <div className="stat-card"><div className="num">{filtered.length}</div><div className="label">Internships Found</div></div>
                <div className="stat-card"><div className="num">{user?.role}</div><div className="label">Your Role</div></div>
            </div>

            <button onClick={logout} style={{marginTop:20,padding:10,background:'#dc3545',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Logout</button>
        </div>
    );
};

export default StudentDashboard;

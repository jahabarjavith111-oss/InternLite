import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav style={{background:'#fff', borderBottom:'1px solid #ddd', padding:'10px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:20}}>
                <Link to="/dashboard" style={{textDecoration:'none', color:'#333'}}>Dashboard</Link>
                <Link to="/internships" style={{textDecoration:'none', color:'#333'}}>Internships</Link>
                <Link to="/applications" style={{textDecoration:'none', color:'#333'}}>My Applications</Link>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:15}}>
                <span style={{color:'#666'}}>Hi, {user.name}</span>
                <button onClick={handleLogout} style={{padding:'6px 12px', background:'#dc3545', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;

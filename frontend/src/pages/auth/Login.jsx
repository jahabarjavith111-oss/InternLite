import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { friendlyError } from '../../api/api';

function Login() {
    const [email, setEmail] = useState('student@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const res = await login(email, password);
            const role = res?.data?.role || JSON.parse(localStorage.getItem('user') || '{}')?.role;
            if (role === 'RECRUITER') navigate('/recruiter/dashboard');
            else if (role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/student/dashboard');
        } catch (err) {
            setError(friendlyError(err, 'Invalid credentials'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem'}}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: 48, height: 48, background: 'linear-gradient(135deg, #5B4BFF 0%, #4438D6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '22px'}}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>Discover Internships. Build Experience.</p>
            </div>
            <h2>Welcome back</h2>
            {error && <div className="alert alert-danger" style={{marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger)'}}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label" htmlFor="email">Email</label>
                    <input id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required className="form-control" disabled={busy} />
                </div>
                <div className="form-group">
                    <label className="label" htmlFor="password">Password</label>
                    <input id="password" name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required className="form-control" disabled={busy} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={busy} style={{width: '100%'}}>{busy ? 'Logging in...' : 'Login'}</button>
            </form>
            <div className="auth-footer" style={{marginTop: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="auth-footer" style={{marginTop: '0.75rem', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                Don't have an account? <Link to="/register">Sign up</Link>
            </div>
        </div>
    );
};

export default Login;
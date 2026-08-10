import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('student@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="auth-container">
            <h2>InternLite Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input value={email} onChange={e => setEmail(e.target.value)}
                       type="email" placeholder="Email" required />
                <input value={password} onChange={e => setPassword(e.target.value)}
                       type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <p><Link to="/register">Don't have an account? Register</Link></p>
        </div>
    );
}

export default Login;

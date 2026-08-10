import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'STUDENT' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            navigate('/login');
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>InternLite Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" required />
                <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" required />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="STUDENT">Student</option>
                    <option value="RECRUITER">Recruiter</option>
                </select>
                <button type="submit">Register</button>
            </form>
            <p><Link to="/login">Already have an account? Login</Link></p>
        </div>
    );
}

export default Register;

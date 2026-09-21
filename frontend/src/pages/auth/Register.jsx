import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { sendOtp, verifyOtp } from '../../api/authAPI';
import { friendlyError } from '../../api/api';

function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'STUDENT' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = details, 2 = otp
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const errMsg = (err, fallback) => {
        const d = err.response?.data;
        return (typeof d === 'string' && d) || err.message || fallback;
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError(''); setInfo('');
        if (!form.email) { setError('Enter your email first.'); return; }
        setSending(true);
        try {
            const res = await sendOtp(form.email, form.name);
            setInfo(typeof res.data === 'string' ? res.data : 'OTP sent! Check your inbox for mail from InternLite (no-reply@internlite.com).');
            setStep(2);
            setCooldown(60);
        } catch (err) {
            setError(errMsg(err, 'Failed to send OTP'));
        } finally { setSending(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(''); setInfo('');
        if (otp.trim().length < 6) { setError('Enter the 6-digit code.'); return; }
        setVerifying(true);
        try {
            await verifyOtp(form.email, otp.trim());
            setVerified(true);
            setInfo('Email verified! Click Create Account to finish signup.');
        } catch (err) {
            setError(errMsg(err, 'Invalid or expired OTP'));
        } finally { setVerifying(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!verified) { setError('Please verify your email OTP first.'); setStep(2); return; }
        try {
            await register({ ...form, otp: otp.trim() });
            navigate('/login');
        } catch (err) {
            setError(errMsg(err, 'Registration failed'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem'}}>
                    <Logo size="lg" />
                </div>
                <h2>Create your account</h2>
                <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>Step {step} of 2: {step === 1 ? 'Your details' : 'Email verification'}</p>
                {error && <div className="alert alert-danger" style={{marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger)'}}>{error}</div>}
                {info && <div style={{color: 'var(--color-success)', background: 'var(--color-success-light)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem'}}>{info}</div>}

                {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label className="label" htmlFor="name">Full Name</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label className="label" htmlFor="email">Email</label>
                        <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label className="label" htmlFor="password">Password</label>
                        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label className="label" htmlFor="phone">Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label className="label" htmlFor="role">I am a...</label>
                        <select name="role" value={form.role} onChange={handleChange} className="form-control">
                            <option value="STUDENT">Student</option>
                            <option value="RECRUITER">Recruiter</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>{sending ? 'Sending OTP...' : 'Send OTP to Email'}</button>
                    <p className="text-muted" style={{fontSize: '0.8rem', marginTop: '0.75rem'}}>OTP is sent from <b>InternLite no-reply@internlite.com</b> (via our Gmail sender). Do not reply.</p>
                </form>
                )}

                {step === 2 && (
                <>
                    <form onSubmit={handleVerifyOtp} style={{marginBottom: '1rem'}}>
                        <div className="form-group">
                            <label className="label">OTP sent to {form.email}</label>
                            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" required className="form-control" style={{letterSpacing: '6px', textAlign: 'center', fontWeight: 800, fontSize: '1.2rem'}} inputMode="numeric" />
                        </div>
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                            <button type="submit" className="btn btn-outline" disabled={verifying}>{verifying ? 'Verifying...' : verified ? '✓ Verified' : 'Verify OTP'}</button>
                            <button type="button" className="btn btn-ghost btn-sm" disabled={sending || cooldown > 0} onClick={handleSendOtp}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Edit details</button>
                        </div>
                    </form>
                    <form onSubmit={handleSubmit}>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={!verified}>Create Account</button>
                        {!verified && <p className="text-muted" style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Verify the OTP above to enable this button.</p>}
                    </form>
                </>
                )}

                <div className="auth-footer" style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import { forgotPassword, resetPassword } from '../../api/authAPI';
import { friendlyError } from '../../api/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [busy, setBusy] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(''); setInfo('');
        setBusy(true);
        try {
            const res = await forgotPassword(email);
            setInfo(typeof res.data === 'string' ? res.data : 'If an account exists, a reset code has been sent.');
            setStep(2);
            setCooldown(60);
        } catch (err) {
            setError(friendlyError(err, 'Failed to send reset code'));
        } finally { setBusy(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError(''); setInfo('');
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setBusy(true);
        try {
            const res = await resetPassword(email, otp.trim(), newPassword);
            setInfo(typeof res.data === 'string' ? res.data : 'Password reset successful.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(friendlyError(err, 'Reset failed'));
        } finally { setBusy(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem'}}>
                    <Logo size="lg" />
                </div>
                <h2>Reset your password</h2>
                <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
                    {step === 1 ? 'Enter your account email to receive a reset code.' : `Enter the code sent to ${email} and choose a new password.`}
                </p>
                {error && <div style={{marginBottom: '1rem', padding: '0.75rem 1rem', background: 'var(--color-danger-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger)'}}>{error}</div>}
                {info && <div style={{color: 'var(--color-success)', background: 'var(--color-success-light)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem'}}>{info}</div>}

                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label className="label" htmlFor="fp-email">Email</label>
                            <input id="fp-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="form-control" disabled={busy} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={busy}>
                            {busy ? 'Sending...' : 'Send reset code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <>
                        <form onSubmit={handleReset}>
                            <div className="form-group">
                                <label className="label" htmlFor="fp-otp">Reset code</label>
                                <input id="fp-otp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" required className="form-control" style={{letterSpacing: '6px', textAlign: 'center', fontWeight: 800, fontSize: '1.2rem'}} inputMode="numeric" />
                            </div>
                            <div className="form-group">
                                <label className="label" htmlFor="fp-password">New password</label>
                                <input id="fp-password" type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="form-control" />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={busy}>
                                {busy ? 'Resetting...' : 'Reset password'}
                            </button>
                        </form>
                        <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap'}}>
                            <button type="button" className="btn btn-ghost btn-sm" disabled={busy || cooldown > 0} onClick={handleSendOtp}>
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep(1); setError(''); setInfo(''); }}>← Change email</button>
                        </div>
                    </>
                )}

                <div style={{marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                    <Link to="/login" className="btn btn-ghost btn-sm">← Back to login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

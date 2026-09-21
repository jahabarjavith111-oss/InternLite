import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    return (
        <div className="dashboard" style={{ maxWidth: 480, paddingTop: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Logo size="md" />
            </div>
            <div className="card">
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reset your password</h1>
                <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>
                    Enter your account email and we&apos;ll send you a reset link.
                </p>
                {sent ? (
                    <div className="badge badge-success" style={{ marginBottom: '1rem' }}>
                        ✓ If an account exists, a reset link was sent to {email}
                    </div>
                ) : null}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setSent(true);
                    }}
                >
                    <div className="form-group">
                        <label className="label" htmlFor="fp-email">
                            Email
                        </label>
                        <input
                            id="fp-email"
                            type="email"
                            required
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Send reset link
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link to="/login" className="btn btn-ghost btn-sm">
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

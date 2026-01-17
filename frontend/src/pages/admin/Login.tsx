import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import '../../styles/admin.css';

export function Login() {
    const { login, register, user, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in
    if (user && !loading) {
        navigate('/admin');
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (isRegister) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin">
                <div className="login-container">
                    <p className="muted">loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin">
            <div className="login-container">
                <h1 className="login-title mono">
                    {isRegister ? 'register' : 'login'}
                </h1>

                {error && (
                    <div className="login-error">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="admin-field">
                            <label className="admin-label" htmlFor="name">name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="admin-input"
                                required
                            />
                        </div>
                    )}

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="email">email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="admin-input"
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <label className="admin-label" htmlFor="password">password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="admin-input"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={submitting}
                        style={{ width: '100%', marginTop: 'var(--space-3)' }}
                    >
                        {submitting ? '...' : isRegister ? 'register' : 'login'}
                    </button>
                </form>

                <p className="muted" style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {isRegister ? 'have an account? login' : 'first time? register'}
                    </button>
                </p>
            </div>
        </div>
    );
}

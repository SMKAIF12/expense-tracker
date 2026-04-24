import React from 'react'
import { useState } from 'react';
const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // 
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Prevent multiple clicks 
        setError('');

        const endpoint = isLogin ? '/api/login' : '/api/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Authentication failed');

            // Save token and notify parent component
            localStorage.setItem('token', data.token);
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message); // 
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2>Expense Tracker Application</h2>
            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
                    <div className="card-body p-4">
                        <h2 className="card-title text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Email address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2" role="alert">
                                    <small>{error}</small>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    isLogin ? 'Login' : 'Register'
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <button
                                className="btn btn-link btn-sm text-decoration-none"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Auth
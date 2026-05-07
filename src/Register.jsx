import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { username, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        
        // Clear error when user starts typing again
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Client-side Validation
        if (password !== confirmPassword) {
            return setError("Passwords do not match!");
        }

        try {
            const response = await axios.post('https://expense-tracker-three-neon.vercel.app/user/register', {
                username,
                email,
                password
            });

            if (response.status === 201 || response.status === 200) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '450px' }}>
                <h2 className="text-center mb-4">Create Account</h2>
                
                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input 
                            type="text" 
                            name="username"
                            className="form-control" 
                            value={username}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            className="form-control" 
                            value={email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            className="form-control" 
                            value={password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            className="form-control" 
                            value={confirmPassword}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-2">
                        Register
                    </button>
                </form>
                
                <div className="text-center mt-3">
                    <small>Already have an account? <a href="/login">Login</a></small>
                </div>
            </div>
        </div>
    );
};

export default Register;
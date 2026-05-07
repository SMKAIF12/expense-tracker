import React, { useState } from 'react'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { Link, useLocation, useNavigate } from 'react-router';
const Login = () => {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const locate = useLocation();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://expense-tracker-bice-rho.vercel.app/user/login', {
                username: username,
                password: password
            })
            if (!response) {
                throw new Error('An unexpected error occured..');
            }
            await localStorage.setItem('authorization', response.data.token)
            navigate('/addexpense')
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            }
            else {
                console.log(error)
            }
        }
    }
    return (
        <>
            {
                locate.state && <h6 className='text text-danger'>{locate.state?.message}</h6>
            }
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '400px' }}>
                    <h3 className="text-center mb-4">Login</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">UserName</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Error Message Display */}
                        {error && <div className="alert alert-danger p-2 small">{error}</div>}

                        <button type="submit" className="btn btn-primary w-100 mt-2">
                            Sign In
                        </button>

                        <div className="text-center mt-3">
                            <small>Don't have an account? <Link to='/register'>Sign up</Link></small>
                        </div>
                    </form>
                </div>
            </div>

        </>

    )
}

export default Login
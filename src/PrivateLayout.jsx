import React from 'react'
import { useSelector } from 'react-redux'
import Auth from './Login';
import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
const PrivateLayout = () => {
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);
    const token = localStorage.getItem('authorization');

    useEffect(() => {
        const verifyUser = async () => {
            if (!token || token === "null") {
                navigate('/login', { state: { message: 'Please login to continue' } });
                return;
            }
            try {
                await axios.get('https://expense-tracker-bice-rho.vercel.app/user/auth', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setIsVerified(true);
            } catch (error) {
                console.error("Auth failed:", error);
                localStorage.removeItem('authorization');
                navigate('/login', { state: { message: 'Please login to continue' } });
            }
        };

        verifyUser();
    }, [navigate, token]);

    if (!isVerified) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

export default PrivateLayout
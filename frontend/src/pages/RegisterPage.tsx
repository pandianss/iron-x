import React, { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await client.post('/auth/register', { email, password, timezone });
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
                <h3 className="text-2xl font-bold text-center">Create an Account</h3>
                {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label className="block" htmlFor="email">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block">Timezone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={timezone}
                            disabled
                        />
                    </div>
                    <div className="flex items-baseline justify-between">
                        <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Register</button>
                        <Link to="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;

import React, { useState } from 'react';
import { AuthClient } from '../domain/auth';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await AuthClient.login(email, password, mfaRequired ? mfaToken : undefined);

            if (data.mfaRequired) {
                setMfaRequired(true);
                return;
            }

            login(data.token, data.user);
            navigate('/cockpit'); // Navigate to cockpit as primary view
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="px-10 py-10 mt-4 text-left bg-iron-900 border border-iron-800 shadow-2xl rounded-xl w-full max-w-md">
                <h3 className="text-3xl font-bold text-center text-white mb-6">Iron-X Internal</h3>
                {error && <div className="text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!mfaRequired ? (
                        <>
                            <div className="mt-4">
                                <label className="block text-iron-400 text-sm mb-1" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    placeholder="terminal@iron-x.internal"
                                    className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-iron-400 text-sm mb-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-iron-400 text-sm mb-1">2FA Code</label>
                            <input
                                type="text"
                                placeholder="000000"
                                className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg text-center tracking-widest text-2xl font-mono focus:outline-none focus:border-red-600 transition-colors"
                                value={mfaToken}
                                onChange={(e) => setMfaToken(e.target.value)}
                                required
                                autoFocus
                            />
                            <p className="text-iron-500 text-xs mt-2 text-center uppercase tracking-tighter">Enter the 6-digit code from your authenticator</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-8">
                        <button className="w-full px-6 py-3 text-white font-bold bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest">
                            {mfaRequired ? 'Verify & Enter' : 'Authorize'}
                        </button>
                        {!mfaRequired && (
                            <Link to="/register" className="text-xs text-iron-500 hover:text-white text-center transition-colors uppercase">
                                New User? Register Access
                            </Link>
                        )}
                        {mfaRequired && (
                            <button
                                type="button"
                                onClick={() => setMfaRequired(false)}
                                className="text-xs text-iron-500 hover:text-white text-center transition-colors uppercase"
                            >
                                Back to Password
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { AuthClient } from '../domain/auth';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [orgName, setOrgName] = useState('');
    const [orgSlug, setOrgSlug] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await AuthClient.register({
                email,
                password,
                timezone,
                orgName: orgName || undefined,
                orgSlug: orgSlug || undefined
            });
            login(data.token, data.user);
            navigate('/cockpit');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.message || 'Registration failed';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="px-10 py-10 my-8 text-left bg-iron-900 border border-iron-800 shadow-2xl rounded-xl w-full max-w-md">
                <h3 className="text-3xl font-bold text-center text-white mb-2">Initialize Personnel</h3>
                <p className="text-iron-500 text-center text-xs uppercase tracking-widest mb-8">Access Level: NEW_ENTRY</p>

                {error && <div className="text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-iron-400 text-xs uppercase mb-1">Email Identifier</label>
                            <input
                                type="email"
                                placeholder="operator@iron-x.internal"
                                className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-iron-400 text-xs uppercase mb-1">Security Credential</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-4 border-t border-iron-800">
                            <p className="text-iron-500 text-[10px] uppercase font-bold mb-4 tracking-tighter">Organization Configuration (Optional)</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-iron-400 text-xs uppercase mb-1">Organization Name</label>
                                    <input
                                        type="text"
                                        placeholder="Iron-X Core"
                                        className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
                                        value={orgName}
                                        onChange={(e) => {
                                            setOrgName(e.target.value);
                                            setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-iron-400 text-xs uppercase mb-1">Organization Slug</label>
                                    <input
                                        type="text"
                                        placeholder="iron-x-core"
                                        className="w-full px-4 py-3 bg-black border border-iron-800 text-white rounded-lg focus:outline-none focus:border-red-600 transition-colors font-mono text-sm"
                                        value={orgSlug}
                                        onChange={(e) => setOrgSlug(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-iron-400 text-xs uppercase mb-1">Timezone Context</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-black border border-iron-800 text-iron-600 rounded-lg cursor-not-allowed font-mono text-xs"
                                value={timezone}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                        <button className="w-full px-6 py-3 text-white font-bold bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest">
                            Initialize Account
                        </button>
                        <Link to="/login" className="text-xs text-iron-500 hover:text-white text-center transition-colors uppercase">
                            Already Authorized? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};


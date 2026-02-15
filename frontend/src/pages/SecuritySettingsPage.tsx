import React, { useState, useEffect } from 'react';
import { setupMFA, verifyMFA, disableMFA, getProfile } from '../api/client';

const SecuritySettingsPage: React.FC = () => {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [showDisable, setShowDisable] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const profile = await getProfile();
            setMfaEnabled(profile.mfa_enabled);
        } catch (err: any) {
            setError('Failed to fetch profile settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupInit = async () => {
        setError('');
        try {
            const data = await setupMFA();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setShowSetup(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'MFA setup failed');
        }
    };

    const handleVerifyAndEnable = async () => {
        setError('');
        try {
            await verifyMFA(token);
            setMfaEnabled(true);
            setShowSetup(false);
            setSuccess('MFA enabled successfully');
            setToken('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleDisable = async () => {
        setError('');
        try {
            await disableMFA(password);
            setMfaEnabled(false);
            setShowDisable(false);
            setSuccess('MFA disabled successfully');
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Disable failed');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Security Parameters...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter">Security Protocols</h1>
                <p className="text-zinc-500 mb-8 border-b border-zinc-800 pb-4">Manage access controls and multi-factor authentication.</p>

                {error && <div className="bg-red-900/20 border border-red-900/50 p-4 rounded mb-6 text-red-400">{error}</div>}
                {success && <div className="bg-green-900/20 border border-green-900/50 p-4 rounded mb-6 text-green-400">{success}</div>}

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Multi-Factor Authentication (TOTP)</h2>
                            <p className="text-sm text-zinc-500">Protect your account with a secondary verification layer.</p>
                        </div>
                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${mfaEnabled ? 'bg-green-950 text-green-500 border border-green-900' : 'bg-red-950 text-red-500 border border-red-900'}`}>
                            {mfaEnabled ? 'Active' : 'Missing'}
                        </div>
                    </div>

                    {!mfaEnabled ? (
                        <>
                            {!showSetup ? (
                                <button
                                    onClick={handleSetupInit}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors uppercase tracking-widest text-sm"
                                >
                                    Initialize MFA
                                </button>
                            ) : (
                                <div className="mt-6 border-t border-zinc-800 pt-6 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-lg font-bold mb-4">Setup Authenticator</h3>
                                    <div className="flex flex-col md:flex-row gap-8 items-center bg-black p-6 rounded-lg border border-zinc-800">
                                        <div className="bg-white p-2 rounded">
                                            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-zinc-400 text-sm mb-4">1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                                            <p className="text-zinc-400 text-sm mb-4">2. Enter the 6-digit verification code generated by the app.</p>
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="000 000"
                                                    className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded text-center tracking-[0.5em] text-xl font-mono focus:border-red-600 outline-none"
                                                    value={token}
                                                    onChange={(e) => setToken(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleVerifyAndEnable}
                                                    className="flex-1 bg-white text-black font-bold py-2 rounded uppercase tracking-widest text-xs hover:bg-zinc-200"
                                                >
                                                    Confirm & Enable
                                                </button>
                                                <button
                                                    onClick={() => setShowSetup(false)}
                                                    className="px-4 py-2 text-zinc-500 hover:text-white uppercase tracking-widest text-xs"
                                                >
                                                    Abort
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-600 text-xs mt-4">Manual Secret: <code className="bg-zinc-800 px-1 rounded">{secret}</code></p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {!showDisable ? (
                                <button
                                    onClick={() => setShowDisable(true)}
                                    className="px-6 py-2 border border-zinc-700 hover:border-red-600 hover:text-red-500 text-zinc-400 font-bold rounded transition-all uppercase tracking-widest text-sm"
                                >
                                    Deactivate MFA
                                </button>
                            ) : (
                                <div className="mt-6 border-t border-zinc-800 pt-6 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-lg font-bold mb-2 text-red-500">Deactivation Sequence</h3>
                                    <p className="text-zinc-400 text-sm mb-4">Confirm your identity to disable multi-factor authentication.</p>
                                    <div className="max-w-sm">
                                        <input
                                            type="password"
                                            placeholder="Verify Password"
                                            className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded mb-4 focus:border-red-600 outline-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleDisable}
                                                className="flex-1 bg-red-600 text-white font-bold py-2 rounded uppercase tracking-widest text-xs hover:bg-red-700"
                                            >
                                                Execute Deactivation
                                            </button>
                                            <button
                                                onClick={() => setShowDisable(false)}
                                                className="px-4 py-2 text-zinc-500 hover:text-white uppercase tracking-widest text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-12 opacity-30 pointer-events-none">
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Internal Access Logs</h2>
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 text-[10px] font-mono border-t border-zinc-900 py-2">
                                <span className="text-green-500">2026-02-15 11:24:{i}</span>
                                <span className="text-zinc-400">LOGIN_SUCCESS</span>
                                <span className="text-zinc-600 text-right flex-1">IP: 127.0.0.1</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsPage;

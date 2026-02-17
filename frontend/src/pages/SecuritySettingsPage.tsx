import React, { useState, useEffect } from 'react';
import { SecurityClient } from '../domain/security';
import { AuthClient } from '../domain/auth';

export default function SecuritySettingsPage() {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [deactivationToken, setDeactivationToken] = useState('');
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
            const profile = await AuthClient.getProfile();
            setMfaEnabled(profile.mfa_enabled);
        } catch {
            setError('CRITICAL: SEC_PARAM_FETCH_FAILURE');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupInit = async () => {
        setError('');
        setSuccess('');
        try {
            const data = await SecurityClient.setupMFA();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setShowSetup(true);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.message || 'MFA_INIT_ERROR';
            setError(errorMessage);
        }
    };

    const handleVerifyAndEnable = async () => {
        setError('');
        try {
            await SecurityClient.verifyMFA(token, secret);
            setMfaEnabled(true);
            setShowSetup(false);
            setSuccess('PROTOCOL_ENABLED: MFA_LAYER_ACTIVE');
            setToken('');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.message || 'VERIFICATION_FAILURE';
            setError(errorMessage);
        }
    };

    const handleDisable = async () => {
        setError('');
        try {
            await SecurityClient.disableMFA(password, deactivationToken);
            setMfaEnabled(false);
            setShowDisable(false);
            setSuccess('PROTOCOL_DEACTIVATED: MFA_LAYER_OFFLINE');
            setPassword('');
            setDeactivationToken('');
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.message || 'DEACTIVATION_REJECTED';
            setError(errorMessage);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-iron-950 flex items-center justify-center font-mono text-iron-500 uppercase tracking-widest animate-pulse">
            INITIALIZING_SECURITY_SUBSYSTEM...
        </div>
    );

    return (
        <div className="min-h-screen bg-iron-950 text-iron-300 font-sans selection:bg-amber-900 selection:text-amber-100 p-8 infrastructure-bg">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-4 border-l-2 border-iron-800 pl-6">
                    <h1 className="text-5xl font-display font-black text-white tracking-tighter uppercase">Security_Protocols</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-iron-500 font-mono text-xs uppercase tracking-widest italic">Node Protection & Access Control Management</p>
                        <div className="h-px flex-1 bg-iron-900"></div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-950/20 border-y border-red-900/50 p-4 font-mono text-xs text-red-500 flex items-center gap-3 animate-in fade-in duration-300">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        [ERROR] {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-950/20 border-y border-green-900/50 p-4 font-mono text-xs text-green-500 flex items-center gap-3 animate-in fade-in duration-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        [STATUS] {success}
                    </div>
                )}

                {/* MFA Section */}
                <div className="bg-black/40 border border-iron-900 glass-panel hardened-border p-8 relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[80px] font-black -mr-4 -mt-4 selection:bg-transparent pointer-events-none tracking-tighter">
                        MFA
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between border-b border-iron-900 pb-6">
                            <div className="space-y-1">
                                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Multi-Factor Authentication (TOTP)</h2>
                                <p className="text-xs text-iron-500 font-mono uppercase tracking-widest italic">Secondary Verification Layer Layer Integration</p>
                            </div>
                            <div className={`px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] border ${mfaEnabled ? 'bg-green-950/50 text-green-400 border-green-800' : 'bg-red-950/50 text-red-400 border-red-800'}`}>
                                {mfaEnabled ? 'STATUS: ACTIVE' : 'STATUS: INACTIVE'}
                            </div>
                        </div>

                        {!mfaEnabled ? (
                            <>
                                {!showSetup ? (
                                    <div className="space-y-6">
                                        <p className="text-sm text-iron-400 leading-relaxed font-mono max-w-xl">
                                            Requirement for high-assurance node operations. Enabling TOTP will mandate a secondary verification token for every login and administrative mutation.
                                        </p>
                                        <button
                                            onClick={handleSetupInit}
                                            className="px-8 py-3 bg-white text-black font-display font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-95"
                                        >
                                            Initialize_Handshake
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-iron-950/50 border border-iron-800 p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="bg-white p-3 rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 duration-500">
                                                    <img src={qrCode} alt="TOTP_QR_CODE" className="w-48 h-48 grayscale hover:grayscale-0 transition-all duration-700" />
                                                </div>
                                                <div className="text-[10px] font-mono text-iron-600 uppercase tracking-widest">
                                                    Handshake_Secret: <span className="text-iron-400 select-all">{secret}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-5 h-5 flex items-center justify-center border border-iron-800 rounded font-mono text-[10px] text-iron-500">01</span>
                                                        <p className="text-[11px] font-mono text-iron-400 uppercase tracking-wider">Sync Token with Authenticator App</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-5 h-5 flex items-center justify-center border border-iron-800 rounded font-mono text-[10px] text-iron-500">02</span>
                                                        <p className="text-[11px] font-mono text-iron-400 uppercase tracking-wider">Inject 6-Digit Verification Pulse</p>
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        placeholder="VERIFY_CODE"
                                                        className="w-full bg-black border border-iron-800 text-white px-6 py-4 font-mono text-3xl font-black text-center tracking-[0.5em] focus:border-white focus:outline-none transition-all duration-300 placeholder:text-iron-900 selection:bg-red-900"
                                                        value={token}
                                                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                                    />
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        onClick={handleVerifyAndEnable}
                                                        disabled={token.length !== 6}
                                                        className="flex-1 bg-white text-black font-display font-black py-4 uppercase tracking-widest text-xs hover:bg-green-600 hover:text-white transition-all duration-300 disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black cursor-pointer disabled:cursor-not-allowed"
                                                    >
                                                        Confirm_Protocol
                                                    </button>
                                                    <button
                                                        onClick={() => setShowSetup(false)}
                                                        className="px-6 py-4 border border-iron-800 text-iron-600 font-mono uppercase tracking-widest text-[10px] hover:bg-red-950/20 hover:text-red-500 hover:border-red-900/50 transition-all duration-300"
                                                    >
                                                        Abort
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {!showDisable ? (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-green-950/10 border border-green-900/20 flex gap-4 items-start">
                                            <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 animate-ping"></div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-mono text-green-400 uppercase tracking-widest font-bold">Protocol_Active</p>
                                                <p className="text-[11px] text-iron-500 font-mono leading-relaxed">
                                                    Every administrative action now requires a verified TOTP challenge. This node is protected by current governance standards.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowDisable(true)}
                                            className="px-8 py-3 border border-iron-800 text-iron-500 font-display font-black uppercase tracking-widest text-xs hover:border-red-900 hover:text-red-500 transition-all duration-300 group-hover:border-iron-700"
                                        >
                                            Initiate_Deactivation
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-red-950/5 border border-red-900/20 p-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-display font-black text-red-500 uppercase tracking-tighter">Deactivation_Inbound</h3>
                                            <p className="text-xs text-iron-500 font-mono leading-relaxed max-w-xl">
                                                You are attempting to downgrade this node's security state. This requires double-gate verification: Your master password and a final TOTP pulse.
                                            </p>
                                        </div>

                                        <div className="max-w-md space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-mono text-iron-600 uppercase tracking-[0.2em]">Master_Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-black border border-iron-900 text-white px-4 py-3 font-mono text-sm focus:border-red-600 focus:outline-none transition-all duration-300"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-mono text-iron-600 uppercase tracking-[0.2em]">Current_TOTP_Token</label>
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    className="w-full bg-black border border-iron-900 text-white px-4 py-3 font-mono text-sm focus:border-red-600 focus:outline-none transition-all duration-300"
                                                    value={deactivationToken}
                                                    onChange={(e) => setDeactivationToken(e.target.value.replace(/\D/g, ''))}
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    onClick={handleDisable}
                                                    className="flex-1 bg-red-600 text-white font-display font-black py-4 uppercase tracking-widest text-xs hover:bg-red-700 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                                >
                                                    Execute_Offline_Transition
                                                </button>
                                                <button
                                                    onClick={() => setShowDisable(false)}
                                                    className="px-6 py-4 border border-iron-800 text-iron-600 font-mono uppercase tracking-widest text-[10px] hover:bg-iron-900/50 hover:text-white transition-all duration-300"
                                                >
                                                    Abort_Sequence
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Deco */}
                <div className="opacity-10 pointer-events-none space-y-4">
                    <div className="h-px bg-iron-800 w-full"></div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-iron-500 uppercase tracking-[0.3em]">
                        <span>SEC_CORE: VER_3.12.0_MFA</span>
                        <span>IRON-X SYSTEM GOVERNANCE</span>
                        <span>LAST_AUDIT: {new Date().toISOString().split('T')[0]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


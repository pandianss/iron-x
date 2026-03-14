import React, { useState, useEffect } from 'react';
import { 
    Code2, 
    Plus, 
    Trash2, 
    Copy, 
    Check, 
    Clock, 
    ShieldAlert, 
    Key, 
    ExternalLink, 
    Lock,
    X,
    Loader2,
    Shield
} from 'lucide-react';
import { IntegrationClient } from '../domain/integration';
import { BillingClient, Subscription } from '../domain/billing';

const ApiKeysPage: React.FC = () => {
    const [keys, setKeys] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subData, keysData] = await Promise.all([
                BillingClient.getSubscription(),
                IntegrationClient.getApiKeys()
            ]);
            setSubscription(subData);
            setKeys(keysData);
        } catch (err) {
            console.error('Failed to load developer data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName) return;
        setCreating(true);
        setError(null);
        try {
            const result = await IntegrationClient.generateApiKey(newKeyName);
            setShowKeyModal(result.key);
            setKeys([result, ...keys]);
            setNewKeyName('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create API key.');
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        try {
            await IntegrationClient.revokeApiKey(keyId);
            setKeys(keys.map(k => k.key_id === keyId ? { ...k, is_active: false } : k));
        } catch (err) {
            alert('Failed to revoke key.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const planTier = subscription?.plan_tier || 'FREE';
    const isLocked = planTier === 'FREE';

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
                <div className="max-w-md w-full border border-iron-800 bg-[#0A0A0A] p-10 text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                    <Lock size={48} className="mx-auto text-blue-600 mb-4" />
                    <div className="space-y-4">
                        <h1 className="text-xl font-display font-black tracking-tighter uppercase italic text-white flex items-center justify-center gap-2">
                            DEVELOPER_API // LOCKED
                        </h1>
                        <p className="text-xs text-iron-500 leading-relaxed uppercase">
                            API access is an OPERATOR feature. 
                            Build fitness trackers, productivity bots, or parental controls powered by Iron-X.
                        </p>
                    </div>
                    <button className="w-full bg-white text-black p-4 font-black uppercase tracking-tighter italic flex items-center justify-center gap-2 hover:bg-iron-200 transition-colors">
                        Activate_OPERATOR_Node <ExternalLink size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-iron-300 font-mono p-4 md:p-8 space-y-12 pb-24">
            <header className="border-b border-iron-800 pb-8 space-y-4">
                <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
                    <Code2 size={14} /> Developer_Access_Layer_v1.0
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        API_Key_Management
                    </h1>
                    <div className="text-[10px] text-iron-600 uppercase tracking-widest bg-iron-900 border border-iron-800 px-3 py-1">
                        Node_Status: SECURE // {planTier} Tier
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-iron-900 pb-2">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Key size={14} /> Your_API_Keys
                            </h2>
                            <span className="text-[10px] text-iron-600 uppercase">
                                {keys.length} / {planTier === 'TEAM_ENTERPRISE' ? 10 : 1} Keys Used
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] text-iron-600 uppercase tracking-widest border-b border-iron-900">
                                        <th className="py-4 font-bold">Name</th>
                                        <th className="py-4 font-bold">Key_Preview</th>
                                        <th className="py-4 font-bold">Created</th>
                                        <th className="py-4 font-bold">Usage</th>
                                        <th className="py-4 font-bold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px]">
                                    {keys.map(k => (
                                        <tr key={k.key_id} className="border-b border-iron-950 group">
                                            <td className="py-4 text-white font-bold">{k.name}</td>
                                            <td className="py-4 font-mono text-iron-500">{k.key_preview}</td>
                                            <td className="py-4 text-iron-600 uppercase">{new Date(k.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 text-iron-500">
                                                {k.call_count} / {k.monthly_limit} calls
                                            </td>
                                            <td className="py-4 text-right">
                                                {k.is_active ? (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="text-green-500 font-bold uppercase tracking-tighter">Active</span>
                                                        <button 
                                                            onClick={() => handleRevoke(k.key_id)}
                                                            className="p-1 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Revoke Key"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-iron-700 font-bold uppercase tracking-tighter">Revoked</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {keys.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-iron-700 italic">No API keys generated.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-[#0A0A0A] border border-iron-900 p-8 space-y-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest italic flex items-center gap-2">
                             Quick_Start_Guide
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] text-iron-500 uppercase tracking-tight">Endpoint: GET https://api.iron-x.com/api/v1/user/{"{userId}"}/score</p>
                                <div className="bg-black p-4 border border-iron-900 font-mono text-[10px] text-blue-400 overflow-x-auto">
                                    curl -H "X-API-KEY: sk_live_..." https://api.iron-x.com/api/v1/user/123/score
                                </div>
                            </div>
                            <button className="text-[9px] text-blue-500 uppercase font-black tracking-widest hover:text-blue-400 flex items-center gap-1">
                                Full_API_Documentation <ExternalLink size={10} />
                            </button>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-[#0A0A0A] border border-iron-800 p-6 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Plus size={48} className="text-white" />
                        </div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-iron-900 pb-4">
                            Generate_New_Key
                        </h2>
                        
                        <form onSubmit={handleCreateKey} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] text-iron-600 uppercase font-bold">Key_Label_Name:</label>
                                <input 
                                    type="text" 
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g. Production Mobile App"
                                    className="w-full bg-black border border-iron-800 p-3 text-[11px] text-white focus:border-blue-600 focus:outline-none transition-colors"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={creating || !newKeyName}
                                className="w-full bg-white text-black p-4 font-black uppercase tracking-tighter italic flex items-center justify-center gap-2 hover:bg-iron-200 disabled:opacity-50 transition-all"
                            >
                                {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Generate_Key
                            </button>
                        </form>

                        {error && (
                            <div className="p-3 border border-red-900 bg-red-950/20 text-red-500 text-[10px] font-bold uppercase flex items-center gap-2">
                                <ShieldAlert size={12} /> {error}
                            </div>
                        )}
                        
                        <div className="p-4 bg-iron-900/30 border border-iron-800/50 text-[9px] leading-relaxed text-iron-600 uppercase italic">
                            // KEYS ARE HASHED VIA SHA-256. 
                            // ONCE GENERATED, THE RAW KEY CANNOT BE RECOVERED.
                        </div>
                    </section>
                </div>
            </div>

            {/* One-time Key Reveal Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="max-w-xl w-full border border-iron-800 bg-[#0A0A0A] p-10 space-y-8 relative shadow-[0_0_50px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                    <ShieldAlert size={14} /> Security_Warning
                                </div>
                                <h2 className="text-xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                                    One-Time_Key_Reveal
                                </h2>
                            </div>
                            <button onClick={() => setShowKeyModal(null)} className="text-iron-600 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-[11px] text-iron-500 uppercase leading-relaxed border-l-2 border-red-600 pl-4 py-1">
                            STORE THIS KEY SECURELY. IT WILL NOT BE SHOWN AGAIN. 
                            IF LOST, YOU MUST REVOKE AND GENERATE A NEW ONE.
                        </p>

                        <div className="relative group">
                            <div className="bg-black border border-iron-800 p-6 font-mono text-xs text-blue-400 break-all pr-20 select-all">
                                {showKeyModal}
                            </div>
                            <button 
                                onClick={() => copyToClipboard(showKeyModal)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 font-black text-[10px] uppercase tracking-tighter italic flex items-center gap-2 hover:bg-iron-200 transition-colors"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied' : 'Copy_Key'}
                            </button>
                        </div>

                        <button 
                            onClick={() => setShowKeyModal(null)}
                            className="w-full bg-iron-900 text-white p-4 font-black uppercase tracking-tighter italic flex items-center justify-center gap-2 hover:bg-iron-800 transition-colors"
                        >
                            I_Have_Saved_This_Key
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiKeysPage;

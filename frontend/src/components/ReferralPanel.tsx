
import { useState, useEffect } from 'react';
import { api } from '../domain/api';
import { Copy, Check, Users, Gift, Loader2 } from 'lucide-react';

export default function ReferralPanel() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/referral/me');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch referral stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const copyToClipboard = () => {
        const url = `${window.location.origin}/register?ref=${stats.referral_code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-iron-950/20 border border-iron-900 p-4 lg:p-8 hardened-border font-mono relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Gift size={80} />
            </div>

            <div className="flex items-center gap-3 mb-8 text-iron-500">
                <Users size={18} />
                <span className="text-xs uppercase tracking-[0.3em]">Referral Cluster // Protocol V1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-2">Build Your Sub-Network</h3>
                        <p className="text-[10px] text-iron-600 uppercase leading-relaxed">
                            Expand the Iron-X reach. For every operator you initialize into the system, gain operational credits.
                        </p>
                    </div>

                    <div className="p-6 bg-black border border-iron-900 space-y-4">
                        <div className="text-[9px] text-iron-700 uppercase tracking-widest">Your Deployment Link</div>
                        <div className="flex gap-2">
                            <code className="bg-iron-950 px-3 py-2 text-xs flex-grow border border-iron-900 text-iron-400">
                                {stats?.referral_code}
                            </code>
                            <button 
                                onClick={copyToClipboard}
                                className="bg-white text-black p-2 hover:bg-neutral-200 transition-colors"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border border-iron-900 bg-iron-950/30 flex flex-col justify-between">
                        <div className="text-[8px] text-iron-700 uppercase tracking-widest mb-1">Nodes Referred</div>
                        <div className="text-3xl font-display font-black">{stats?.referral_count}</div>
                    </div>
                    <div className="p-6 border border-iron-900 bg-iron-950/30 flex flex-col justify-between">
                        <div className="text-[8px] text-iron-700 uppercase tracking-widest mb-1">Active Operators</div>
                        <div className="text-3xl font-display font-black text-green-500">{stats?.active_referrals}</div>
                    </div>
                    <div className="col-span-2 p-6 border border-iron-900 bg-iron-950/30 flex items-center justify-between">
                        <div>
                            <div className="text-[8px] text-iron-700 uppercase tracking-widest mb-1">Governance Points</div>
                            <div className="text-xl font-display font-black uppercase">Level {Math.floor(stats?.reward_points / 1000) + 1}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-display font-black text-white">{stats?.reward_points} pts</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { Shield, Award, Activity, Copy, Check, ExternalLink } from 'lucide-react';

interface PublicProfile {
    username: string;
    score: number;
    classification: string;
    trust_tier: string;
    member_since: string;
    score_history: { score: number; date: string }[];
}

const PublicProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/u/${username}`);
                setProfile(response.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Profile not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-iron-500 uppercase tracking-widest">
            [ Syncing Discipline Data... ]
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-display font-black text-white uppercase mb-4">404_NODE_NOT_FOUND</h1>
            <p className="text-iron-600 font-mono text-sm uppercase tracking-widest mb-8">
                {error || 'The requested profile does not exist or is set to private.'}
            </p>
            <Link to="/" className="text-iron-400 hover:text-white font-mono text-xs uppercase tracking-[0.3em] border border-iron-800 px-6 py-2">
                [ Return to Origin ]
            </Link>
        </div>
    );

    const tierColors: Record<string, string> = {
        PROVISIONAL: 'text-neutral-500 border-neutral-800 bg-neutral-900/20',
        STANDARD: 'text-blue-500 border-blue-900/40 bg-blue-900/10',
        TRUSTED: 'text-teal-500 border-teal-900/40 bg-teal-900/10',
        AUTONOMOUS: 'text-amber-500 border-amber-900/40 bg-amber-900/10'
    };

    const classificationColors: Record<string, string> = {
        HIGH_RELIABILITY: 'text-green-500 border-green-900/40 bg-green-900/10',
        STABLE: 'text-blue-500 border-blue-900/40 bg-blue-900/10',
        RECOVERING: 'text-amber-500 border-amber-900/40 bg-amber-900/10',
        UNRELIABLE: 'text-red-500 border-red-900/40 bg-red-900/10'
    };

    const badgeUrl = `http://localhost:3000/api/u/${username}/badge.svg`;
    const markdownSnippet = `![Iron-X Discipline Badge](${badgeUrl})`;
    const htmlSnippet = `<img src="${badgeUrl}" alt="Iron-X Discipline Badge" />`;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black p-8 md:p-12 infrastructure-bg">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-iron-900 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 text-iron-600 font-mono text-[10px] uppercase tracking-[0.4em] mb-4">
                            <Shield size={12} /> Verified Operator Node
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none">
                            {username}<span className="text-iron-700">.</span>X
                        </h1>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-mono text-iron-700 uppercase tracking-widest mb-1">
                            Operational Since
                        </div>
                        <div className="text-xs font-mono text-iron-400">
                            {new Date(profile.member_since).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Panel: Score Meter */}
                    <div className="md:col-span-1 bg-iron-950/20 border border-iron-900 p-8 flex flex-col items-center justify-center text-center relative hardened-border overflow-hidden">
                         <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full -rotate-90">
                                <circle 
                                    cx="96" cy="96" r="80" 
                                    className="stroke-iron-900 fill-none" 
                                    strokeWidth="8" 
                                />
                                <circle 
                                    cx="96" cy="96" r="80" 
                                    className="stroke-white fill-none transition-all duration-1000" 
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 80}`}
                                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - profile.score / 100)}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-display font-black tracking-tighter">{profile.score}</span>
                                <span className="text-[10px] font-mono text-iron-500 uppercase tracking-[0.3em]">Aggregate</span>
                            </div>
                        </div>
                        <h3 className="text-xs font-mono text-iron-500 uppercase tracking-widest mb-6">Discipline Score</h3>
                        
                        <div className="w-full space-y-3">
                            <div className={`w-full py-2 border px-4 flex justify-between items-center ${tierColors[profile.trust_tier]}`}>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Trust Tier</span>
                                <span className="text-[10px] font-bold uppercase">{profile.trust_tier}</span>
                            </div>
                            <div className={`w-full py-2 border px-4 flex justify-between items-center ${classificationColors[profile.classification]}`}>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Class</span>
                                <span className="text-[10px] font-bold uppercase">{profile.classification.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Sparkline */}
                    <div className="md:col-span-2 bg-iron-950/20 border border-iron-900 p-8 hardened-border">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-mono text-iron-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} /> 30-Day Trajectory
                            </h3>
                            <Award className="text-iron-800" size={20} />
                        </div>
                        
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={profile.score_history}>
                                    <XAxis dataKey="date" hide />
                                    <YAxis domain={[0, 100]} hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '0', color: '#888', fontSize: '10px', fontFamily: 'monospace' }}
                                        labelStyle={{ display: 'none' }}
                                        formatter={(val: number | undefined) => [val !== undefined ? `SCORE: ${val}` : '', '']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#fff" 
                                        strokeWidth={2} 
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 pt-8 border-t border-iron-900/50">
                            <h4 className="text-[10px] font-mono text-iron-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ExternalLink size={12} /> Embed Resilience Badge
                            </h4>
                            
                            <div className="space-y-4">
                               <div className="group relative">
                                    <div className="text-[8px] font-mono text-iron-700 uppercase mb-1">Markdown</div>
                                    <div className="bg-black border border-iron-900 p-3 flex justify-between items-center">
                                        <code className="text-[10px] font-mono text-iron-400 truncate mr-4 italic">{markdownSnippet}</code>
                                        <button 
                                            onClick={() => copyToClipboard(markdownSnippet, 'md')}
                                            className="text-iron-600 hover:text-white transition-colors"
                                        >
                                            {copied === 'md' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                               </div>

                               <div className="group relative">
                                    <div className="text-[8px] font-mono text-iron-700 uppercase mb-1">HTML Embed</div>
                                    <div className="bg-black border border-iron-900 p-3 flex justify-between items-center">
                                        <code className="text-[10px] font-mono text-iron-400 truncate mr-4 italic">{htmlSnippet}</code>
                                        <button 
                                            onClick={() => copyToClipboard(htmlSnippet, 'html')}
                                            className="text-iron-600 hover:text-white transition-colors"
                                        >
                                            {copied === 'html' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                               </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="pt-24 pb-12 flex flex-col items-center gap-6 text-center">
                    <div className="w-12 h-px bg-iron-900"></div>
                    <p className="text-[10px] font-mono text-iron-700 uppercase tracking-[0.3em]">
                        Verified Governance Audit Layer // Protocol Iron-X
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 text-iron-500 hover:text-white font-mono text-[9px] uppercase tracking-widest transition-colors">
                        Deploy your own node <ExternalLink size={10} />
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default PublicProfilePage;

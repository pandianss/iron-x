import React, { useState, useEffect } from 'react';
import { 
    Terminal, 
    Shield, 
    Users, 
    Search, 
    Filter, 
    ArrowUpDown, 
    Copy, 
    CheckCircle2,
    Lock,
    TrendingUp,
    ExternalLink,
    AlertTriangle
} from 'lucide-react';
import { CoachClient, CoachDashboardData } from '../domain/coach';
import { useNavigate } from 'react-router-dom';

const CoachDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<CoachDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('ALL');
    const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const result = await CoachClient.getDashboard();
            setData(result);
        } catch (err: any) {
            if (err.response?.status === 403) {
                // Not initialized?
                navigate('/coach/setup');
            } else {
                setError('CRITICAL_SYSTEM_FAILURE: Unable to fetch roster.');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyInviteLink = () => {
        const link = data?.invite_link;
        if (!link) {
            alert('No active invite link. Re-initialize your coach node to generate one.');
            return;
        }
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredClients = data?.clients.filter(c => {
        const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterClass === 'ALL' || c.discipline_classification === filterClass;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (sortBy === 'score') {
            return sortOrder === 'desc' 
                ? b.current_discipline_score - a.current_discipline_score
                : a.current_discipline_score - b.current_discipline_score;
        }
        return sortOrder === 'desc' 
            ? b.email.localeCompare(a.email)
            : a.email.localeCompare(b.email);
    }) || [];

    const getClassificationColor = (cls: string) => {
        switch (cls) {
            case 'ONBOARDING': return 'border-blue-400 text-blue-500';
            case 'RECOVERING': return 'border-orange-500 text-orange-400';
            case 'STABLE': return 'border-blue-600 text-blue-500';
            case 'HIGH_RELIABILITY': return 'border-green-500 text-green-400';
            default: return 'border-iron-800 text-iron-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center font-mono">
                    <div className="text-iron-500 text-xs tracking-[0.3em] uppercase mb-4 animate-pulse">
                        // SCANNING_CLIENT_ROSTER...
                    </div>
                    <div className="w-64 h-px bg-iron-900 mx-auto overflow-hidden">
                        <div className="h-full bg-white animate-pulse" style={{ width: '40%' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono p-6">
            <div className="border border-red-900/50 bg-red-950/10 p-8 max-w-md w-full text-center space-y-4">
                <AlertTriangle size={32} className="mx-auto text-red-500" />
                <div className="text-red-500 font-black uppercase tracking-tighter italic">{error}</div>
                <button onClick={fetchDashboard} className="text-xs text-iron-400 underline uppercase tracking-widest">Retry_Protocol</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-iron-300 font-mono p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-iron-800 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
                        <Terminal size={14} /> System_Command
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        Coach_Command_Center
                    </h1>
                </div>

                <button 
                    onClick={copyInviteLink}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-black uppercase tracking-tighter italic transition-all group"
                >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Link_Copied' : 'Invite_New_Nodes'}
                </button>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active_Nodes', val: data?.total_clients || 0, icon: Users, color: 'text-white' },
                    { label: 'Avg_Score', val: data?.summary.avg_score || 0, icon: TrendingUp, color: 'text-blue-500' },
                    { label: 'Hard_Locked', val: data?.summary.locked_count || 0, icon: Lock, color: 'text-red-500' },
                    { label: 'Reliable_Nodes', val: data?.summary.stable_count || 0, icon: Shield, color: 'text-green-500' },
                ].map((s, idx) => (
                    <div key={idx} className="bg-[#0A0A0A] border border-iron-800 p-4 space-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <s.icon size={48} />
                        </div>
                        <div className="text-[10px] text-iron-600 uppercase tracking-widest flex items-center gap-1">
                            <s.icon size={10} /> {s.label}
                        </div>
                        <div className={`text-3xl font-display font-black tracking-tighter ${s.color}`}>
                            {s.val}{s.label === 'Avg_Score' ? '%' : ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0A0A0A] border border-iron-800 p-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-600" size={16} />
                        <input 
                            type="text"
                            placeholder="Search_Nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-iron-800 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-600 transition-colors uppercase"
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-black border border-iron-800 px-3 py-2">
                            <Filter size={14} className="text-iron-600" />
                            <select 
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="bg-transparent text-[10px] text-iron-400 border-none focus:outline-none uppercase font-bold"
                            >
                                <option value="ALL">All_Classes</option>
                                <option value="UNRELIABLE">Unreliable</option>
                                <option value="RECOVERING">Recovering</option>
                                <option value="STABLE">Stable</option>
                                <option value="HIGH_RELIABILITY">High_Reliability</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => {
                                if (sortBy === 'score') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                else setSortBy('score');
                            }}
                            className={`flex-1 md:flex-none flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase transition-all ${sortBy === 'score' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-iron-800 text-iron-600'}`}
                        >
                            <ArrowUpDown size={12} /> Score
                        </button>
                    </div>
                </div>

                {filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <div key={client.user_id} className={`bg-[#0A0A0A] border-l-4 p-6 space-y-6 relative group transition-all hover:bg-[#0F0F0F] ${getClassificationColor(client.discipline_classification)}`}>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <div className="text-[10px] text-iron-500 font-bold uppercase tracking-widest">Node_Identifier:</div>
                                        {client.locked_until && new Date(client.locked_until) > new Date() && (
                                            <div className="flex items-center gap-1 text-[10px] bg-red-600 text-white px-2 py-0.5 font-bold animate-pulse">
                                                <Lock size={10} /> LOCKED
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-lg font-display font-black text-white italic truncate uppercase">
                                        {client.email.split('@')[0]}
                                        <span className="text-iron-700">@***.***</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-iron-500 uppercase tracking-widest">Discipline_Score:</div>
                                            <div className="text-4xl font-display font-black text-white leading-none">
                                                {client.current_discipline_score}<span className="text-iron-700 text-lg">/100</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`text-[10px] font-bold px-2 py-0.5 border ${getClassificationColor(client.discipline_classification)} bg-black`}>
                                                {client.discipline_classification}
                                            </div>
                                            <div className="text-[9px] text-iron-600 uppercase tracking-widest">
                                                Tier: {client.trust_tier}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-1.5 bg-iron-900 border border-iron-800 w-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${client.current_discipline_score > 70 ? 'bg-green-500' : client.current_discipline_score > 40 ? 'bg-blue-600' : 'bg-red-600'}`}
                                            style={{ width: `${client.current_discipline_score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-iron-800/50">
                                    <div className="space-y-1">
                                        <div className="text-[9px] text-iron-600 uppercase tracking-widest">Enforcement:</div>
                                        <div className="text-xs font-bold text-iron-300 uppercase">{client.enforcement_mode}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] text-iron-600 uppercase tracking-widest">Protocols:</div>
                                        <div className="text-xs font-bold text-iron-300 uppercase">{client.actions.length} ACTIVE</div>
                                    </div>
                                </div>

                                <button className="w-full mt-4 bg-iron-900 border border-iron-800 p-3 text-[10px] font-black uppercase tracking-tighter italic hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                    Analyze_Detailed_Grit <ExternalLink size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 border border-dashed border-iron-800 flex flex-col items-center justify-center gap-4 text-center">
                        <Users size={48} className="text-iron-800" />
                        <div className="space-y-1">
                            <div className="text-white font-black uppercase tracking-tighter italic">No_Nodes_Enrolled</div>
                            <div className="text-xs text-iron-600 uppercase tracking-widest">Send your invite link to begin monitoring.</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachDashboardPage;

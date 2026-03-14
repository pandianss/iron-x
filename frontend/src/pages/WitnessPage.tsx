import { useState, useEffect } from 'react';
import { WitnessClient } from '../domain/witness';
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

export default function WitnessPage() {
    const [activeTab, setActiveTab] = useState<'watching' | 'alerts'>('watching');
    const [watching, setWatching] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Auto-refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [watchingData, notifsData] = await Promise.all([
                WitnessClient.getWatchedActions(),
                WitnessClient.getNotifications()
            ]);
            setWatching(watchingData);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Failed to load witness data', err);
        } finally {
            setLoading(false);
        }
    };

    const hasRecentMiss = (instances: any[]) => {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return instances.some(i => i.status === 'MISSED' && new Date(i.scheduled_start_time) > last24h);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-iron-900 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em] font-bold">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        Witness Network // Active Monitoring
                    </div>
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">
                        MONITORING [{watching.length}] ACTIVE NODES
                    </h1>
                </div>

                <div className="flex bg-iron-950 p-1 border border-iron-900">
                    <button
                        onClick={() => setActiveTab('watching')}
                        className={`px-8 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'watching' ? 'bg-white text-black font-bold' : 'text-iron-500 hover:text-white'}`}
                    >
                        WATCHING
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-8 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'bg-red-600 text-white font-bold' : 'text-iron-500 hover:text-white'}`}
                    >
                        ALERTS
                    </button>
                </div>
            </div>

            {loading && !watching.length && !notifications.length ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <div className="text-[10px] font-mono text-iron-500 uppercase tracking-[0.2em] animate-pulse">
                        Synchronizing Witness Data Stream...
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'watching' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {watching.length === 0 ? (
                                <div className="col-span-full py-20 border-2 border-dashed border-iron-900 rounded-lg text-center space-y-4">
                                    <div className="text-iron-500 font-mono text-xs uppercase tracking-[0.2em]">No nodes assigned for witnessing.</div>
                                    <p className="text-iron-700 text-[10px] font-mono max-w-xs mx-auto">
                                        You will see actions here once team members assign you as their external witness.
                                    </p>
                                </div>
                            ) : (
                                watching.map(action => {
                                    const alert = hasRecentMiss(action.action_instances);
                                    const maskEmail = (email: string) => email.slice(0, 3) + '***@' + email.split('@')[1];
                                    
                                    return (
                                        <div 
                                            key={action.action_id} 
                                            className={`bg-black/40 border glass-panel p-6 space-y-6 relative overflow-hidden transition-all duration-500 hover:border-white/20
                                                ${alert ? 'border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-iron-900'}`}
                                        >
                                            {alert && (
                                                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
                                            )}

                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-mono text-iron-500 uppercase tracking-widest font-bold">NODE_OPERATOR</div>
                                                    <div className="text-sm font-mono text-white">{maskEmail(action.user.email)}</div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="text-[9px] font-mono text-iron-500 uppercase tracking-widest font-bold">DS_SCORE</div>
                                                    <div className={`text-xl font-display font-black tracking-tighter ${action.user.current_discipline_score > 80 ? 'text-green-500' : action.user.current_discipline_score < 40 ? 'text-red-500' : 'text-blue-500'}`}>
                                                        {action.user.current_discipline_score}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">Protocol_Monitoring:</div>
                                                <h3 className="text-lg font-display font-black text-white uppercase leading-tight group-hover:text-blue-500 transition-colors">
                                                    {action.title}
                                                </h3>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-iron-900">
                                                <div className="text-[9px] font-mono text-iron-500 uppercase tracking-widest font-bold">RECENT_EXEC_HISTORY</div>
                                                <div className="flex gap-2">
                                                    {action.action_instances.map((idx: any, i: number) => (
                                                        <div key={i} className="group relative">
                                                            {idx.status === 'COMPLETED' ? (
                                                                <CheckCircle2 size={16} className="text-green-500 bg-green-950/20 rounded-full" />
                                                            ) : idx.status === 'MISSED' ? (
                                                                <XCircle size={16} className="text-red-500 bg-red-950/20 rounded-full" />
                                                            ) : (
                                                                <Clock size={16} className="text-iron-600" />
                                                            )}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-iron-800 text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                {idx.status} - {new Date(idx.scheduled_start_time).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4">
                            {notifications.length === 0 ? (
                                <div className="py-32 border border-iron-900 bg-black/20 rounded-lg text-center flex flex-col items-center gap-4">
                                    <ShieldAlert size={48} className="text-iron-800" />
                                    <div className="text-iron-500 font-mono text-xs uppercase tracking-[0.3em]">
                                        // No violations detected. Your nodes are holding.
                                    </div>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.notif_id} className="bg-black/40 border border-iron-900 p-6 flex gap-6 items-center hover:border-red-900 transition-colors group">
                                        <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest font-bold">
                                                    SIGNAL_INTERCEPTED @ {new Date(notif.sent_at).toLocaleString()}
                                                </div>
                                                <div className="text-[10px] font-mono text-red-500 uppercase tracking-[0.2em] font-black group-hover:animate-pulse">
                                                    VIOLATION_DETECTED
                                                </div>
                                            </div>
                                            <p className="text-sm font-mono text-white leading-relaxed">
                                                <span className="text-red-500 font-bold">{notif.action_instance.action.user.email}</span>
                                                {notif.message.replace(notif.action_instance.action.user.email, '')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

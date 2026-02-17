import { useEffect, useState } from 'react';
import { ScheduleClient, type ScheduledItem } from '../domain/schedule';
import { useAuth } from '../hooks/useAuth';
import { useDiscipline } from '../hooks/useDiscipline';
import { Link } from 'react-router-dom';
import DisciplineDashboard from '../components/DisciplineDashboard';
import ExecutionFeedbackPanel from '../components/ExecutionFeedbackPanel';
import AttentionDensityStrip from '../components/AttentionDensityStrip';
import WeeklyReportModal from '../components/WeeklyReportModal';
import { BookOpen } from 'lucide-react';

export default function DashboardPage() {
    const { token, logout, user } = useAuth();
    const { refresh: refreshDiscipline } = useDiscipline();
    const [instances, setInstances] = useState<ScheduledItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const fetchSchedule = async () => {
        try {
            const data = await ScheduleClient.getToday();
            setInstances(data);
        } catch (error) {
            console.error('Error fetching schedule', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSchedule();
    }, [token]);

    const [lastExecutionStatus, setLastExecutionStatus] = useState<'COMPLETED' | 'LATE' | null>(null);

    const handleLogExecution = async (instanceId: string) => {
        try {
            await ScheduleClient.logExecution(instanceId);
            setLastExecutionStatus('COMPLETED');
            fetchSchedule();
            refreshDiscipline();
        } catch (error) {
            console.error('Error logging execution', error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-iron-950 flex items-center justify-center font-mono text-iron-500 uppercase tracking-widest">
            [ Initializing Operational Layer... ]
        </div>
    );

    return (
        <div className="min-h-screen bg-iron-950 text-iron-300 font-mono infrastructure-bg p-8 pt-32">
            <div className="max-w-5xl mx-auto space-y-12">
                <AttentionDensityStrip />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-iron-900">
                    <div>
                        <h1 className="text-4xl font-bold font-display text-white uppercase tracking-tight">
                            Operational <span className="text-iron-500">Discipline</span>
                        </h1>
                        <p className="text-xs text-iron-600 uppercase tracking-widest mt-1">
                            System Node: {user?.email} // Status: Active
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <button
                            onClick={() => setIsReportOpen(true)}
                            className="flex items-center text-iron-400 hover:text-white text-[10px] font-bold uppercase tracking-widest bg-iron-900/30 px-4 py-2 border border-iron-800 transition-colors"
                        >
                            <BookOpen className="w-3 h-3 mr-2" /> Weekly Report
                        </button>

                        <nav className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
                            <Link to="/billing" className="text-iron-600 hover:text-white transition-colors">
                                [ Billing ]
                            </Link>
                            <Link to="/security" className="text-iron-600 hover:text-white transition-colors">
                                [ Security ]
                            </Link>
                            {user?.organization && (
                                <Link to={`/org/${user.organization.slug}`} className="text-red-500 hover:text-red-400 transition-colors">
                                    [ Organization ]
                                </Link>
                            )}
                        </nav>

                        <button onClick={logout} className="text-iron-700 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            // Terminate Session
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <DisciplineDashboard />

                        <div className="bg-iron-950/40 border border-iron-900 hardened-border glass-panel">
                            <div className="flex justify-between items-center mb-6 border-b border-iron-900 pb-4">
                                <h2 className="text-xs font-bold text-iron-500 uppercase tracking-[0.3em]">Execution Schedule</h2>
                                <span className="text-[10px] text-iron-700 tabular-nums uppercase">Cycle: {new Date().toLocaleDateString()}</span>
                            </div>

                            {instances.length === 0 ? (
                                <div className="py-12 text-center text-iron-700 text-xs uppercase tracking-widest">
                                    No actions queued in current window.
                                </div>
                            ) : (
                                <ul className="divide-y divide-iron-900/50">
                                    {instances.map((instance) => (
                                        <li key={instance.instance_id} className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-iron-300 transition-colors">
                                                    {instance.action.title}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-iron-500 tabular-nums">
                                                        {new Date(instance.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —
                                                        {new Date(instance.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase tracking-widest
                                                        ${instance.status === 'COMPLETED' ? 'border-green-900 text-green-500 bg-green-900/10' :
                                                            instance.status === 'MISSED' ? 'border-red-900 text-red-500 bg-red-900/10' :
                                                                instance.status === 'LATE' ? 'border-yellow-900 text-yellow-500 bg-yellow-900/10' :
                                                                    'border-iron-800 text-iron-500 bg-iron-900/20'}`}>
                                                        {instance.status}
                                                    </span>
                                                </div>
                                            </div>
                                            {instance.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleLogExecution(instance.instance_id)}
                                                    className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-iron-200 transition-all border border-white"
                                                >
                                                    Validate Execution
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-iron-950/20 p-6 border border-iron-900 hardened-border">
                            <h3 className="text-xs font-bold text-iron-500 uppercase tracking-widest mb-6">System Control</h3>
                            <div className="space-y-4">
                                <Link to="/goals" className="block w-full text-center py-3 bg-iron-900/50 border border-iron-800 text-iron-400 text-[10px] font-bold uppercase tracking-widest hover:bg-iron-800 hover:text-white transition-all">
                                    Modify Goal Parameters
                                </Link>
                                <Link to="/actions" className="block w-full text-center py-3 bg-iron-900/50 border border-iron-800 text-iron-400 text-[10px] font-bold uppercase tracking-widest hover:bg-iron-800 hover:text-white transition-all">
                                    Recalibrate Actions
                                </Link>
                            </div>
                        </div>

                        <div className="p-6 border border-iron-900/50 text-[10px] text-iron-700 uppercase leading-relaxed space-y-4">
                            <p className="border-l border-iron-800 pl-4">
                                // Warning: Manual modification of parameters may trigger re-baseline protocols.
                            </p>
                            <p className="border-l border-iron-800 pl-4">
                                // Execution variance is logged to the governance layer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {lastExecutionStatus && (
                <ExecutionFeedbackPanel
                    status={lastExecutionStatus}
                    onClose={() => setLastExecutionStatus(null)}
                />
            )}

            <WeeklyReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
            />
        </div>
    );
};


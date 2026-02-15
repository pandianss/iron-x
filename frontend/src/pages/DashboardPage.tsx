import React, { useEffect, useState } from 'react';
import { ScheduleClient, type ScheduledItem } from '../domain/schedule';
import { useAuth } from '../context/AuthContext';
import { useDiscipline } from '../context/DisciplineContext';
import { Link } from 'react-router-dom';
import DisciplineDashboard from '../components/DisciplineDashboard';
import ExecutionFeedbackPanel from '../components/ExecutionFeedbackPanel';
import AttentionDensityStrip from '../components/AttentionDensityStrip';
import WeeklyReportModal from '../components/WeeklyReportModal';
import { BookOpen } from 'lucide-react';

const DashboardPage: React.FC = () => {
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
            // Refresh discipline state immediately
            refreshDiscipline();
        } catch (error) {
            console.error('Error logging execution', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-iron-50 p-8">
            <div className="max-w-4xl mx-auto">
                <AttentionDensityStrip />

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-iron-900">Today's Discipline</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsReportOpen(true)}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                            <BookOpen className="w-4 h-4 mr-1" /> Weekly Report
                        </button>
                        <Link to="/billing" className="text-iron-600 hover:text-iron-900 text-sm font-medium">
                            Plans & Billing
                        </Link>
                        <Link to="/security" className="text-iron-600 hover:text-iron-900 text-sm font-medium">
                            Security
                        </Link>
                        {user?.organization && (
                            <Link to={`/org/${user.organization.slug}`} className="text-red-600 hover:text-red-800 text-sm font-bold uppercase tracking-tighter">
                                Organization
                            </Link>
                        )}
                        <button onClick={logout} className="text-red-600 hover:text-red-800 text-sm">Logout</button>
                    </div>
                </div>

                <DisciplineDashboard />

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Daily Schedule</h2>
                    {instances.length === 0 ? (
                        <p className="text-iron-500">No actions scheduled for today.</p>
                    ) : (
                        <ul className="divide-y divide-iron-200">
                            {instances.map((instance) => (
                                <li key={instance.instance_id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium">{instance.action.title}</h3>
                                        <p className="text-sm text-iron-500">
                                            {new Date(instance.scheduled_start_time).toLocaleTimeString()} -
                                            {new Date(instance.scheduled_end_time).toLocaleTimeString()}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                      ${instance.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                instance.status === 'MISSED' ? 'bg-red-100 text-red-800' :
                                                    instance.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                            {instance.status}
                                        </span>
                                    </div>
                                    {instance.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleLogExecution(instance.instance_id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Log Done
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-medium">Quick Actions</h3>
                    <div className="flex space-x-4 mt-2">
                        <Link to="/goals" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Manage Goals</Link>
                        <Link to="/actions" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Manage Actions</Link>
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

export default DashboardPage;

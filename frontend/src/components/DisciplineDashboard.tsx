import { useEffect, useState } from 'react';
import { AnalyticsClient } from '../domain/analytics';
import DisciplineIdentityCard from './DisciplineIdentityCard';
import DisciplineTrajectoryGraph from './DisciplineTrajectoryGraph';
import TomorrowPreview from './TomorrowPreview';

// Keeping original data fetching for Today's Stats if needed, 
// or we can refactor. For now, let's keep the dashboard focused on the new components
// and maybe keep a small section for Today's Stats if not covered by others.

interface DashboardData {
    todayStats: { executed: number; missed: number };
}

export default function DisciplineDashboard() {
    const [stats, setStats] = useState<DashboardData['todayStats'] | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AnalyticsClient.getDailyStats();
                if (data?.todayStats) {
                    setStats(data.todayStats);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <DisciplineIdentityCard />
                </div>
                <div className="space-y-8">
                    <TomorrowPreview />
                    {stats && (
                        <div className="bg-iron-950/40 p-6 border border-iron-900 hardened-border glass-panel">
                            <h3 className="text-[10px] font-bold text-iron-500 uppercase tracking-[0.3em] mb-4">Today's Pulse</h3>
                            <div className="flex justify-between items-center bg-black/30 p-4 border border-iron-900">
                                <div className="text-center flex-1">
                                    <span className="block text-2xl font-bold text-white font-display tabular-nums tracking-tight">{stats.executed}</span>
                                    <span className="text-[9px] text-iron-600 uppercase tracking-widest">Executed</span>
                                </div>
                                <div className="w-px h-10 bg-iron-900"></div>
                                <div className="text-center flex-1">
                                    <span className="block text-2xl font-bold text-red-500 font-display tabular-nums tracking-tight">{stats.missed}</span>
                                    <span className="text-[9px] text-iron-600 uppercase tracking-widest">Missed</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DisciplineTrajectoryGraph />
        </div>
    );
}


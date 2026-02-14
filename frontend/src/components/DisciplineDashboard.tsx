import React, { useEffect, useState } from 'react';
import client from '../api/client';
import DisciplineIdentityCard from './DisciplineIdentityCard';
import DisciplineTrajectoryGraph from './DisciplineTrajectoryGraph';
import TomorrowPreview from './TomorrowPreview';

// Keeping original data fetching for Today's Stats if needed, 
// or we can refactor. For now, let's keep the dashboard focused on the new components
// and maybe keep a small section for Today's Stats if not covered by others.

interface DashboardData {
    todayStats: { executed: number; missed: number };
}

const DisciplineDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardData['todayStats'] | null>(null);

    useEffect(() => {
        // Fetch only today's stats if needed, or re-use the analytics endpoint
        // For simplicity, re-using the logic but extracting just what we need
        const fetchStats = async () => {
            try {
                const response = await client.get('/analytics/daily');
                if (response.status === 200 && response.data?.todayStats) {
                    setStats(response.data.todayStats);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DisciplineIdentityCard />
                </div>
                <div className="space-y-6">
                    <TomorrowPreview />
                    {stats && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Today's Pulse</h3>
                            <div className="flex justify-between items-center">
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-green-600">{stats.executed}</span>
                                    <span className="text-xs text-gray-400">Executed</span>
                                </div>
                                <div className="w-px h-8 bg-gray-100 mx-4"></div>
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-red-600">{stats.missed}</span>
                                    <span className="text-xs text-gray-400">Missed</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DisciplineTrajectoryGraph />
        </div>
    );
};

export default DisciplineDashboard;

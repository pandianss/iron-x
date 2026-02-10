import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle, Activity, Zap } from 'lucide-react';

interface DensityData {
    usersAtRisk: number;
    lockoutsThisWeek: number;
    trend: 'stable' | 'volatile';
}

const AttentionDensityStrip: React.FC = () => {
    const [data, setData] = useState<DensityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simplified fetching - in a real app this might hit a separate analytics endpoint
        // For Phase 3.5, we mock or use existing analytics if available
        const fetchData = async () => {
            try {
                // Simulating a fetch delay
                await new Promise(resolve => setTimeout(resolve, 800));
                setData({
                    usersAtRisk: 2,
                    lockoutsThisWeek: 5,
                    trend: 'stable'
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-12 bg-gray-50 rounded-lg border border-gray-100 mb-6"></div>;
    if (!data) return null;

    return (
        <div className="bg-gray-900 text-gray-300 px-6 py-3 rounded-lg flex flex-wrap items-center justify-between mb-8 shadow-inner border border-gray-800">
            <div className="flex items-center space-x-8">
                <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mr-2">At Risk</span>
                    <span className="text-sm font-bold text-white">{data.usersAtRisk} users</span>
                </div>

                <div className="flex items-center">
                    <Shield className="w-4 h-4 text-indigo-500 mr-2" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mr-2">Lockouts</span>
                    <span className="text-sm font-bold text-white">{data.lockoutsThisWeek} this week</span>
                </div>

                <div className="flex items-center">
                    <Activity className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mr-2">Trend</span>
                    <span className={`text-sm font-bold capitalize ${data.trend === 'stable' ? 'text-green-400' : 'text-orange-400'}`}>
                        {data.trend}
                    </span>
                </div>
            </div>

            <div className="hidden md:flex items-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                <Zap className="w-3 h-3 mr-1" /> System Health Optimal
            </div>
        </div>
    );
};

export default AttentionDensityStrip;

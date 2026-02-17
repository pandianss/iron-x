import { useEffect, useState } from 'react';
import { Shield, AlertCircle, Activity, Zap } from 'lucide-react';

interface DensityData {
    usersAtRisk: number;
    lockoutsThisWeek: number;
    trend: 'stable' | 'volatile';
}


export default function AttentionDensityStrip() {
    const [data, setData] = useState<DensityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return <div className="animate-pulse h-12 bg-iron-900/20 border border-iron-900 mb-6"></div>;
    if (!data) return null;

    return (
        <div className="bg-iron-950/40 text-iron-300 px-6 py-4 border border-iron-900 hardened-border flex flex-wrap items-center justify-between mb-8 glass-panel relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-iron-500 opacity-20"></div>

            <div className="flex items-center space-x-12">
                <div className="flex items-center group">
                    <AlertCircle className="w-3.5 h-3.5 text-iron-600 mr-2 group-hover:text-amber-500 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500 mr-3">Nodes at Risk</span>
                    <span className="text-sm font-bold text-white tabular-nums">{data.usersAtRisk}</span>
                </div>

                <div className="flex items-center group">
                    <Shield className="w-3.5 h-3.5 text-iron-600 mr-2 group-hover:text-red-600 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500 mr-3">Lockouts</span>
                    <span className="text-sm font-bold text-white tabular-nums">{data.lockoutsThisWeek}</span>
                </div>

                <div className="flex items-center group">
                    <Activity className="w-3.5 h-3.5 text-iron-600 mr-2 group-hover:text-iron-400 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500 mr-3">System Trend</span>
                    <span className={`text-sm font-bold uppercase tabular-nums ${data.trend === 'stable' ? 'text-iron-400' : 'text-amber-500'}`}>
                        {data.trend}
                    </span>
                </div>
            </div>

            <div className="hidden md:flex items-center text-[10px] text-iron-700 uppercase font-bold tracking-[0.3em]">
                <Zap className="w-3 h-3 mr-2 opacity-30" /> Operational Integrity: Optimal
            </div>
        </div>
    );
}


import { useEffect, useState } from 'react';
import { DisciplineClient, DisciplineState } from '../../domain/discipline';
import { TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

export function ViolationHorizon() {
    const [state, setState] = useState<DisciplineState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DisciplineClient.getState();
                setState(data);
            } catch (error) {
                console.error('Failed to fetch discipline state for violation horizon', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !state) return <div className="p-6 h-64 bg-iron-900/10 border border-iron-900 animate-pulse">Loading Horizon...</div>;
    if (!state) return null;

    const { violationHorizon, score } = state;

    return (
        <div className="flex-1 bg-transparent p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-iron-900 pb-4">Violation Horizon // Forward Anticipation</h2>

            {/* Strategic Projections */}
            <div className="grid grid-cols-2 gap-6 mb-2">
                <div className="bg-black/40 border border-iron-900 p-4 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-900 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-iron-500 text-[9px] uppercase font-bold tracking-[0.2em]">Structural Collapse Risk</span>
                    </div>
                    <div className="text-4xl font-display text-red-500 font-bold leading-none tabular-nums">
                        {score < 50 ? 'HIGH' : score < 70 ? 'ELEVATED' : 'LOW'}
                    </div>
                    <div className="text-[9px] text-iron-700 mt-3 uppercase tracking-widest font-mono">
                        {violationHorizon.daysUntilBreach
                            ? `Days until breach: ${violationHorizon.daysUntilBreach}`
                            : 'Stable Operational Horizon'}
                    </div>
                </div>

                <div className="bg-black/40 border border-iron-900 p-4 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-900 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-iron-500 text-[9px] uppercase font-bold tracking-[0.2em]">Habit Strength Threshold</span>
                    </div>
                    <div className="text-4xl font-display text-emerald-500 font-bold leading-none tabular-nums">
                        {Object.keys(state.performanceMetrics.habitStrength).length > 0
                            ? Math.round(Object.values(state.performanceMetrics.habitStrength).reduce((a, b) => a + b, 0) / Object.keys(state.performanceMetrics.habitStrength).length)
                            : 0}%
                    </div>
                    <div className="text-[9px] text-iron-700 mt-3 uppercase tracking-widest font-mono">
                        Aggregate Compliance Determinism
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-iron-600 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Imminent Threat Vectors (Critical Actions)</h3>
                <div className="space-y-2">
                    {violationHorizon.criticalActions.map((action, idx) => (
                        <div key={idx} className={`bg-iron-950/60 border border-iron-800 border-l-4 border-l-amber-600 p-4 flex justify-between items-center group transition-all hover:bg-black/40`}>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-white font-bold text-[10px] uppercase tracking-widest">{action}</span>
                                    <span className="text-iron-700 text-[8px] font-mono border border-iron-900 px-1 tracking-tighter">LVL: ELEVATED</span>
                                </div>
                                <span className="text-iron-500 text-[9px] font-mono leading-relaxed italic border-l border-iron-900 pl-3">Frequent failure pattern detected for this operation.</span>
                            </div>
                        </div>
                    ))}
                    {violationHorizon.criticalActions.length === 0 && (
                        <div className="text-iron-800 text-[9px] font-mono uppercase tracking-[0.4em] text-center py-8 border border-dashed border-iron-900 bg-iron-950/20">
                            No Imminent Breaches Detected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

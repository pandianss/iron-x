import { useEffect, useState } from 'react';
import { DisciplineClient, type Warning } from '../../domain/discipline';
import { AnalyticsClient } from '../../domain/analytics';
import { TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

export function ViolationHorizon() {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [projections, setProjections] = useState<unknown>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warns, projs] = await Promise.all([
                    DisciplineClient.getAnticipatoryWarnings(),
                    AnalyticsClient.getProjections()
                ]);
                setWarnings(warns);
                setProjections(projs);
            } catch (error) {
                console.error('Failed to fetch predictions', error);
            }
        };
        fetchData();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedProjections = projections as any;

    return (
        <div className="flex-1 bg-transparent p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-iron-900 pb-4">Violation Horizon // Forward Anticipation</h2>

            {/* Strategic Projections */}
            {typedProjections && (
                <div className="grid grid-cols-2 gap-6 mb-2">
                    <div className="bg-black/40 border border-iron-900 p-4 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-900 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-iron-500 text-[9px] uppercase font-bold tracking-[0.2em]">Structural Collapse Risk</span>
                        </div>
                        <div className="text-4xl font-display text-red-500 font-bold leading-none tabular-nums">
                            {typedProjections.trajectory.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-iron-700 mt-3 uppercase tracking-widest font-mono">
                            {typedProjections.trajectory.projectedCollapseDate
                                ? `T-Minus: ${new Date(typedProjections.trajectory.projectedCollapseDate).toLocaleDateString()}`
                                : 'Collapse: Negative'}
                        </div>
                    </div>

                    <div className="bg-black/40 border border-iron-900 p-4 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-900 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-iron-500 text-[9px] uppercase font-bold tracking-[0.2em]">Success Determinism</span>
                        </div>
                        <div className="text-4xl font-display text-emerald-500 font-bold leading-none tabular-nums">
                            {typedProjections.success.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-iron-700 mt-3 uppercase tracking-widest font-mono">
                            {typedProjections.success.message.split('.')[0]}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-iron-600 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Imminent Threat Vectors</h3>
                <div className="space-y-2">
                    {warnings.map((warn, idx) => (
                        <div key={idx} className={`bg-iron-950/60 border border-iron-800 border-l-4 ${warn.severity === 'HIGH' ? 'border-l-red-600' : 'border-l-amber-600'} p-4 flex justify-between items-center group transition-all hover:bg-black/40`}>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className={`w-3.5 h-3.5 ${warn.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                                    <span className="text-white font-bold text-[10px] uppercase tracking-widest">{warn.type}</span>
                                    <span className="text-iron-700 text-[8px] font-mono border border-iron-900 px-1 tracking-tighter">LVL: {warn.severity}</span>
                                </div>
                                <span className="text-iron-500 text-[9px] font-mono leading-relaxed italic border-l border-iron-900 pl-3">{warn.message}</span>
                            </div>
                        </div>
                    ))}
                    {warnings.length === 0 && typedProjections?.trajectory.probability < 10 && (
                        <div className="text-iron-800 text-[9px] font-mono uppercase tracking-[0.4em] text-center py-8 border border-dashed border-iron-900 bg-iron-950/20">
                            No Imminent Breaches Detected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { DisciplineClient, type Warning } from '../../domain/discipline';
import { AnalyticsClient } from '../../domain/analytics';
import { TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

export const ViolationHorizon: React.FC = () => {
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
        <div className="bg-iron-900 border border-iron-800 p-6 flex flex-col gap-4">
            <h2 className="text-iron-400 uppercase tracking-widest text-xs font-bold border-b border-iron-800 pb-4">Violation Horizon (Forward Anticipation)</h2>

            {/* Strategic Projections */}
            {typedProjections && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-iron-950 border border-iron-800 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-iron-500 text-[10px] uppercase font-bold tracking-tighter">System Collapse Risk</span>
                        </div>
                        <div className="text-xl font-mono text-red-500 font-bold">
                            {typedProjections.trajectory.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-iron-600 mt-1 uppercase">
                            {typedProjections.trajectory.projectedCollapseDate
                                ? `Projected: ${new Date(typedProjections.trajectory.projectedCollapseDate).toLocaleDateString()}`
                                : 'No imminent collapse projected'}
                        </div>
                    </div>
                    <div className="bg-iron-950 border border-iron-800 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-iron-500 text-[10px] uppercase font-bold tracking-tighter">Success Determinism</span>
                        </div>
                        <div className="text-xl font-mono text-emerald-500 font-bold">
                            {typedProjections.success.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-iron-600 mt-1 uppercase">
                            {typedProjections.success.message}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {warnings.map((warn, idx) => (
                    <div key={idx} className={`bg-iron-950 border-l-4 ${warn.severity === 'HIGH' ? 'border-red-600' : 'border-amber-600'} p-3 flex justify-between items-center group hover:bg-iron-900 transition-colors`}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${warn.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                                <span className="text-iron-200 font-bold text-sm">{warn.type}</span>
                                <span className="text-iron-600 text-[10px] font-mono border border-iron-800 px-1">SEVERITY: {warn.severity}</span>
                            </div>
                            <span className="text-iron-400 text-xs font-mono">{warn.message}</span>
                        </div>
                    </div>
                ))}
                {warnings.length === 0 && typedProjections?.trajectory.probability < 10 && (
                    <div className="text-iron-600 text-sm font-mono italic text-center py-4">No imminent violations detected.</div>
                )}
            </div>
        </div>
    );
};

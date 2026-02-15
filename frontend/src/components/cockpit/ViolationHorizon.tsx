import React, { useEffect, useState } from 'react';
import { getPredictions, getProjections, type Prediction } from '../../api/discipline';
import { TrendingDown, CheckCircle } from 'lucide-react';

export const ViolationHorizon: React.FC = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [projections, setProjections] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [preds, projs] = await Promise.all([getPredictions(), getProjections()]);
                setPredictions(preds);
                setProjections(projs);
            } catch (error) {
                console.error('Failed to fetch predictions', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-zinc-400 uppercase tracking-widest text-xs font-bold border-b border-zinc-800 pb-4">Violation Horizon (Forward Anticipation)</h2>

            {/* Strategic Projections */}
            {projections && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">System Collapse Risk</span>
                        </div>
                        <div className="text-xl font-mono text-red-500 font-bold">
                            {projections.trajectory.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-zinc-600 mt-1 uppercase">
                            {projections.trajectory.projectedCollapseDate
                                ? `Projected: ${new Date(projections.trajectory.projectedCollapseDate).toLocaleDateString()}`
                                : 'No imminent collapse projected'}
                        </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter">Success Determinism</span>
                        </div>
                        <div className="text-xl font-mono text-emerald-500 font-bold">
                            {projections.success.probability.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-zinc-600 mt-1 uppercase">
                            {projections.success.message}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {predictions.map((pred, idx) => (
                    <div key={idx} className="bg-zinc-950 border-l-4 border-amber-600 p-3 flex justify-between items-center group hover:bg-zinc-900 transition-colors">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-200 font-bold text-sm">{pred.event}</span>
                                <span className="text-zinc-600 text-[10px] font-mono border border-zinc-800 px-1">CONFIDENCE: {pred.confidence}%</span>
                            </div>
                            <span className="text-amber-500 text-xs font-mono">ACTION REQ: {pred.correctiveAction}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-zinc-400 text-xs font-mono">{pred.time}</span>
                            <span className="text-red-500 text-[10px] font-bold uppercase">{pred.consequence}</span>
                        </div>
                    </div>
                ))}
                {predictions.length === 0 && projections?.trajectory.probability < 10 && (
                    <div className="text-zinc-600 text-sm font-mono italic text-center py-4">No imminent violations detected.</div>
                )}
            </div>
        </div>
    );
};

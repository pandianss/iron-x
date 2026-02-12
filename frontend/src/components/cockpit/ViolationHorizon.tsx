import React, { useEffect, useState } from 'react';
import { getPredictions, Prediction } from '../../api/discipline';

export const ViolationHorizon: React.FC = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getPredictions();
                setPredictions(result);
            } catch (error) {
                console.error('Failed to fetch predictions', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4">
            <h2 className="text-zinc-400 uppercase tracking-widest text-xs font-bold border-b border-zinc-800 pb-4">Violation Horizon (Forward Anticipation)</h2>

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
                {predictions.length === 0 && (
                    <div className="text-zinc-600 text-sm font-mono italic text-center py-4">No imminent violations detected.</div>
                )}
            </div>
        </div>
    );
};

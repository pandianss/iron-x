import React from 'react';
import { TrendingDown, AlertTriangle } from 'lucide-react';

interface DriftVector {
    source: string;
    current: string;
    threshold: string;
    timeToBreach: string;
}

interface PressurePanelProps {
    compositePressure: string;
    driftVectors: DriftVector[];
}

export const PressureDriftPanel: React.FC<PressurePanelProps> = ({ compositePressure, driftVectors }) => {
    return (
        <div className="flex-1 flex flex-col gap-4 p-6 panel-border bg-neutral-muted">
            <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-widest opacity-70">Discipline Drift Vectors</h2>
                <div className="flex items-center gap-4">
                    <span className="text-xs uppercase opacity-50">Composite Pressure</span>
                    <div className="flex items-center gap-2 group">
                        <div className={`px-3 py-1 text-xs font-bold ${compositePressure === 'HIGH' ? 'bg-breach' : 'bg-alert text-neutral-base'}`}>
                            {compositePressure}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-4">
                {driftVectors.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-neutral-base panel-border border-opacity-50">
                        <div className="flex items-center gap-4">
                            <TrendingDown size={18} className="signal-amber" />
                            <div className="flex flex-col">
                                <span className="text-xs opacity-50 uppercase">{v.source}</span>
                                <span className="text-lg mono-display">{v.current} <span className="text-xs opacity-30">/ {v.threshold}</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] uppercase opacity-50 block">Time to Breach</span>
                            <span className="text-md mono-display signal-amber">{v.timeToBreach}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto flex items-center gap-4 p-4 border border-dashed border-white/10 rounded-sm">
                <AlertTriangle size={24} className="signal-amber shrink-0" />
                <p className="text-xs leading-relaxed opacity-60">
                    Pressure calculation is immutable. Drift detected in core execution buffers.
                    Corrective action required to prevent threshold breach.
                </p>
            </div>
        </div>
    );
};

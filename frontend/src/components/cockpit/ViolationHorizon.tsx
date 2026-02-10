import React from 'react';
import { FastForward, CheckCircle2, ChevronRight } from 'lucide-react';

interface Prediction {
    event: string;
    time: string;
    confidence: number;
    correctiveAction: string;
    consequence: string;
}

interface ViolationHorizonProps {
    predictions: Prediction[];
}

export const ViolationHorizon: React.FC<ViolationHorizonProps> = ({ predictions }) => {
    return (
        <div className="flex-[0.6] flex flex-col gap-4 p-6 panel-border bg-neutral-muted">
            <div className="flex items-center gap-2">
                <FastForward size={16} className="opacity-50" />
                <h2 className="text-sm uppercase tracking-widest opacity-70">Violation Horizon</h2>
            </div>

            <div className="flex flex-col gap-3 mt-2 overflow-y-auto pr-2">
                {predictions.map((p, i) => (
                    <div key={i} className="group relative panel-border bg-neutral-base p-4 border-l-2 border-l-amber-600/50 hover:bg-neutral-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-white uppercase">{p.event}</span>
                            <span className="text-[10px] mono-display signal-amber">{p.time}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase opacity-40">Confidence</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1 bg-neutral-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-600" style={{ width: `${p.confidence}%` }}></div>
                                    </div>
                                    <span className="text-[10px] mono-display">{p.confidence}%</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-2 bg-neutral-muted/50 border border-white/5 rounded-sm">
                                <CheckCircle2 size={12} className="signal-amber mt-0.5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase opacity-40 font-bold">Required Corrective Action</span>
                                    <span className="text-xs text-neutral-accent leading-tight">{p.correctiveAction}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 bg-red-900/10 border border-red-900/20 text-red-500/80 uppercase italic">
                                <span>Consequence: {p.consequence}</span>
                            </div>
                        </div>

                        <div className="absolute top-1/2 -right-1 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} className="signal-amber" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto py-2 border-t border-white/5">
                <p className="text-[10px] italic opacity-30 text-center uppercase tracking-tighter">
                    Anticpatory Enforcement Active • Forecast generated via derived state
                </p>
            </div>
        </div>
    );
};

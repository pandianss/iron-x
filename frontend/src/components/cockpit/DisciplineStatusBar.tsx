import React from 'react';
import { Timer, Activity } from 'lucide-react';

interface StatusBarProps {
    score: number;
    status: string;
    lastViolation: string;
    nextCheck: string;
}

export const DisciplineStatusBar: React.FC<StatusBarProps> = ({ score, status, lastViolation, nextCheck }) => {
    const isBreach = status === 'BREACH';

    return (
        <div className={`w-full h-16 panel-border bg-neutral-muted flex items-center px-6 justify-between crt-flicker ${isBreach ? 'border-red-600' : ''}`}>
            <div className="flex items-center gap-8">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">Discipline Score</span>
                    <span className={`text-2xl font-bold mono-display animate-score-tick ${score < 50 ? 'signal-red' : score < 80 ? 'signal-amber' : 'text-neutral-accent'}`}>
                        {score.toFixed(1)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">Enforcement State</span>
                    <span className={`text-xl font-bold uppercase ${isBreach ? 'signal-red' : status === 'DRIFTING' ? 'signal-amber' : 'text-neutral-accent'}`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-12">
                <div className="flex items-center gap-3">
                    <Activity size={16} className={`${isBreach ? 'signal-red animate-pulse' : 'opacity-20'}`} />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">Since Last Breach</span>
                        <span className="text-sm mono-display tabular-nums opacity-80">{lastViolation}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Timer size={16} className={`${status === 'DRIFTING' ? 'signal-amber animate-pulse' : 'opacity-20'}`} />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">Enforcement Check</span>
                        <span className="text-sm mono-display signal-amber tabular-nums animate-pulse font-bold">{nextCheck}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

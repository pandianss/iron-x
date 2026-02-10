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
        <div className={`w-full h-16 panel-border bg-neutral-muted flex items-center px-6 justify-between ${isBreach ? 'border-red-600 animate-pulse' : ''}`}>
            <div className="flex items-center gap-8">
                <div className="flex flex-col">
                    <span className="text-xs uppercase opacity-50">Discipline Score</span>
                    <span className={`text-2xl font-bold mono-display animate-decay ${score < 50 ? 'signal-red' : score < 80 ? 'signal-amber' : 'text-white'}`}>
                        {score.toFixed(1)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-xs uppercase opacity-50">Enforcement State</span>
                    <span className={`text-xl font-bold uppercase ${isBreach ? 'signal-red' : status === 'DRIFTING' ? 'signal-amber' : 'text-neutral-accent'}`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-12">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="opacity-50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase opacity-50">Since Last Breach</span>
                        <span className="text-sm mono-display">{lastViolation}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Timer size={16} className="opacity-50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase opacity-50">Next Enforcement Check</span>
                        <span className="text-sm mono-display signal-amber">{nextCheck}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

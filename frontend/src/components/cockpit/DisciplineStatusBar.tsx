import React, { useEffect, useState } from 'react';
import { getDisciplineState, DisciplineState } from '../../api/discipline';

export const DisciplineStatusBar: React.FC = () => {
    const [state, setState] = useState<DisciplineState | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDisciplineState();
                setState(data);
            } catch (error) {
                console.error('Failed to fetch discipline state', error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (!state) return <div className="p-4 bg-zinc-900 border border-zinc-800 animate-pulse h-24">Loading System State...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'STRICT': return 'text-zinc-200'; // Neutral/White
            case 'STABLE': return 'text-zinc-400';
            case 'DRIFTING': return 'text-amber-500';
            case 'BREACH': return 'text-red-600 animate-pulse';
            default: return 'text-zinc-500';
        }
    };

    return (
        <div className="w-full bg-zinc-950 border-b border-zinc-800 p-4 font-mono text-sm grid grid-cols-4 gap-4 items-center">
            <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Discipline Score</span>
                <span className="text-3xl font-bold text-zinc-100">{state.score}</span>
            </div>

            <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Status Classification</span>
                <span className={`text-xl font-bold ${getStatusColor(state.status)}`}>{state.status}</span>
            </div>

            <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Time Since Violation</span>
                <span className="text-zinc-300">{state.timeSinceLastViolation}</span>
            </div>

            <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase tracking-wider">Next Enforcement Check</span>
                <span className="text-amber-500 font-bold">{state.countdownToNextCheck}</span>
            </div>
        </div>
    );
};

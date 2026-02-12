import React, { useEffect, useState } from 'react';
import { getPressure, PressureData } from '../../api/discipline';

export const PressureDriftPanel: React.FC = () => {
    const [data, setData] = useState<PressureData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getPressure();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch pressure data', error);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div className="p-4 bg-zinc-900 border border-zinc-800 h-64 animate-pulse">Loading Pressure Metrics...</div>;

    const getPressureColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'text-zinc-400';
            case 'RISING': return 'text-amber-500';
            case 'HIGH': return 'text-red-600';
            default: return 'text-zinc-500';
        }
    };

    return (
        <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <h2 className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Pressure & Drift Dynamics</h2>
                <div className="flex flex-col items-end">
                    <span className="text-zinc-600 text-xs uppercase">Composite Pressure</span>
                    <span className={`text-2xl font-mono font-bold ${getPressureColor(data.compositePressure)}`}>
                        {data.compositePressure}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {data.driftVectors.map((vector, idx) => (
                    <div key={idx} className="bg-zinc-950 p-3 border-l-2 border-amber-600 flex justify-between items-center font-mono">
                        <div className="flex flex-col">
                            <span className="text-zinc-300 text-sm font-bold">{vector.source}</span>
                            <span className="text-zinc-600 text-xs">Threshold: {vector.threshold}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-amber-500 font-bold">{vector.current}</span>
                            <span className="text-zinc-500 text-xs">Breach in: {vector.timeToBreach}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

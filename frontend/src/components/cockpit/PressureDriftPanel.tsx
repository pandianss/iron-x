
import React, { useEffect, useState } from 'react';
import { DisciplineClient, type PressureData } from '../../domain/discipline';
import { DriftChart } from '../analytics/DriftChart';

export const PressureDriftPanel: React.FC = () => {
    const [data, setData] = useState<PressureData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DisciplineClient.getPressure();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch pressure data', error);
            }
        };
        fetchData();
    }, []);

    if (!data) return <div className="p-4 bg-iron-900 border border-iron-800 h-64 animate-pulse">Loading Pressure Metrics...</div>;

    const getPressureColor = (level: string | number) => {
        if (typeof level === 'number') {
            if (level < 30) return 'text-iron-400';
            if (level < 70) return 'text-amber-500';
            return 'text-red-600';
        }
        switch (level) {
            case 'LOW': return 'text-iron-400';
            case 'RISING': return 'text-amber-500';
            case 'HIGH': return 'text-red-600';
            default: return 'text-iron-500';
        }
    };

    return (
        <div className="flex-1 bg-transparent p-8 flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-iron-900 pb-6 relative">
                <div className="absolute bottom-0 left-0 w-8 h-1 bg-amber-500"></div>
                <div>
                    <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-2">Pressure & Drift Dynamics</h2>
                    <div className="text-2xl font-bold font-display text-white uppercase tracking-tight">Kinetic Response</div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] mb-1">Composite Load</span>
                    <span className={`text-5xl font-display font-bold tabular-nums leading-none ${getPressureColor(data.compositePressure)}`}>
                        {data.compositePressure}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-6">
                <div className="flex-1 min-h-0 border border-iron-900 bg-black/40 overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none opacity-5"
                        style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    <DriftChart />
                </div>

                <div className="grid grid-cols-2 gap-4 h-1/3 overflow-y-auto custom-scrollbar pr-2">
                    {data.driftVectors.map((vector, idx) => (
                        <div key={idx} className="bg-iron-950/60 p-4 border border-iron-900 border-l-2 border-l-amber-900 group hover:border-amber-700 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">{vector.source}</span>
                                    <span className="text-iron-700 text-[9px] uppercase tracking-widest font-mono mt-1">Ref: {vector.threshold}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-amber-500 font-display font-bold text-lg tabular-nums leading-none">{vector.current}</span>
                                    <div className="w-8 h-[2px] bg-iron-900 mt-1 ml-auto group-hover:bg-amber-900 transition-colors"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-iron-600 uppercase tracking-[0.2em] pt-2 border-t border-iron-900/50">
                                <span>Drift_Vector</span>
                                <span className="text-iron-400 font-mono">T-Minus: {vector.timeToBreach}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

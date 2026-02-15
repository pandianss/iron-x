
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

    const getPressureColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'text-iron-400';
            case 'RISING': return 'text-amber-500';
            case 'HIGH': return 'text-red-600';
            default: return 'text-iron-500';
        }
    };

    return (
        <div className="flex-1 bg-iron-900 border border-iron-800 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-iron-800 pb-4">
                <h2 className="text-iron-400 uppercase tracking-widest text-xs font-bold">Pressure & Drift Dynamics</h2>
                <div className="flex flex-col items-end">
                    <span className="text-iron-600 text-xs uppercase">Composite Pressure</span>
                    <span className={`text-2xl font-mono font-bold ${getPressureColor(data.compositePressure)}`}>
                        {data.compositePressure}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="flex-1 min-h-0 border border-iron-800 bg-iron-950/50 rounded overflow-hidden">
                    <DriftChart />
                </div>

                <div className="grid grid-cols-2 gap-4 h-1/3 overflow-y-auto">
                    {data.driftVectors.map((vector, idx) => (
                        <div key={idx} className="bg-iron-950 p-3 border-l-2 border-amber-600 flex justify-between items-center font-mono text-xs">
                            <div className="flex flex-col">
                                <span className="text-iron-300 font-bold">{vector.source}</span>
                                <span className="text-iron-600 text-[10px]">Threshold: {vector.threshold}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-amber-500 font-bold">{vector.current}</span>
                                <span className="text-iron-500 text-[10px] whitespace-nowrap">Breach: {vector.timeToBreach}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

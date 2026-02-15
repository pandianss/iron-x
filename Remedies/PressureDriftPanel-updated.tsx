// frontend/src/components/cockpit/PressureDriftPanel.tsx

import React, { useEffect, useState } from 'react';
import { DisciplineClient, PressureData } from '../../domain/discipline';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

export const PressureDriftPanel: React.FC = () => {
    const [data, setData] = useState<PressureData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const pressure = await DisciplineClient.getPressure();
                setData(pressure);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch pressure data:', err);
                setError(err.response?.data?.error || 'Failed to load pressure data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Refresh every 15 seconds for real-time feel
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="bg-gradient-to-br from-iron-900 to-iron-950 rounded-lg border border-iron-800 p-6 h-full flex items-center justify-center">
                <div className="text-iron-500 text-sm animate-pulse">Loading pressure analysis...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-red-950 to-iron-950 rounded-lg border border-red-800 p-6 h-full">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Error: {error}</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const getPressureLevel = (pressure: number) => {
        if (pressure < 10) return { label: 'MINIMAL', color: 'text-green-400' };
        if (pressure < 30) return { label: 'MODERATE', color: 'text-yellow-400' };
        if (pressure < 60) return { label: 'ELEVATED', color: 'text-orange-400' };
        return { label: 'CRITICAL', color: 'text-red-400' };
    };

    const pressureLevel = getPressureLevel(data.compositePressure);

    return (
        <div className="bg-gradient-to-br from-iron-900 to-iron-950 rounded-lg border border-iron-800 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-iron-100 font-bold text-lg mb-1">Pressure & Drift Analysis</h2>
                    <p className="text-iron-500 text-xs">Real-time behavioral deviation vectors</p>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-bold ${pressureLevel.color}`}>
                        {Math.abs(data.compositePressure).toFixed(1)}
                    </div>
                    <div className={`text-xs font-medium ${pressureLevel.color}`}>
                        {pressureLevel.label}
                    </div>
                </div>
            </div>

            {/* Pressure Gauge */}
            <div className="mb-6">
                <div className="bg-iron-950 rounded-lg p-4 border border-iron-800">
                    <div className="flex justify-between text-xs text-iron-500 mb-2">
                        <span>Composite Pressure</span>
                        <span>{data.compositePressure > 0 ? 'Negative Drift' : 'Positive Trend'}</span>
                    </div>
                    <div className="relative h-2 bg-iron-800 rounded-full overflow-hidden">
                        <div 
                            className={`absolute top-0 left-0 h-full ${
                                data.compositePressure > 50 ? 'bg-red-500' :
                                data.compositePressure > 30 ? 'bg-orange-500' :
                                data.compositePressure > 10 ? 'bg-yellow-500' :
                                'bg-green-500'
                            } transition-all duration-500`}
                            style={{ width: `${Math.min(Math.abs(data.compositePressure), 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Drift Vectors */}
            <div className="flex-1 overflow-y-auto space-y-3">
                <h3 className="text-iron-400 text-xs uppercase tracking-wider font-semibold mb-3">
                    Active Drift Vectors ({data.driftVectors.length})
                </h3>
                
                {data.driftVectors.length === 0 ? (
                    <div className="text-center py-8 text-iron-600">
                        <p className="text-sm">No significant drift detected</p>
                        <p className="text-xs mt-1">System operating within normal parameters</p>
                    </div>
                ) : (
                    data.driftVectors.map((vector, idx) => (
                        <div 
                            key={idx}
                            className={`bg-iron-950 rounded-lg p-4 border ${
                                vector.direction === 'NEGATIVE' 
                                    ? 'border-red-900 bg-gradient-to-r from-red-950/30 to-iron-950' 
                                    : 'border-green-900 bg-gradient-to-r from-green-950/30 to-iron-950'
                            } hover:border-iron-700 transition-all`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {vector.direction === 'NEGATIVE' ? (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    )}
                                    <span className="text-iron-200 font-medium text-sm">
                                        {vector.source}
                                    </span>
                                </div>
                                <span className={`text-xs font-bold ${
                                    vector.direction === 'NEGATIVE' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                    {vector.direction === 'NEGATIVE' ? '-' : '+'}{vector.magnitude.toFixed(1)}
                                </span>
                            </div>
                            
                            {/* Magnitude bar */}
                            <div className="relative h-1.5 bg-iron-900 rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full ${
                                        vector.direction === 'NEGATIVE' 
                                            ? 'bg-gradient-to-r from-red-600 to-red-400' 
                                            : 'bg-gradient-to-r from-green-600 to-green-400'
                                    } transition-all duration-300`}
                                    style={{ width: `${Math.min(vector.magnitude, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Indicator */}
            {data.compositePressure > 30 && (
                <div className="mt-4 pt-4 border-t border-iron-800">
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-950/30 px-3 py-2 rounded">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">
                            Elevated pressure detected - Review enforcement strategy
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

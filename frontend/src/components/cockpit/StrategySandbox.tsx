
import React, { useState } from 'react';
import { AnalyticsClient } from '../../domain/analytics';
import { Play, RotateCcw, TrendingUp, TrendingDown, Target } from 'lucide-react';

export const StrategySandbox: React.FC = () => {
    const [type, setType] = useState<'ADHERENCE_BOOST' | 'BUFFER_INCREASE' | 'STRICT_MODE_TOGGLE'>('ADHERENCE_BOOST');
    const [value, setValue] = useState(0.1);
    const [result, setResult] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const data = await AnalyticsClient.runSimulation(type, value);
            setResult(data);
        } catch (error) {
            console.error('Simulation failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-transparent p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-iron-900 pb-4 flex justify-between items-center">
                <span>Logic_Sandbox (Kinetic Projection)</span>
                <RotateCcw className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" onClick={() => setResult(null)} />
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setType('ADHERENCE_BOOST')}
                        className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${type === 'ADHERENCE_BOOST' ? 'bg-white text-black border-white' : 'bg-iron-950/40 border-iron-800 text-iron-600 hover:border-iron-600'}`}
                    >
                        Adherence Vector
                    </button>
                    <button
                        onClick={() => setType('BUFFER_INCREASE')}
                        className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${type === 'BUFFER_INCREASE' ? 'bg-white text-black border-white' : 'bg-iron-950/40 border-iron-800 text-iron-600 hover:border-iron-600'}`}
                    >
                        Buffer Array
                    </button>
                </div>

                <div className="flex flex-col gap-3 group">
                    <label className="text-[9px] text-iron-700 uppercase font-bold tracking-[0.3em] group-hover:text-iron-500 transition-colors">Modulation Intensity</label>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={value}
                        onChange={(e) => setValue(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-iron-600 font-mono tracking-widest">
                        <span>[ MIN ]</span>
                        <span className="text-white font-bold tabular-nums">VAL: {Math.round(value * 100)}%</span>
                        <span>[ MAX ]</span>
                    </div>
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full bg-iron-900 hover:bg-white hover:text-black text-white font-bold py-3 px-6 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all border border-iron-800 disabled:opacity-20 disabled:cursor-not-allowed group"
                >
                    <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                    {loading ? 'Processing Protocol...' : 'Execute Calculation'}
                </button>
            </div>

            {r && (
                <div className="mt-4 p-5 bg-black/60 border border-iron-900 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 right-0 w-8 h-8 opacity-[0.05] pointer-events-none group-hover:opacity-10">
                        <Target className="w-full h-full text-white" />
                    </div>
                    <div className="flex justify-between items-center mb-4 border-b border-iron-900 pb-2">
                        <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] font-bold">Simulation Result_Set</span>
                        {r.impact === 'POSITIVE' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="text-4xl font-display font-bold text-white leading-none tabular-nums">{r.simulatedScore.toFixed(1)}</div>
                        <div className={`text-xs font-bold font-mono py-0.5 px-2 mb-0.5 ${r.delta >= 0 ? 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/40' : 'bg-red-950/30 text-red-500 border border-red-900/40'}`}>
                            {r.delta >= 0 ? '+' : ''}{r.delta}
                        </div>
                    </div>
                    <div className="text-[9px] text-iron-700 mt-3 uppercase font-mono tracking-[0.2em] italic underline underline-offset-4 decoration-iron-900">
                        Projected 30-Cycle Equilibrium Point
                    </div>

                    <div className="mt-6 pt-4 border-t border-iron-900 flex items-start gap-4">
                        <div className="w-1 h-8 bg-iron-800 flex-shrink-0"></div>
                        <span className="text-[10px] text-iron-500 italic leading-snug font-mono">
                            "Observation: Adjusting {type.replace('_', ' ')} intensity to {Math.round(value * 100)}% modulates system integrity by {Math.abs(r.delta)} units."
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

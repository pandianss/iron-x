
import React, { useState } from 'react';
import { AnalyticsClient } from '../../domain/analytics';
import { Play, RotateCcw, TrendingUp, TrendingDown, Target } from 'lucide-react';

export const StrategySandbox: React.FC = () => {
    const [type, setType] = useState<'ADHERENCE_BOOST' | 'BUFFER_INCREASE' | 'STRICT_MODE_TOGGLE'>('ADHERENCE_BOOST');
    const [value, setValue] = useState(0.1);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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
        <div className="bg-iron-900 border border-iron-800 p-6 flex flex-col gap-4">
            <h2 className="text-iron-400 uppercase tracking-widest text-xs font-bold border-b border-iron-800 pb-4 flex justify-between items-center">
                <span>Strategy Sandbox (Impact Simulation)</span>
                <RotateCcw className="w-3 h-3 cursor-pointer hover:text-iron-200" onClick={() => setResult(null)} />
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setType('ADHERENCE_BOOST')}
                        className={`px-3 py-2 text-[10px] font-bold uppercase border ${type === 'ADHERENCE_BOOST' ? 'bg-amber-900 border-amber-600 text-amber-100' : 'bg-iron-950 border-iron-800 text-iron-500'}`}
                    >
                        Adherence +
                    </button>
                    <button
                        onClick={() => setType('BUFFER_INCREASE')}
                        className={`px-3 py-2 text-[10px] font-bold uppercase border ${type === 'BUFFER_INCREASE' ? 'bg-amber-900 border-amber-600 text-amber-100' : 'bg-iron-950 border-iron-800 text-iron-500'}`}
                    >
                        Buffer +
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-iron-500 uppercase font-bold tracking-tighter">Impact Intensity</label>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={value}
                        onChange={(e) => setValue(parseFloat(e.target.value))}
                        className="w-full h-1 bg-iron-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[9px] text-iron-600 font-mono">
                        <span>LOW</span>
                        <span>{Math.round(value * 100)}%</span>
                        <span>MAX</span>
                    </div>
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    <Play className="w-3 h-3 fill-current" />
                    {loading ? 'Processing...' : 'Execute Simulation'}
                </button>
            </div>

            {result && (
                <div className="mt-4 p-4 bg-iron-950 border border-amber-900/50 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-iron-500 text-[10px] uppercase font-bold tracking-tighter">Simulation Output</span>
                        {result.impact === 'POSITIVE' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>

                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-mono font-bold text-iron-100">{result.simulatedScore.toFixed(1)}</div>
                        <div className={`text-[10px] font-bold ${result.delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {result.delta >= 0 ? '+' : ''}{result.delta}
                        </div>
                    </div>
                    <div className="text-[9px] text-iron-600 mt-1 uppercase font-mono tracking-widest">
                        Projected 30-Day Equilibrium
                    </div>

                    <div className="mt-4 pt-4 border-t border-iron-800 flex items-center gap-3">
                        <Target className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] text-iron-400 italic leading-tight">
                            "Adjusting {type.replace('_', ' ')} by {Math.round(value * 100)}% drives a {result.impact.toLowerCase()} shift in system integrity."
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

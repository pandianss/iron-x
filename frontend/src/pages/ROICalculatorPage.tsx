import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, AlertCircle, ChevronLeft } from 'lucide-react';

const ROICalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState(50);
    const [hourlyRate, setHourlyRate] = useState(60);
    const [driftHours, setDriftHours] = useState(4);

    const annualSavings = employees * hourlyRate * driftHours * 52;
    const ironXCost = employees * 49 * 12; // Operator plan per year
    const netRecovery = annualSavings - ironXCost;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-32 md:pt-40 font-mono infrastructure-bg">
            <div className="max-w-6xl mx-auto">
                <header className="mb-20 text-center pt-10">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-12 text-iron-600 hover:text-white transition-colors flex items-center gap-2 mx-auto text-xs uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" /> [ Return to System Hub ]
                    </button>
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 font-display uppercase tracking-tight leading-tight">
                        Governance <br />
                        <span className="text-iron-500">Projection Engine</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Model the impact of enforced discipline parameters on your operational baseline.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Inputs */}
                    <div className="space-y-12 bg-iron-950/30 p-10 border border-iron-900 hardened-border">
                        <div className="space-y-6">
                            <h3 className="text-xs font-mono text-iron-500 uppercase tracking-[0.3em] border-b border-iron-900 pb-2">Input Parameters</h3>

                            <div className="space-y-4">
                                <label className="text-sm text-neutral-400 uppercase tracking-widest flex justify-between">
                                    Operator Count (Nodes) <span>{employees}</span>
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="1000"
                                    value={employees}
                                    onChange={(e) => setEmployees(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm text-neutral-400 uppercase tracking-widest flex justify-between">
                                    Avg Hourly Rate <span>${hourlyRate}</span>
                                </label>
                                <input
                                    type="range"
                                    min="15"
                                    max="200"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm text-neutral-400 uppercase tracking-widest flex justify-between">
                                    Discipline Drift (Hrs/Wk) <span>{driftHours}h</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={driftHours}
                                    onChange={(e) => setDriftHours(Number(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-[10px] text-iron-700 uppercase leading-relaxed mt-2">
                                    Context switching, priority dilution, and variance in execution cycles.
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-iron-900">
                            <h4 className="text-xs font-mono text-iron-500 uppercase tracking-widest mb-4">Projection Assumptions</h4>
                            <ul className="space-y-2 text-[10px] text-iron-800 uppercase">
                                <li>- Results represent modeled stabilization, not guaranteed performance</li>
                                <li>- Individual variance affects convergence timeline</li>
                                <li>- System requires 14–21 days for behavioral normalization</li>
                            </ul>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                        <div className="bg-iron-950/20 p-12 md:p-16 border border-iron-800 flex flex-col items-center text-center relative overflow-hidden glass-panel min-h-[500px] justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Server className="w-24 h-24 text-white" />
                            </div>

                            {/* Technical Decorative Elements */}
                            <div className="absolute top-6 right-6 flex flex-col gap-1.5 opacity-20">
                                <div className="w-8 h-3 border border-white rounded-full" />
                                <div className="w-8 h-3 border border-white rounded-full bg-white/20" />
                            </div>

                            <div className="mb-12">
                                <h3 className="text-xs font-mono text-iron-500 mb-6 uppercase tracking-[0.4em]">Annual System Recovery</h3>
                                <div className="text-6xl md:text-7xl font-bold text-white font-display tabular-nums">
                                    ${annualSavings.toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 w-full border-t border-iron-900 pt-12 text-left">
                                <div>
                                    <h4 className="text-[10px] font-mono text-iron-600 mb-1 uppercase tracking-widest">Infra Investment</h4>
                                    <p className="text-xl font-bold text-neutral-300 font-display tabular-nums">${ironXCost.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-mono text-iron-600 mb-1 uppercase tracking-widest">Net Recovery</h4>
                                    <p className="text-xl font-bold text-iron-400 font-display tabular-nums">${netRecovery.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-4 text-xs font-mono text-iron-800 bg-black/50 px-6 py-3 border border-iron-900 w-full">
                                <AlertCircle className="w-4 h-4 text-iron-900" />
                                <span className="uppercase">Assumes 15% resistance factor</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-white text-black py-6 font-bold font-display uppercase tracking-widest text-lg hover:bg-neutral-200 transition-all shadow-xl shadow-iron-500/5"
                        >
                            Initialize Infrastructure
                        </button>
                    </div>
                </div>

                <footer className="mt-32 pt-12 border-t border-iron-900 flex justify-between items-end opacity-40">
                    <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-iron-600">
                        Version: EP_v1.0.42 // Cycle: Delta_9
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-px bg-iron-700 mt-2" />
                        <div className="w-4 h-4 border border-iron-700 rotate-12" />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ROICalculatorPage;

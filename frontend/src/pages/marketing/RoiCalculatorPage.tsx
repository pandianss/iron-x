
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Calculator, Activity, ArrowRight } from 'lucide-react';

const RoiCalculatorPage: React.FC = () => {
    // Inputs
    const [hourlyRate, setHourlyRate] = useState(50);
    const [hoursLostPerWeek, setHoursLostPerWeek] = useState(5);
    const [teamSize, setTeamSize] = useState(1);
    const [reworkPercent, setReworkPercent] = useState(30);

    // Calculated fields
    const [monthlyRevenueLost, setMonthlyRevenueLost] = useState(0);
    const [reworkCostMonthly, setReworkCostMonthly] = useState(0);
    const [totalCostMonthly, setTotalCostMonthly] = useState(0);
    const [ironXCost, setIronXCost] = useState(0);
    const [netROI, setNetROI] = useState(0);
    const [roiMultiple, setRoiMultiple] = useState('0');
    const [breakEvenHours, setBreakEvenHours] = useState(0);

    useEffect(() => {
        const weeklyHoursLost = hoursLostPerWeek * teamSize;
        const weeklyRevenueLost = weeklyHoursLost * hourlyRate;
        const mRevLost = weeklyRevenueLost * 4.33;
        const rCostMonthly = mRevLost * (reworkPercent / 100);
        const tCostMonthly = mRevLost + rCostMonthly;
        
        const iXCost = teamSize === 1 ? 49 : 49 + (teamSize - 1) * 39;
        const nROI = tCostMonthly - iXCost;
        const rMultiple = (nROI / iXCost).toFixed(1);
        const bEvenHours = iXCost / hourlyRate;

        setMonthlyRevenueLost(mRevLost);
        setReworkCostMonthly(rCostMonthly);
        setTotalCostMonthly(tCostMonthly);
        setIronXCost(iXCost);
        setNetROI(nROI);
        setRoiMultiple(rMultiple);
        setBreakEvenHours(parseFloat(bEvenHours.toFixed(2)));
    }, [hourlyRate, hoursLostPerWeek, teamSize, reworkPercent]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="min-h-screen bg-black text-white font-mono p-6 md:p-12 selection:bg-white selection:text-black">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-12 flex items-center gap-2 text-[10px] uppercase tracking-widest text-iron-700">
                    <Link to="/" className="hover:text-white transition-colors">Origin</Link>
                    <span>/</span>
                    <span className="text-iron-500">Projection Engine</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Inputs */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4">
                                Drift <span className="text-iron-600">ROI</span> Processor
                            </h1>
                            <p className="text-sm text-iron-700 uppercase tracking-widest leading-relaxed">
                                Calculate the financial impact of behavioral drift and the recovery potential of the Iron-X protocol.
                            </p>
                        </div>

                        <div className="space-y-10">
                            {/* Hourly Rate */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500">Hourly Rate (USD)</label>
                                    <span className="text-xl font-bold font-display">${hourlyRate}</span>
                                </div>
                                <input 
                                    type="range" min="10" max="500" step="10"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                                    className="w-full h-1 bg-iron-900 appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            {/* Hours Lost */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500">Weekly Drift (Hours)</label>
                                    <span className="text-xl font-bold font-display">{hoursLostPerWeek} hrs</span>
                                </div>
                                <input 
                                    type="range" min="0" max="40" step="1"
                                    value={hoursLostPerWeek}
                                    onChange={(e) => setHoursLostPerWeek(parseInt(e.target.value))}
                                    className="w-full h-1 bg-iron-900 appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            {/* Team Size */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500">Deployment Scale (Users)</label>
                                    <span className="text-xl font-bold font-display">{teamSize} Node{teamSize > 1 ? 's' : ''}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="100" step="1"
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(parseInt(e.target.value))}
                                    className="w-full h-1 bg-iron-900 appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            {/* Rework % */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-iron-500">Downstream Rework Impact (%)</label>
                                    <span className="text-xl font-bold font-display">{reworkPercent}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="5"
                                    value={reworkPercent}
                                    onChange={(e) => setReworkPercent(parseInt(e.target.value))}
                                    className="w-full h-1 bg-iron-900 appearance-none cursor-pointer accent-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Output */}
                    <div className="bg-iron-950/20 border border-iron-900 p-8 md:p-12 hardened-border relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calculator size={120} />
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-12 text-iron-500">
                                <Terminal size={18} />
                                <span className="text-xs uppercase tracking-[0.3em]">Projection Engine // Live Result</span>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="space-y-2">
                                    <div className="text-[10px] text-iron-700 uppercase tracking-widest">Monthly Revenue At Risk</div>
                                    <div className="text-3xl font-display font-black">{formatCurrency(monthlyRevenueLost)}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[10px] text-iron-700 uppercase tracking-widest">Rework / Downstream Cost</div>
                                    <div className="text-3xl font-display font-black">{formatCurrency(reworkCostMonthly)}</div>
                                </div>

                                <div className="pt-8 border-t border-iron-900">
                                    <div className="text-[10px] text-white uppercase tracking-widest mb-1">Total Monthly Cost of Inaction</div>
                                    <div className="text-5xl font-display font-black text-red-600 tracking-tighter">
                                        {formatCurrency(totalCostMonthly)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 py-8 border-t border-iron-900">
                                <div>
                                    <div className="text-[9px] text-iron-700 uppercase tracking-widest mb-1">Iron-X Investment</div>
                                    <div className="text-xl font-display font-bold">{formatCurrency(ironXCost)}<span className="text-xs text-iron-700 tracking-normal">/mo</span></div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-iron-700 uppercase tracking-widest mb-1">Net Monthly Recovery</div>
                                    <div className="text-xl font-display font-bold text-green-500">{formatCurrency(netROI)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-iron-900">
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-center px-6 py-2 border border-iron-900 bg-black">
                                    <div className="text-[8px] text-iron-700 uppercase tracking-widest mb-1">ROI Multiple</div>
                                    <div className="text-2xl font-display font-black text-white">{roiMultiple}x</div>
                                </div>
                                <div className="text-center px-6 py-2 border border-iron-900 bg-black text-right">
                                    <div className="text-[8px] text-iron-700 uppercase tracking-widest mb-1">Break-Even</div>
                                    <div className="text-2xl font-display font-black text-white">{breakEvenHours}h</div>
                                </div>
                            </div>

                            {netROI > 0 ? (
                                <div className="space-y-4">
                                    <Link 
                                        to="/register" 
                                        className="flex items-center justify-between w-full bg-white text-black px-6 py-4 font-display font-black uppercase text-sm hover:bg-neutral-200 transition-all group"
                                    >
                                        Initialize Operator Node
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-[8px] text-iron-700 uppercase tracking-widest text-center">
                                        // $49/mo deployment covers individual operator license.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 border border-iron-900 bg-iron-950/30 text-[9px] text-iron-500 uppercase leading-relaxed tracking-wider">
                                    // NOTE: At your current inputs, Iron-X may not be cost-justified for individual use. 
                                    Consider Institutional tier for distributed team deployment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-24 pt-12 border-t border-iron-900 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
                    <div className="flex items-center gap-4">
                        <Activity size={16} className="text-iron-500" />
                        <span className="text-[10px] uppercase tracking-[0.4em]">Discipline is a high-yield asset class.</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest">
                        Model Version: IX-PE-V2.1 // Audit Locked
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoiCalculatorPage;

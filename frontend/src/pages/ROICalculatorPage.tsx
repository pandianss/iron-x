
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROICalculatorPage: React.FC = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState(50);
    const [hourlyRate, setHourlyRate] = useState(60); // $
    const [driftHours, setDriftHours] = useState(4); // Hours wasted per week per employee due to lack of discipline

    const annualSavings = employees * hourlyRate * driftHours * 52;
    const ironXCost = employees * 15 * 12; // Pro plan per year
    const roi = ((annualSavings - ironXCost) / ironXCost) * 100;

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-iron-400 to-iron-100 bg-clip-text text-transparent">
                        The Cost of Discipline Drift
                    </h1>
                    <p className="text-xl text-neutral-400">
                        Calculate how much "approximate execution" is costing your organization.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Inputs */}
                    <div className="space-y-8 bg-neutral-800 p-8 rounded-xl border border-neutral-700">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Number of Employees
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="1000"
                                value={employees}
                                onChange={(e) => setEmployees(Number(e.target.value))}
                                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-iron-500"
                            />
                            <div className="mt-2 text-2xl font-mono text-iron-400">{employees}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Average Hourly Rate ($)
                            </label>
                            <input
                                type="range"
                                min="15"
                                max="200"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-iron-500"
                            />
                            <div className="mt-2 text-2xl font-mono text-iron-400">${hourlyRate}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                "Drift Hours" per Week (per Employee)
                            </label>
                            <p className="text-xs text-neutral-500 mb-2">
                                Time lost to context switching, unclear priorities, or lack of SOP adherence.
                            </p>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={driftHours}
                                onChange={(e) => setDriftHours(Number(e.target.value))}
                                className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-iron-500"
                            />
                            <div className="mt-2 text-2xl font-mono text-iron-400">{driftHours} hrs</div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 flex flex-col justify-center items-center text-center">
                        <div className="mb-8">
                            <h3 className="text-lg text-neutral-400 mb-2">Potential Annual Savings</h3>
                            <div className="text-5xl font-bold text-green-400">
                                ${annualSavings.toLocaleString()}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg text-neutral-400 mb-2">Annual Iron-X Cost (Est.)</h3>
                            <div className="text-3xl font-mono text-white">
                                ${ironXCost.toLocaleString()}
                            </div>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-lg text-neutral-400 mb-2">ROI</h3>
                            <div className="text-4xl font-bold text-iron-300">
                                {roi.toFixed(0)}%
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-neutral-200 transition-colors w-full"
                        >
                            Stop the Drift. Start Iron-X.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ROICalculatorPage;

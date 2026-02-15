import React from 'react';
import { DisciplineStatusBar } from '../components/cockpit/DisciplineStatusBar';
import { PressureDriftPanel } from '../components/cockpit/PressureDriftPanel';
import { ActiveControlsPanel } from '../components/cockpit/ActiveControlsPanel';
import { ViolationHorizon } from '../components/cockpit/ViolationHorizon';
import { PerformancePanel } from '../components/cockpit/PerformancePanel';
import { StrategySandbox } from '../components/cockpit/StrategySandbox';
import { useDiscipline } from '../hooks/useDiscipline';

const CockpitPage: React.FC = () => {
    const { state } = useDiscipline();

    // Determine lockout state
    const lockedUntil = state?.activeConstraints.lockedUntil ? new Date(state.activeConstraints.lockedUntil) : null;
    const isLocked = lockedUntil && lockedUntil > new Date();

    return (
        <div className={`min-h-screen bg-iron-950 text-iron-300 font-sans selection:bg-amber-900 selection:text-amber-100 flex flex-col overflow-hidden relative ${isLocked ? 'pointer-events-none grayscale' : ''}`}>

            {/* 1. Discipline Status Bar (Always Visible) */}
            <div className="flex-none z-50">
                <DisciplineStatusBar />
            </div>

            {/* Main Content Area - Grid Layout for Single Screen */}
            <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 p-4 min-h-0 relative">
                {/* 2. Pressure & Drift Panel */}
                <div className="col-span-8 row-span-4 flex flex-col min-h-0 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <PressureDriftPanel />
                </div>

                {/* 3. Active Controls & Constraints */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <ActiveControlsPanel />
                </div>

                {/* 4. Violation Horizon */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <ViolationHorizon />
                </div>

                {/* 5. Strategy Sandbox */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <StrategySandbox />
                </div>

                {/* 6. Performance Panel */}
                <div className="col-span-8 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <PerformancePanel />
                </div>
            </div>

            {/* HARD LOCKDOWN OVERLAY */}
            {isLocked && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-1000">
                    <div className="max-w-xl w-full border-y border-red-900/50 bg-red-950/10 p-12 text-center relative overflow-hidden">
                        {/* Matrix Grid Background for Lockout */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#ff0000 1px, transparent 1px)', backgroundSize: '15px 15px' }}
                        />

                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-0.5 bg-red-600 hidden md:block"></div>
                                <h1 className="text-red-600 text-[10px] font-bold uppercase tracking-[1em]">Operational_Lockdown</h1>
                                <div className="w-16 h-0.5 bg-red-600 hidden md:block"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-5xl font-display font-black text-white tracking-tight tabular-nums animate-pulse">
                                    SUSPENDED
                                </div>
                                <p className="text-iron-500 font-mono text-[11px] leading-relaxed max-w-sm mx-auto uppercase tracking-wider">
                                    System integrity breach detected. Governance protocol has restricted all node operations to read-only status.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="text-[10px] text-red-900 font-bold uppercase tracking-widest">Protocol Restoration In:</div>
                                <div className="text-4xl font-mono text-iron-200 tabular-nums font-bold border border-iron-900 px-8 py-3 bg-black/40">
                                    {Math.max(0, Math.ceil((lockedUntil.getTime() - new Date().getTime()) / 3600000))} HOURS
                                </div>
                                <div className="text-[9px] text-iron-700 italic font-mono mt-2">
                                    REF_ID: {lockedUntil.getTime().toString(16).toUpperCase()} // MODE: HARD_ENFORCEMENT
                                </div>
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-600"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-600"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600"></div>
                    </div>
                </div>
            )}

            {/* Background elements for "Control Room" feel */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
        </div>
    );
};

export default CockpitPage;

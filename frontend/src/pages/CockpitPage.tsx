import React from 'react';
import { DisciplineStatusBar } from '../components/cockpit/DisciplineStatusBar';
import { PressureDriftPanel } from '../components/cockpit/PressureDriftPanel';
import { ActiveControlsPanel } from '../components/cockpit/ActiveControlsPanel';
import { ViolationHorizon } from '../components/cockpit/ViolationHorizon';
import { PerformancePanel } from '../components/cockpit/PerformancePanel';
import { StrategySandbox } from '../components/cockpit/StrategySandbox';

const CockpitPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-iron-950 text-iron-300 font-sans selection:bg-amber-900 selection:text-amber-100 flex flex-col overflow-hidden">
            {/* 1. Discipline Status Bar (Always Visible) */}
            <div className="flex-none z-50">
                <DisciplineStatusBar />
            </div>

            {/* Main Content Area - Grid Layout for Single Screen */}
            <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 p-4 min-h-0">

                {/* 2. Pressure & Drift Panel (Primary Focus) - Takes up significant space */}
                <div className="col-span-8 row-span-4 flex flex-col min-h-0 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <PressureDriftPanel />
                </div>

                {/* 3. Active Controls & Constraints (Top Right) */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <ActiveControlsPanel />
                </div>

                {/* 7. Violation Horizon (Middle Right) */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <ViolationHorizon />
                </div>

                {/* 8. Strategy Sandbox (Bottom Right) */}
                <div className="col-span-4 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <StrategySandbox />
                </div>

                {/* Bottom Left Panel */}
                <div className="col-span-8 row-span-2 flex flex-col min-h-0 overflow-hidden">
                    <PerformancePanel />
                </div>
            </div>

            {/* Background elements for "Control Room" feel */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
        </div>
    );
};

export default CockpitPage;

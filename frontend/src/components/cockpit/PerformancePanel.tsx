
import { useState } from 'react';
import { AuditLog } from './AuditLog';
import TeamVelocityChart from '../analytics/TeamVelocityChart';
import { BarChart2, List } from 'lucide-react';

export function PerformancePanel() {
    const [activeTab, setActiveTab] = useState<'audit' | 'velocity'>('audit');

    return (
        <div className="flex-1 bg-transparent flex flex-col overflow-hidden">
            <div className="flex border-b border-iron-900 bg-black/20">
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-r border-iron-900 ${activeTab === 'audit' ? 'text-white bg-iron-900/40 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' : 'text-iron-600 hover:text-iron-400'}`}
                >
                    <List size={14} className="stroke-[3]" />
                    Governance Log
                </button>
                <button
                    onClick={() => setActiveTab('velocity')}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-r border-iron-900 ${activeTab === 'velocity' ? 'text-white bg-iron-900/40 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' : 'text-iron-600 hover:text-iron-400'}`}
                >
                    <BarChart2 size={14} className="stroke-[3]" />
                    Operational Velocity
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative bg-black/40">
                <div className="absolute inset-0 pointer-events-none opacity-5"
                    style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '15px 15px' }}
                />

                <div className="relative z-10 h-full">
                    {activeTab === 'audit' && <AuditLog />}
                    {activeTab === 'velocity' && (
                        <div className="h-full w-full p-6 overflow-hidden">
                            <TeamVelocityChart />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

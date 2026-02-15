
import React, { useState } from 'react';
import { AuditLog } from './AuditLog';
import { TeamVelocityChart } from '../analytics/TeamVelocityChart';
import { BarChart2, List } from 'lucide-react';

export const PerformancePanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'audit' | 'velocity'>('audit');

    return (
        <div className="flex-1 bg-zinc-900 border border-zinc-800 flex flex-col overflow-hidden">
            <div className="flex border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'audit' ? 'text-white bg-zinc-800 border-r border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <List size={14} />
                    Audit Log
                </button>
                <button
                    onClick={() => setActiveTab('velocity')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'velocity' ? 'text-white bg-zinc-800 border-x border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <BarChart2 size={14} />
                    Team Velocity
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative">
                {activeTab === 'audit' && <AuditLog />}
                {activeTab === 'velocity' && (
                    <div className="h-full w-full p-4 overflow-hidden">
                        <TeamVelocityChart />
                    </div>
                )}
            </div>
        </div>
    );
};

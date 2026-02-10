import React from 'react';
import { Lock, EyeOff, ShieldAlert } from 'lucide-react';

interface Exception {
    id: string;
    title: string;
    expiry: string;
}

interface ControlsPanelProps {
    policies: string[];
    exceptions: Exception[];
    reducedPrivileges: string[];
    frozenActions: string[];
}

export const ActiveControlsPanel: React.FC<ControlsPanelProps> = ({ policies, exceptions, reducedPrivileges, frozenActions }) => {
    return (
        <div className="w-full flex flex-col gap-4 p-6 panel-border bg-neutral-muted">
            <div className="flex items-center gap-2">
                <Lock size={16} className="opacity-50" />
                <h2 className="text-sm uppercase tracking-widest opacity-70">Active Controls & Constraints</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2">
                {/* Active Policies */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase opacity-40 font-bold">Enforced Policies (RO)</span>
                    <div className="flex flex-col gap-1">
                        {policies.map((p, i) => (
                            <div key={i} className="text-xs py-2 px-3 bg-neutral-base panel-border border-white/5 flex items-center justify-between">
                                <span>{p}</span>
                                <Lock size={12} className="opacity-20" />
                            </div>
                        ))}
                    </div>

                    <span className="text-[10px] uppercase opacity-40 font-bold mt-2">Active Exceptions</span>
                    {exceptions.map((ex, i) => (
                        <div key={i} className="text-xs py-2 px-3 bg-neutral-base border border-amber-500/30 flex items-center justify-between">
                            <span className="signal-amber">{ex.title}</span>
                            <span className="mono-display text-[10px] opacity-70">EXP: {ex.expiry}</span>
                        </div>
                    ))}
                </div>

                {/* Removed Capabilities */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase signal-red font-bold">Privilege Loss</span>
                        <ShieldAlert size={14} className="signal-red" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {reducedPrivileges.map((rp, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 bg-red-900/20 border border-red-900/40 signal-red line-through">
                                {rp}
                            </span>
                        ))}
                    </div>

                    <span className="text-[10px] uppercase opacity-40 font-bold mt-2">Frozen Actions</span>
                    <div className="flex flex-col gap-1">
                        {frozenActions.map((fa, i) => (
                            <div key={i} className="text-xs py-2 px-3 bg-neutral-base/50 border border-white/5 flex items-center justify-between opacity-50 grayscale">
                                <span>{fa}</span>
                                <EyeOff size={12} className="opacity-30" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

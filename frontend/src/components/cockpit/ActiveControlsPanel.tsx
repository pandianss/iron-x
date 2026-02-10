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
        <div className="w-full flex flex-col gap-4 p-6 panel-border bg-neutral-muted relative overflow-hidden crt-flicker">
            <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="opacity-20" />
                <h2 className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Active Controls & Enforcement Bound</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-2 relative z-10">
                {/* Active Policies */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase opacity-30 font-bold mb-1">Locked Policies</span>
                        {policies.map((p, i) => (
                            <div key={i} className="text-[11px] py-1.5 px-3 bg-neutral-base border-l-2 border-l-neutral-border flex items-center justify-between group">
                                <span className="opacity-60 group-hover:opacity-100 transition-opacity">{p}</span>
                                <Lock size={10} className="opacity-10" />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase signal-amber font-bold mb-1 opacity-70">Active Exceptions</span>
                        {exceptions.length > 0 ? exceptions.map((ex, i) => (
                            <div key={i} className="text-[11px] py-2 px-3 bg-amber-900/5 border border-amber-900/20 flex items-center justify-between">
                                <span className="signal-amber font-bold">{ex.title}</span>
                                <span className="mono-display text-[10px] opacity-40 tabular-nums">EXP: {ex.expiry}</span>
                            </div>
                        )) : <span className="text-[10px] italic opacity-20">No exceptions active.</span>}
                    </div>
                </div>

                {/* Removed Capabilities */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-red-900/20 pb-1">
                            <span className="text-[9px] uppercase signal-red font-bold">Privilege Loss</span>
                            <ShieldAlert size={12} className="signal-red opacity-50" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {reducedPrivileges.map((rp, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-red-900/10 border border-red-900/20 signal-red line-through opacity-60">
                                    {rp}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase opacity-30 font-bold mb-1">Frozen Actions</span>
                        <div className="flex flex-col gap-1">
                            {frozenActions.map((fa, i) => (
                                <div key={i} className="text-[11px] py-1.5 px-3 bg-neutral-base/30 border border-white/5 flex items-center justify-between opacity-30 grayscale italic">
                                    <span>{fa}</span>
                                    <EyeOff size={10} className="opacity-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background technical watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-[100px] font-black select-none pointer-events-none uppercase">
                LOCKED
            </div>
        </div>
    );
};

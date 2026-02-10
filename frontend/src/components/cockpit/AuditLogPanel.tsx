import React from 'react';
import { History, ShieldAlert, BadgeCheck } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    impact: string;
    severity: string;
}

interface AuditLogProps {
    logs: LogEntry[];
}

export const AuditLogPanel: React.FC<AuditLogProps> = ({ logs }) => {
    return (
        <div className="w-full h-48 flex flex-col gap-3 p-4 panel-border bg-neutral-muted/50 overflow-hidden relative crt-flicker">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <History size={14} className="opacity-20" />
                    <h2 className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Immutable Audit & Consequence Log</h2>
                </div>
                <span className="text-[8px] opacity-20 mono-display tabular-nums">LOG_V2.0_SECURE_READ</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {logs.map((log, i) => {
                    // Calculate opacity based on index to simulate fading scar record
                    const opacity = Math.max(0.1, 1 - i * 0.15);
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-4 text-[10px] py-1 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                            style={{ opacity }}
                        >
                            <span className="mono-display opacity-40 shrink-0 tabular-nums">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                            <span className="mono-display text-neutral-accent shrink-0 select-all tracking-tighter">[{log.id}]</span>
                            <div className={`flex items-center gap-1 shrink-0 ${log.severity === 'HIGH' ? 'signal-red' : 'text-neutral-accent'}`}>
                                {log.severity === 'HIGH' ? <ShieldAlert size={10} className="animate-pulse" /> : <BadgeCheck size={10} className="opacity-30" />}
                                <span className="uppercase font-bold tracking-tight">{log.action}</span>
                            </div>
                            <span className="opacity-50 truncate flex-1">{log.impact}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1 overflow-hidden">
                <span className="text-[8px] uppercase opacity-20 whitespace-nowrap">Entries cannot be deleted • Permanent record • Severity immutable</span>
                <span className="text-[8px] mono-display opacity-10 tabular-nums">NODE_HASH: 0x8F2A...E9B2</span>
            </div>
        </div>
    );
};

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
        <div className="w-full h-48 flex flex-col gap-3 p-4 panel-border bg-neutral-muted/50 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <History size={14} className="opacity-50" />
                    <h2 className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Immutable Audit & Consequence Log</h2>
                </div>
                <span className="text-[10px] opacity-20 mono-display">LOG_V2.0_READ_ONLY</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] py-1 border-b border-white/5 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="mono-display opacity-40 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="mono-display text-neutral-accent shrink-0 select-all">[{log.id}]</span>
                        <div className={`flex items-center gap-1 shrink-0 ${log.severity === 'HIGH' ? 'signal-red' : 'text-neutral-accent'}`}>
                            {log.severity === 'HIGH' ? <ShieldAlert size={10} /> : <BadgeCheck size={10} />}
                            <span className="uppercase font-bold">{log.action}</span>
                        </div>
                        <span className="opacity-50 truncate">{log.impact}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-2 opacity-20">
                <span className="text-[8px] uppercase">Entries cannot be deleted • Permanent scar record</span>
                <span className="text-[8px] mono-display">REF_HSH: 8f2a...e9b1</span>
            </div>
        </div>
    );
};

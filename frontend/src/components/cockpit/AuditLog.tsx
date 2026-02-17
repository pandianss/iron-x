import { useEffect, useState } from 'react';
import { DisciplineClient, type AuditEntry } from '../../domain/discipline';

export function AuditLog() {
    const [history, setHistory] = useState<AuditEntry[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DisciplineClient.getHistory();
                setHistory(result);
            } catch (error) {
                console.error('Failed to fetch history', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-iron-900 border border-iron-800 p-6 flex flex-col gap-4">
            <h2 className="text-iron-400 uppercase tracking-widest text-xs font-bold border-b border-iron-800 pb-4">Audit & Consequence Log (Immutable)</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-iron-600 text-xs uppercase border-b border-iron-800">
                            <th className="pb-2 font-mono">Timestamp</th>
                            <th className="pb-2 font-mono">ID</th>
                            <th className="pb-2">Event / Action</th>
                            <th className="pb-2">Impact</th>
                            <th className="pb-2">Severity</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-mono">
                        {history.map((entry) => (
                            <tr key={entry.id} className="border-b border-iron-800/50 hover:bg-iron-950/50 text-iron-400">
                                <td className="py-2 pr-4 text-iron-500 text-xs opacity-70">{entry.timestamp}</td>
                                <td className="py-2 pr-4 text-iron-600 text-xs">{entry.id}</td>
                                <td className="py-2 pr-4 text-iron-300">{entry.action}</td>
                                <td className="py-2 pr-4 text-red-500">{entry.impact}</td>
                                <td className="py-2 text-xs">
                                    <span className={`px-1 border ${entry.severity === 'HIGH' ? 'border-red-900 text-red-500' : 'border-iron-700 text-iron-500'}`}>
                                        {entry.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

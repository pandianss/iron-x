import React, { useEffect, useState } from 'react';
import { DisciplineClient, type ConstraintsData } from '../../domain/discipline';
import { useDiscipline } from '../../context/DisciplineContext';

export const ActiveControlsPanel: React.FC = () => {
    const { refreshTrigger } = useDiscipline();
    const [data, setData] = useState<ConstraintsData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DisciplineClient.getConstraints();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch constraints', error);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    if (!data) return <div className="p-4 bg-iron-900 border border-iron-800 h-64 animate-pulse">Loading Controls...</div>;

    return (
        <div className="flex-1 bg-iron-900 border border-iron-800 p-6 flex flex-col gap-6">
            <h2 className="text-iron-400 uppercase tracking-widest text-xs font-bold border-b border-iron-800 pb-4">Active Controls & Constraints</h2>

            <div className="space-y-4">
                <div>
                    <h3 className="text-iron-500 text-xs uppercase mb-2">Active Policies (LOCKED)</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.activePolicies.map((policy, idx) => (
                            <span key={idx} className="px-2 py-1 bg-iron-950 border border-iron-700 text-iron-300 text-xs font-mono">
                                🔒 {policy}
                            </span>
                        ))}
                    </div>
                </div>

                {data.exceptions.length > 0 && (
                    <div>
                        <h3 className="text-iron-500 text-xs uppercase mb-2">Temporary Exceptions</h3>
                        <div className="space-y-2">
                            {data.exceptions.map((exp) => (
                                <div key={exp.id} className="flex justify-between items-center bg-iron-950 border border-amber-900/50 p-2 px-3">
                                    <span className="text-amber-500 text-xs font-mono">{exp.id}: {exp.title}</span>
                                    <span className="text-amber-500 text-xs font-mono font-bold animate-pulse">{exp.expiry}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-iron-500 text-xs uppercase mb-2">Reduced Privileges</h3>
                    <div className="flex flex-col gap-1">
                        {data.reducedPrivileges.map((priv, idx) => (
                            <span key={idx} className="text-red-400 text-xs font-mono line-through opacity-70">
                                {priv}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-iron-500 text-xs uppercase mb-2">Frozen Actions</h3>
                    <div className="flex flex-col gap-1">
                        {data.frozenActions.map((action, idx) => (
                            <span key={idx} className="text-iron-600 text-xs font-mono cursor-not-allowed">
                                ❄️ {action}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

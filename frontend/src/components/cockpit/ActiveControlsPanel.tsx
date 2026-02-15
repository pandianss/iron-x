import React, { useEffect, useState } from 'react';
import { DisciplineClient, type ConstraintsData } from '../../domain/discipline';
import { useDiscipline } from '../../hooks/useDiscipline';

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
        <div className="flex-1 bg-transparent p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-iron-900 pb-4">Logic_Constraints & Enforcement</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-iron-500 mr-3"></span> Active Policies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.activePolicies.map((policy, idx) => (
                            <span key={idx} className="px-3 py-1 bg-black/40 border border-iron-800 text-iron-400 text-[9px] font-mono uppercase tracking-widest flex items-center">
                                <span className="w-1 h-1 bg-iron-600 rounded-full mr-2"></span> {policy}
                            </span>
                        ))}
                    </div>
                </div>

                {data.exceptions.length > 0 && (
                    <div>
                        <h3 className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                            <span className="w-1 h-3 bg-amber-500 mr-3 animate-pulse"></span> Temporary Exceptions
                        </h3>
                        <div className="space-y-2">
                            {data.exceptions.map((exp) => (
                                <div key={exp.id} className="flex justify-between items-center bg-amber-900/10 border border-amber-900/40 p-3">
                                    <span className="text-amber-500 text-[9px] font-mono uppercase tracking-widest leading-none">{exp.id}: {exp.title}</span>
                                    <span className="text-amber-500 text-[9px] font-mono font-bold animate-pulse tabular-nums">{exp.expiry}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-red-500/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-red-900/40 mr-3"></span> Restricted Vectors
                    </h3>
                    <div className="flex flex-col gap-2">
                        {data.reducedPrivileges.map((priv, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-red-900 text-[10px] font-mono uppercase tracking-widest line-through opacity-70">
                                <span className="w-2 h-px bg-red-900"></span>
                                {priv}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-iron-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-iron-800 mr-3"></span> Frozen Operations
                    </h3>
                    <div className="flex flex-col gap-2">
                        {data.frozenActions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-iron-800 text-[10px] font-mono uppercase tracking-widest italic group cursor-not-allowed">
                                <span className="w-1 h-1 bg-iron-900 rotate-45 mr-1 group-hover:bg-cyan-900 transition-colors"></span>
                                {action}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useEffect, useState } from 'react';
import { DisciplineClient, type DisciplineState } from '../../domain/discipline';

export function ActiveControlsPanel() {
    const [state, setState] = useState<DisciplineState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DisciplineClient.getState();
                setState(data);
            } catch (error) {
                console.error('Failed to fetch discipline state for controls', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !state) return <div className="p-4 bg-iron-900 border border-iron-800 h-64 animate-pulse">Loading Controls...</div>;
    if (!state) return null;

    const { activeConstraints } = state;

    return (
        <div className="flex-1 bg-transparent p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
            <h2 className="text-iron-500 uppercase tracking-[0.4em] text-[10px] font-bold border-b border-iron-900 pb-4">Logic_Constraints & Enforcement</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-iron-500 mr-3"></span> Active Logical Safeguards
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-black/40 border border-iron-800 text-iron-400 text-[9px] font-mono uppercase tracking-widest flex items-center">
                            <span className="w-1 h-1 bg-iron-600 rounded-full mr-2"></span> {activeConstraints.policiesActive} System Policies Active
                        </span>
                        {activeConstraints.lockedUntil && (
                            <span className="px-3 py-1 bg-red-900/20 border border-red-900/40 text-red-500 text-[9px] font-mono uppercase tracking-widest flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2 animate-pulse"></span> HARD LOCKOUT IN EFFECT
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-red-500/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-red-900/40 mr-3"></span> Restricted Vectors
                    </h3>
                    <div className="flex flex-col gap-2">
                        {activeConstraints.reducedPrivileges.map((priv, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-red-900 text-[10px] font-mono uppercase tracking-widest line-through opacity-70">
                                <span className="w-2 h-px bg-red-900"></span>
                                {priv}
                            </div>
                        ))}
                        {activeConstraints.reducedPrivileges.length === 0 && (
                            <div className="text-iron-800 text-[9px] font-mono uppercase">All capability vectors operational</div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-iron-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1 h-3 bg-iron-800 mr-3"></span> Frozen Operations
                    </h3>
                    <div className="flex flex-col gap-2">
                        {activeConstraints.frozenActions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-iron-800 text-[10px] font-mono uppercase tracking-widest italic group cursor-not-allowed">
                                <span className="w-1 h-1 bg-iron-900 rotate-45 mr-1 group-hover:bg-cyan-900 transition-colors"></span>
                                {action}
                            </div>
                        ))}
                        {activeConstraints.frozenActions.length === 0 && (
                            <div className="text-iron-800 text-[9px] font-mono uppercase">Priority pipeline clear</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

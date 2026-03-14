import { useEffect, useState } from 'react';
import { ActionClient } from '../domain/actions';

export interface Action {
    action_id: string;
    title: string;
    description?: string | null;
    window_start_time: string;
    window_duration_minutes: number;
    witness_user_id?: string | null;
    witness?: {
        user_id: string;
        email: string;
        trust_tier: string;
    } | null;
    goal?: {
        title: string;
    };
}

interface ActionListProps {
    refreshTrigger: number;
}

import WitnessPanel from './WitnessPanel';

export default function ActionList({ refreshTrigger }: ActionListProps) {
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const data = await ActionClient.getAll();
                setActions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchActions();
    }, [refreshTrigger]);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-iron-100 w-1/4"></div>
            <div className="h-32 bg-iron-50 rounded-lg border border-iron-200"></div>
            <div className="h-32 bg-iron-50 rounded-lg border border-iron-200"></div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-iron-900 uppercase tracking-tighter">Defined Protocols</h2>
            {actions.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-iron-200 rounded-lg text-center">
                    <p className="text-iron-400 font-mono text-xs uppercase tracking-widest">No active protocols detected.</p>
                </div>
            ) : (
                actions.map(action => (
                    <div key={action.action_id} className="bg-white p-6 border border-iron-200 shadow-[4px_4px_0_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.1)] transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-display font-black text-iron-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    {action.title}
                                </h3>
                                {action.description && <p className="text-iron-500 text-xs font-mono leading-relaxed max-w-md">{action.description}</p>}
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="text-[10px] font-mono text-iron-400 uppercase tracking-widest">
                                        Window: <span className="text-iron-900 font-bold">{new Date(action.window_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> ({action.window_duration_minutes}m)
                                    </div>
                                    {action.goal && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-mono font-bold uppercase tracking-widest">
                                            GOAL: {action.goal.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <WitnessPanel 
                            actionId={action.action_id} 
                            currentWitnessId={action.witness_user_id}
                            witnessEmail={action.witness?.email}
                            witnessTier={action.witness?.trust_tier}
                        />
                    </div>
                ))
            )}
        </div>
    );
};


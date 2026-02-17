import React, { useEffect, useState } from 'react';
import { ActionClient, type Action } from '../domain/actions';

interface ActionListProps {
    refreshTrigger: number;
}

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

    if (loading) return <p>Loading actions...</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Defined Actions</h2>
            {actions.length === 0 ? (
                <p className="text-iron-500">No actions defined.</p>
            ) : (
                actions.map(action => (
                    <div key={action.action_id} className="bg-white p-4 rounded-lg shadow border border-iron-200">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{action.title}</h3>
                                {action.description && <p className="text-iron-600 text-sm">{action.description}</p>}
                                <p className="text-sm text-iron-500 mt-1">
                                    Window: {new Date(action.window_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({action.window_duration_minutes} mins)
                                </p>
                            </div>
                            {action.goal && (
                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full h-fit">
                                    {action.goal.title}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};


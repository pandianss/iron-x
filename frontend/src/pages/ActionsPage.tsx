
import { useState } from 'react';
import ActionForm from '../components/ActionForm';
import ActionList from '../components/ActionList';

export default function ActionsPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="min-h-screen bg-iron-950 text-iron-300 font-sans selection:bg-amber-900 selection:text-amber-100 p-4 pt-24 lg:p-8 infrastructure-bg">
            <h1 className="text-3xl font-bold text-iron-900 mb-8">Actions & Routines</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <ActionForm onActionCreated={() => setRefreshTrigger(prev => prev + 1)} />
                </div>
                <div className="md:col-span-2">
                    <ActionList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};


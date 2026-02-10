
import React, { useState } from 'react';
import ActionForm from '../components/ActionForm';
import ActionList from '../components/ActionList';

const ActionsPage: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Actions & Routines</h1>
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

export default ActionsPage;

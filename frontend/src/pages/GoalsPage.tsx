
import React, { useState } from 'react';
import GoalForm from '../components/GoalForm';
import GoalList from '../components/GoalList';

export default function GoalsPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleGoalCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-iron-900 mb-8">Goals</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <GoalForm onGoalCreated={handleGoalCreated} />
                </div>
                <div className="md:col-span-2">
                    <GoalList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};



import React, { useEffect, useState } from 'react';

interface Goal {
    goal_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    status: string;
    created_at: string;
}

interface GoalListProps {
    refreshTrigger: number;
}

const GoalList: React.FC<GoalListProps> = ({ refreshTrigger }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/goals', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch goals');
                }

                const data = await response.json();
                setGoals(data);
            } catch (err) {
                setError('Error loading goals');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [refreshTrigger]);

    if (loading) return <p>Loading goals...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Goals</h2>
            {goals.length === 0 ? (
                <p className="text-gray-500">No active goals found. Create one to get started!</p>
            ) : (
                goals.map((goal) => (
                    <div key={goal.goal_id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                                {goal.description && <p className="text-gray-600 mt-1">{goal.description}</p>}
                                {goal.deadline && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${goal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {goal.status}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default GoalList;

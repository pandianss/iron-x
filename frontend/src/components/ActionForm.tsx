import React, { useState, useEffect } from 'react';
import client from '../api/client';

interface Goal {
    goal_id: string;
    title: string;
}

interface ActionFormProps {
    onActionCreated: () => void;
}

const ActionForm: React.FC<ActionFormProps> = ({ onActionCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goalId, setGoalId] = useState('');
    const [frequencyType] = useState('daily');
    const [windowStart, setWindowStart] = useState('09:00');
    const [windowDuration, setWindowDuration] = useState('30');
    const [isStrict, setIsStrict] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await client.get<Goal[]>('/goals');
                setGoals(response.data);
            } catch (err) {
                console.error('Failed to load goals', err);
            }
        };
        fetchGoals();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (parseInt(windowDuration) < 5) {
            setError('Window duration must be at least 5 minutes.');
            return;
        }

        const frequencyRule = frequencyType === 'daily'
            ? { type: 'daily' }
            : { type: 'custom', rule: 'weekly' }; // Placeholder for now

        try {
            await client.post('/actions', {
                title,
                description,
                goal_id: goalId || null,
                frequency_rule: frequencyRule,
                window_start_time: windowStart,
                window_duration_minutes: parseInt(windowDuration),
                is_strict: isStrict
            });

            setTitle('');
            setDescription('');
            setValidDefaults();
            onActionCreated();
        } catch (err) {
            setError('Error creating action.');
            console.error(err);
        }
    };

    const setValidDefaults = () => {
        setWindowStart('09:00');
        setWindowDuration('30');
        setIsStrict(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Action (Routine)</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Link to Goal (Optional)</label>
                    <select
                        value={goalId}
                        onChange={(e) => setGoalId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">-- None --</option>
                        {goals.map(g => (
                            <option key={g.goal_id} value={g.goal_id}>{g.title}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            value={windowStart}
                            onChange={(e) => setWindowStart(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (mins)</label>
                        <input
                            type="number"
                            min="5"
                            value={windowDuration}
                            onChange={(e) => setWindowDuration(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <input
                        id="strict-mode"
                        type="checkbox"
                        checked={isStrict}
                        onChange={() => { }} // Read-only as per spec
                        disabled
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="strict-mode" className="ml-2 block text-sm text-gray-900">
                        Strict Mode (Enforced)
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Create Action
                </button>
            </form>
        </div>
    );
};

export default ActionForm;

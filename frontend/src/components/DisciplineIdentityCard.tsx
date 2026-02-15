import React, { useEffect, useState } from 'react';
import { TrajectoryClient, type TrajectoryIdentity } from '../domain/trajectory';

const DisciplineIdentityCard: React.FC = () => {
    const [data, setData] = useState<TrajectoryIdentity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdentity = async () => {
            try {
                const identity = await TrajectoryClient.getIdentity();
                setData(identity);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchIdentity();
    }, []);

    if (loading) return <div className="animate-pulse h-32 bg-iron-100 rounded-lg"></div>;
    if (!data) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-iron-200 relative overflow-hidden">
            {data.supervisionMode === 'LOW_SUPERVISION' && (
                <div className="absolute top-0 right-0 bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-l border-b border-green-100 uppercase tracking-widest flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Low Supervision Mode
                </div>
            )}

            <h3 className="text-xs font-semibold text-iron-500 uppercase tracking-wider mb-4">Discipline Status</h3>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-iron-900">{data.classification.replace('_', ' ')}</div>
                    <div className="text-sm text-iron-500 mt-1">
                        {data.daysAtCurrent} days at this level
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-4xl font-mono font-bold text-indigo-600">{data.score}</div>
                    <div className="text-xs text-iron-400 mt-1">Score</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-iron-100 flex justify-between text-xs text-iron-500">
                <span>Next Threshold: <strong>{data.nextThreshold}</strong></span>
                <span>Current: <strong>{data.score}</strong></span>
            </div>
        </div>
    );
};

export default DisciplineIdentityCard;

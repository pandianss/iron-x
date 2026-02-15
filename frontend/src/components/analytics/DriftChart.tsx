
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsClient } from '../../domain/analytics';

interface HistoryPoint {
    date: string;
    score: number;
}

export const DriftChart: React.FC = () => {
    const [data, setData] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await AnalyticsClient.getDisciplineData();
                const formattedHistory = result.history.map((h: any) => ({
                    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    score: h.score
                }));
                setData(formattedHistory);
            } catch (error) {
                console.error('Failed to load drift data', error);
            }
        };
        loadData();
    }, []);

    if (data.length === 0) return <div className="h-full flex items-center justify-center text-iron-500 text-xs">No discipline history available</div>;

    return (
        <div className="h-full w-full p-2">
            <h3 className="text-iron-400 text-xs uppercase mb-2 font-bold tracking-wider">Discipline Drift</h3>
            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                        <YAxis stroke="#666" fontSize={10} domain={[0, 100]} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff' }}
                            itemStyle={{ color: '#fbbf24' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: '#fbbf24' }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

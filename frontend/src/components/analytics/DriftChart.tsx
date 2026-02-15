
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
                const formattedHistory = result.history.map((h: { date: string | number | Date; score: number }) => ({
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
        <div className="h-full w-full p-4 flex flex-col relative z-10">
            <h3 className="text-iron-600 text-[9px] uppercase mb-4 font-bold tracking-[0.3em] flex items-center">
                <span className="w-1.5 h-1.5 bg-amber-500 mr-2"></span> Chrono Drift Analyzer
            </h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#1a1a1a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#3f3f46"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#3f3f46"
                            fontSize={9}
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#09090b',
                                border: '1px solid #27272a',
                                color: '#fff',
                                borderRadius: '0px',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                padding: '8px'
                            }}
                        />
                        <Line
                            type="stepAfter"
                            dataKey="score"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            dot={{ r: 0 }}
                            activeDot={{ r: 4, fill: '#fff' }}
                            className="drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';

interface TrajectoryData {
    history: { date: string; score: number }[];
    events: { date: string; type: string; cause: string }[];
}

const DisciplineTrajectoryGraph: React.FC = () => {
    const [data, setData] = useState<TrajectoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchTrajectory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/experience/trajectory?days=${days}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrajectory();
    }, [days]);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
    if (!data || data.history.length === 0) return <div className="p-4 text-gray-400">No trajectory data.</div>;

    // Simple SVG Graph
    const height = 200;
    const width = 600;
    const padding = 20;

    const maxScore = 100;
    const minScore = 0;

    const getX = (index: number) => {
        return padding + (index / (data.history.length - 1)) * (width - 2 * padding);
    };

    const getY = (score: number) => {
        return height - padding - (score / 100) * (height - 2 * padding);
    };

    const points = data.history.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Discipline Trajectory</h3>
                <div className="flex space-x-2 text-xs">
                    {[30, 60, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-2 py-1 rounded ${days === d ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative overflow-hidden" style={{ height: `${height}px` }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                    {/* Grid lines */}
                    <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#f3f4f6" />
                    <line x1={padding} y1={getY(50)} x2={width - padding} y2={getY(50)} stroke="#f3f4f6" />
                    <line x1={padding} y1={getY(100)} x2={width - padding} y2={getY(100)} stroke="#f3f4f6" />

                    {/* Path */}
                    <polyline
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        points={points}
                    />

                    {/* Points & Tooltips */}
                    {data.history.map((d, i) => (
                        <circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.score)}
                            r="3"
                            fill="#4f46e5"
                            className="hover:r-5 transition-all cursor-pointer"
                        >
                            <title>{`${new Date(d.date).toLocaleDateString()}: ${d.score}`}</title>
                        </circle>
                    ))}

                    {/* Miss Events */}
                    {data.events.map((e, i) => {
                        // Find closest history point for X
                        const eventDate = new Date(e.date).toDateString();
                        const index = data.history.findIndex(h => new Date(h.date).toDateString() === eventDate);
                        if (index === -1) return null;

                        return (
                            <circle
                                key={`event-${i}`}
                                cx={getX(index)}
                                cy={getY(data.history[index].score)}
                                r="4"
                                fill="#ef4444"
                                stroke="white"
                                strokeWidth="1"
                            >
                                <title>{e.cause}</title>
                            </circle>
                        );
                    })}
                </svg>
            </div>
            <div className="text-xs text-center text-gray-400 mt-2">
                Use hover to see details. Red dots indicate misses.
            </div>
        </div>
    );
};

export default DisciplineTrajectoryGraph;

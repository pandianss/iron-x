import React, { useState } from 'react';
import { useTrajectoryHistory, useTrajectoryProjection } from '../hooks/useTrajectory';

const DisciplineTrajectoryGraph: React.FC = () => {
    const [days, setDays] = useState(30);
    const { data, loading: historyLoading, error: historyError } = useTrajectoryHistory(days);
    const { data: projection, loading: projectionLoading } = useTrajectoryProjection();

    const loading = historyLoading || projectionLoading;

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
    if (historyError) return <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100">Error: {historyError}</div>;
    if (!data || data.history.length === 0) return <div className="p-4 text-gray-400">No trajectory data.</div>;

    // Simple SVG Graph
    const height = 200;
    const width = 600;
    const padding = 20;

    // Calculate X scale considering we might want space for prediction?
    // For now, let's overlay prediction at the end or extend X?
    // Let's prediction be 7 days out.
    const historyPoints = data.history.length;
    const totalPoints = historyPoints + 1; // +1 for 7-day predicted point

    const getX = (index: number) => {
        return padding + (index / (totalPoints - 1)) * (width - 2 * padding);
    };

    const getY = (score: number) => {
        return height - padding - (score / 100) * (height - 2 * padding);
    };

    const historyPath = data.history.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');

    let projectionPath = '';
    if (projection && data.history.length > 0) {
        const lastPoint = data.history[data.history.length - 1];
        const lastX = getX(data.history.length - 1);
        const lastY = getY(lastPoint.score);

        const predX = getX(totalPoints - 1);
        const predY = getY(projection.projectedScore);

        projectionPath = `${lastX},${lastY} ${predX},${predY}`;
    }

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
                        points={historyPath}
                    />

                    {/* Projection */}
                    {projectionPath && (
                        <polyline
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            points={projectionPath}
                        />
                    )}

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

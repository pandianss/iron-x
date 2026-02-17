import { useState } from 'react';
import { useTrajectoryHistory, useTrajectoryProjection } from '../hooks/useTrajectory';
import { useDiscipline } from '../hooks/useDiscipline';

export default function DisciplineTrajectoryGraph() {
    const { refreshTrigger } = useDiscipline();
    const [days, setDays] = useState(30);
    const { data, loading: historyLoading, error: historyError } = useTrajectoryHistory(days, refreshTrigger);
    const { data: projection, loading: projectionLoading } = useTrajectoryProjection();

    const loading = historyLoading || projectionLoading;

    if (loading) return <div className="animate-pulse h-64 bg-iron-900/20 border border-iron-900"></div>;
    if (historyError) return <div className="p-6 text-red-500 bg-red-900/10 border border-red-900 uppercase text-[10px] font-bold tracking-widest">[ Failure ] Error: {historyError}</div>;
    if (!data || data.history.length === 0) return <div className="p-6 text-iron-700 bg-iron-950/20 border border-iron-900 uppercase text-[10px] font-bold tracking-widest">No trajectory data available.</div>;

    // SVG Configuration
    const height = 240;
    const width = 800;
    const padding = 30;

    const historyPoints = data.history.length;
    const totalPoints = historyPoints + 1;

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
        <div className="bg-iron-950/40 p-6 border border-iron-900 hardened-border mt-8 glass-panel">
            <div className="flex justify-between items-center mb-8 border-b border-iron-900 pb-4">
                <h3 className="text-xs font-bold text-iron-500 uppercase tracking-[0.3em]">Operational Trajectory</h3>
                <div className="flex gap-2">
                    {[30, 60, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all ${days === d ? 'bg-white text-black border-white' : 'text-iron-600 border-iron-800 hover:text-white hover:border-iron-600'}`}
                        >
                            {d} Cycle
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative overflow-hidden bg-black/40 border border-iron-900" style={{ height: `${height}px` }}>
                {/* Background Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full relative z-10">
                    {/* Horizontal Reference Lines */}
                    {[0, 50, 100].map(val => (
                        <line key={val} x1={padding} y1={getY(val)} x2={width - padding} y2={getY(val)} stroke="#27272a" strokeWidth="1" />
                    ))}

                    {/* Path */}
                    <polyline
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        points={historyPath}
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    />

                    {/* Projection */}
                    {projectionPath && (
                        <polyline
                            fill="none"
                            stroke="#52525b"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            points={projectionPath}
                        />
                    )}

                    {/* Points */}
                    {data.history.map((d, i) => (
                        <circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.score)}
                            r="2"
                            fill="#ffffff"
                            className="hover:r-4 transition-all cursor-crosshair group"
                        >
                            <title>{`${new Date(d.date).toLocaleDateString()}: ${d.score}`}</title>
                        </circle>
                    ))}

                    {/* Miss Events - Signal Red */}
                    {data.events.map((e, i) => {
                        const eventDate = new Date(e.date).toDateString();
                        const index = data.history.findIndex(h => new Date(h.date).toDateString() === eventDate);
                        if (index === -1) return null;

                        return (
                            <g key={`event-${i}`}>
                                <circle
                                    cx={getX(index)}
                                    cy={getY(data.history[index].score)}
                                    r="4"
                                    className="fill-red-500 animate-pulse opacity-50"
                                />
                                <circle
                                    cx={getX(index)}
                                    cy={getY(data.history[index].score)}
                                    r="2"
                                    fill="#ff3300"
                                    stroke="#000000"
                                    strokeWidth="1"
                                >
                                    <title>{`VIOLATION: ${e.cause}`}</title>
                                </circle>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between items-center text-[9px] text-iron-700 uppercase font-mono tracking-widest mt-4">
                <span>[ Axis_Y: Score_Comp ]</span>
                <span className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full" /> Violation Event
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-0.5 bg-gray-600 dashed" /> Projection
                    </span>
                    <span>[ Axis_X: Chrono ]</span>
                </span>
            </div>
        </div>
    );
}


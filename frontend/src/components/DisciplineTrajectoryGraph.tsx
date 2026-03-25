import { useEffect, useState } from 'react';
import { DisciplineClient, TrajectoryData } from '../domain/discipline';

export default function DisciplineTrajectoryGraph() {
    const [data, setData] = useState<TrajectoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await DisciplineClient.getTrajectory();
                setData(result);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch trajectory history:', err);
                setError(err.response?.data?.error || 'Failed to load trajectory data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [days]);

    if (loading && !data) return <div className="animate-pulse h-64 bg-iron-900/20 border border-iron-900"></div>;
    if (error) return <div className="p-6 text-red-500 bg-red-900/10 border border-red-900 uppercase text-[10px] font-bold tracking-widest">[ Failure ] Error: {error}</div>;
    if (!data || data.trajectory.length === 0) return <div className="p-6 text-iron-700 bg-iron-950/20 border border-iron-900 uppercase text-[10px] font-bold tracking-widest">No trajectory data available.</div>;

    // SVG Configuration
    const height = 240;
    const width = 800;
    const padding = 30;

    const historyPoints = data.trajectory.length;
    const totalPoints = historyPoints;

    const getX = (index: number) => {
        return padding + (index / (totalPoints - 1)) * (width - 2 * padding);
    };

    const getY = (score: number) => {
        return height - padding - (score / 100) * (height - 2 * padding);
    };

    const historyPath = data.trajectory.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');

    let projectionPath = '';
    // Projection logic removed as backend doesn't provide it yet in getTrajectory

    return (
        <div className="bg-iron-950/40 p-4 lg:p-6 border border-iron-900 hardened-border mt-8 glass-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-iron-900 pb-4">
                <h3 className="text-xs font-bold text-iron-500 uppercase tracking-[0.3em]">Operational Trajectory</h3>
                <div className="flex flex-wrap gap-2">
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
                    {data.trajectory.map((d, i) => (
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


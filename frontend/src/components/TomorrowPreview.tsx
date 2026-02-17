import { useState, useEffect } from 'react';
import { TrajectoryClient, type TomorrowPreviewData, type Warning } from '../domain/trajectory';
import { Calendar, AlertTriangle, CheckCircle, Info, Siren } from 'lucide-react';
import { useDiscipline } from '../hooks/useDiscipline';

export default function TomorrowPreview() {
    const { refreshTrigger } = useDiscipline();
    const [data, setData] = useState<TomorrowPreviewData | null>(null);
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [previewData, warningsData] = await Promise.all([
                    TrajectoryClient.getTomorrowPreview(),
                    TrajectoryClient.getAnticipatoryWarnings()
                ]);
                setData(previewData);
                setWarnings(warningsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    if (loading) return <div className="animate-pulse h-24 bg-iron-900/20 border border-iron-900"></div>;
    if (!data) return null;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High Risk': return 'text-red-500 border-red-900/50 bg-red-900/10';
            case 'Medium Risk': return 'text-amber-500 border-amber-900/50 bg-amber-900/10';
            default: return 'text-iron-400 border-iron-800 bg-iron-900/20';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'High Risk': return <AlertTriangle className="w-3.5 h-3.5 mr-2" />;
            case 'Medium Risk': return <Info className="w-3.5 h-3.5 mr-2" />;
            default: return <CheckCircle className="w-3.5 h-3.5 mr-2 opacity-50" />;
        }
    };

    return (
        <div className="bg-iron-950/40 p-5 border border-iron-900 hardened-border glass-panel">
            <h3 className="text-[10px] font-bold text-iron-600 uppercase tracking-[0.3em] mb-6 flex items-center">
                <Calendar className="w-3 h-3 mr-2 opacity-40" /> Forward Projection
            </h3>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xl font-bold text-white uppercase tracking-tight font-display">{data.scheduledCount} Nodes Queued</div>
                    <div className="text-[9px] text-iron-700 uppercase tracking-widest mt-1 tabular-nums">Epoch: {new Date(data.date).toLocaleDateString()}</div>
                </div>

                <div className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-widest flex items-center ${getRiskColor(data.riskLevel)}`}>
                    {getRiskIcon(data.riskLevel)}
                    {data.riskLevel}
                </div>
            </div>

            <div className="text-[10px] text-iron-600 uppercase leading-relaxed italic border-l border-iron-800 pl-4 py-1">
                {data.warning || (data.riskLevel === 'High Risk' ? 'Expect structural resistance.' :
                    data.riskLevel === 'Medium Risk' ? 'Moderate variance projected.' :
                        'Optimal operational path.')}
            </div>

            {warnings.length > 0 && (
                <div className="mt-6 pt-4 border-t border-iron-900 space-y-2">
                    {warnings.map((w: Warning, i: number) => (
                        <div key={i} className={`text-[9px] font-bold uppercase tracking-widest p-2 flex items-start border ${w.severity === 'HIGH' ? 'border-red-900/30 text-red-500' : 'border-amber-900/30 text-amber-500'
                            }`}>
                            <Siren className="w-3.5 h-3.5 mr-3 flex-shrink-0 opacity-40" />
                            <span>{w.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


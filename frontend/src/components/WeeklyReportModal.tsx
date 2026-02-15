import React, { useEffect, useState } from 'react';
import { AnalyticsClient } from '../domain/analytics';
import { X, Activity, AlertCircle } from 'lucide-react';

interface WeeklyReportData {
    period: { start: string; end: string };
    total: number;
    executed: number;
    missed: number;
    scoreDelta: number;
    insight: string;
}

interface WeeklyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ isOpen, onClose }) => {
    const [data, setData] = useState<WeeklyReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchReport = async () => {
                setLoading(true);
                try {
                    const data = await AnalyticsClient.getReport();
                    if (data) {
                        setData(data);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchReport();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-iron-950 border border-iron-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] w-full max-w-xl overflow-hidden glass-panel hardened-border infrastructure-bg">

                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-iron-900">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-white uppercase tracking-tight">Weekly <span className="text-iron-500">Reflection</span></h2>
                        <span className="text-[10px] text-iron-700 uppercase tracking-[0.4em] mt-2 block">System Log: Governance_Period_Delta</span>
                    </div>
                    <button onClick={onClose} className="text-iron-600 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-10">
                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="h-4 bg-iron-900 w-3/4"></div>
                            <div className="h-32 bg-iron-900"></div>
                        </div>
                    ) : !data ? (
                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">[ Failure ] Synchronization Error.</div>
                    ) : (
                        <div className="space-y-10">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-black/40 p-6 border border-iron-900 text-center relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-iron-500 opacity-20"></div>
                                    <span className="block text-4xl font-display font-bold text-white tabular-nums">{Math.round((data.executed / data.total) * 100) || 0}%</span>
                                    <span className="text-[9px] text-iron-600 uppercase tracking-[0.2em] mt-2 block">Execution Rate</span>
                                </div>
                                <div className="bg-black/40 p-6 border border-iron-900 text-center relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-iron-500 opacity-20"></div>
                                    <span className="block text-4xl font-display font-bold text-white tabular-nums">{data.total}</span>
                                    <span className="text-[9px] text-iron-600 uppercase tracking-[0.2em] mt-2 block">Scheduled Nodes</span>
                                </div>
                            </div>

                            {/* Score Delta */}
                            <div className="flex items-center justify-between p-6 bg-iron-900/20 border border-iron-800 relative group overflow-hidden">
                                <Activity className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 text-white opacity-[0.03] pointer-events-none" />
                                <div className="flex items-center relative z-10">
                                    <div className="w-10 h-10 border border-iron-700 flex items-center justify-center mr-6">
                                        <Activity className="w-5 h-5 text-iron-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-iron-500 uppercase tracking-[0.2em]">DS_Index Impact</div>
                                        <div className="text-[9px] text-iron-700 uppercase mt-1">7-Cycle Variance Projection</div>
                                    </div>
                                </div>
                                <span className={`text-4xl font-display font-bold relative z-10 tabular-nums ${data.scoreDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.scoreDelta >= 0 ? '+' : ''}{data.scoreDelta}
                                </span>
                            </div>

                            {/* Insight */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] flex items-center">
                                    <AlertCircle className="w-3.5 h-3.5 mr-3 text-iron-500" /> Cognitive Insight
                                </h3>
                                <p className="text-[11px] text-iron-400 bg-black/60 border border-iron-900 p-5 italic leading-relaxed font-mono">
                                    // observation: "{data.insight}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-iron-900/10 border-t border-iron-900 text-center text-[9px] text-iron-700 uppercase tracking-[0.4em] font-mono">
                    Governance Record // Non-Actionable Archive
                </div>
            </div>
        </div>
    );
};

export default WeeklyReportModal;

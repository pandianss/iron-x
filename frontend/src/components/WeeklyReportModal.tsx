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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-iron-100">
                    <div>
                        <h2 className="text-xl font-bold text-iron-900">Weekly Reflection</h2>
                        <span className="text-xs text-iron-400 uppercase tracking-wider">Non-Judgmental Report</span>
                    </div>
                    <button onClick={onClose} className="text-iron-400 hover:text-iron-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-iron-100 rounded w-3/4"></div>
                            <div className="h-20 bg-iron-100 rounded"></div>
                        </div>
                    ) : !data ? (
                        <div className="text-red-500 text-sm">Failed to load report.</div>
                    ) : (
                        <div className="space-y-6">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-iron-50 p-4 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-iron-900">{Math.round((data.executed / data.total) * 100) || 0}%</span>
                                    <span className="text-xs text-iron-500 uppercase">Execution Rate</span>
                                </div>
                                <div className="bg-iron-50 p-4 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-iron-900">{data.total}</span>
                                    <span className="text-xs text-iron-500 uppercase">Total Actions</span>
                                </div>
                            </div>

                            {/* Score Delta */}
                            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="flex items-center">
                                    <Activity className="w-5 h-5 text-indigo-600 mr-3" />
                                    <div>
                                        <div className="font-semibold text-indigo-900">Score Impact</div>
                                        <div className="text-xs text-indigo-700">Change over last 7 days</div>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-indigo-700">
                                    {data.scoreDelta > 0 ? '+' : ''}{data.scoreDelta}
                                </span>
                            </div>

                            {/* Insight */}
                            <div>
                                <h3 className="text-sm font-semibold text-iron-700 mb-2 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2 text-iron-400" /> Pattern Insight
                                </h3>
                                <p className="text-sm text-iron-600 bg-white border border-iron-200 p-3 rounded italic">
                                    "{data.insight}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-iron-50 text-center text-xs text-iron-400">
                    This report is for your reflection. No action required.
                </div>
            </div>
        </div>
    );
};

export default WeeklyReportModal;

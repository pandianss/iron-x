// frontend/src/components/DisciplineIdentityCard.tsx

import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, Clock, Lock } from 'lucide-react';
import { DisciplineClient, DisciplineIdentity } from '../domain/discipline';

const DisciplineIdentityCard: React.FC = () => {
    const [data, setData] = useState<DisciplineIdentity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const identity = await DisciplineClient.getIdentity();
                setData(identity);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch discipline identity:', err);
                setError(err.response?.data?.error || 'Failed to load discipline data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-iron-200 animate-pulse">
                <div className="h-8 bg-iron-200 rounded w-1/3 mb-4"></div>
                <div className="h-24 bg-iron-200 rounded mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-iron-200 rounded"></div>
                    <div className="h-16 bg-iron-200 rounded"></div>
                    <div className="h-16 bg-iron-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <p className="text-red-600 text-sm font-medium">Error loading discipline identity</p>
                <p className="text-red-500 text-xs mt-1">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    const getClassificationColor = (classification: string) => {
        switch (classification) {
            case 'STRICT': return 'text-green-600 bg-green-50 border-green-200';
            case 'STABLE': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'DRIFTING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'BREACH': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-iron-600 bg-iron-50 border-iron-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-iron-200 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Shield className="w-full h-full text-iron-900" />
            </div>

            {/* Header */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xs font-semibold text-iron-500 uppercase tracking-wider mb-1">
                            Discipline Identity
                        </h3>
                        <p className="text-xs text-iron-400">Real-time enforcement status</p>
                    </div>
                    {data.lockedUntil && new Date(data.lockedUntil) > new Date() && (
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                            <Lock className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-600">LOCKED</span>
                        </div>
                    )}
                </div>

                {/* Score Display */}
                <div className="flex items-end gap-4 mb-6">
                    <div>
                        <div className={`text-5xl font-bold ${getScoreColor(data.score)}`}>
                            {data.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-iron-400 mt-1">Discipline Score</div>
                    </div>
                    <div className={`px-3 py-1 rounded-md border ${getClassificationColor(data.classification)} text-sm font-bold mb-2`}>
                        {data.classification}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-iron-50 p-3 rounded border border-iron-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-iron-400" />
                            <span className="text-xs text-iron-500 font-medium">Completion</span>
                        </div>
                        <div className="text-2xl font-bold text-iron-900">
                            {data.weeklyCompletionRate}%
                        </div>
                        <div className="text-xs text-iron-400">This week</div>
                    </div>

                    <div className="bg-iron-50 p-3 rounded border border-iron-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-iron-400" />
                            <span className="text-xs text-iron-500 font-medium">Latency</span>
                        </div>
                        <div className="text-2xl font-bold text-iron-900">
                            {data.averageLatency}m
                        </div>
                        <div className="text-xs text-iron-400">Average</div>
                    </div>

                    <div className="bg-iron-50 p-3 rounded border border-iron-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-iron-400" />
                            <span className="text-xs text-iron-500 font-medium">Policies</span>
                        </div>
                        <div className="text-2xl font-bold text-iron-900">
                            {data.activePolicies}
                        </div>
                        <div className="text-xs text-iron-400">Active</div>
                    </div>
                </div>

                {/* Locked Status */}
                {data.lockedUntil && new Date(data.lockedUntil) > new Date() && (
                    <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-600 font-medium">
                            Account locked until {new Date(data.lockedUntil).toLocaleString()}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                            Governance restoration required
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisciplineIdentityCard;

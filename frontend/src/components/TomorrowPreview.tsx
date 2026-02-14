import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface PreviewData {
    scheduledCount: number;
    riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    date: string;
}

const TomorrowPreview: React.FC = () => {
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await client.get('/experience/preview');
                if (response.status === 200) {
                    setData(response.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, []);

    if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>;
    if (!data) return null;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High Risk': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium Risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'High Risk': return <AlertTriangle className="w-4 h-4 mr-1" />;
            case 'Medium Risk': return <Info className="w-4 h-4 mr-1" />;
            default: return <CheckCircle className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-6 md:mt-0 md:ml-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Tomorrow's Preview
            </h3>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xl font-bold text-gray-900">{data.scheduledCount} Actions</div>
                    <div className="text-xs text-gray-500">Scheduled for {new Date(data.date).toLocaleDateString()}</div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getRiskColor(data.riskLevel)}`}>
                    {getRiskIcon(data.riskLevel)}
                    {data.riskLevel}
                </div>
            </div>

            <div className="mt-2 text-xs text-gray-400">
                {data.riskLevel === 'High Risk' ? 'Prepare for a tight schedule.' :
                    data.riskLevel === 'Medium Risk' ? 'Moderate load expected.' :
                        'Light schedule. Focus on quality.'}
            </div>
        </div>
    );
};

export default TomorrowPreview;

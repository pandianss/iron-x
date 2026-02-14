import { getTomorrowPreview, getAnticipatoryWarnings, TomorrowPreviewData, Warning } from '../api/trajectory';
import { Calendar, AlertTriangle, CheckCircle, Info, Siren } from 'lucide-react';

const TomorrowPreview: React.FC = () => {
    const [data, setData] = useState<TomorrowPreviewData | null>(null);
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [previewData, warningsData] = await Promise.all([
                    getTomorrowPreview(),
                    getAnticipatoryWarnings()
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
                {data.warning || (data.riskLevel === 'High Risk' ? 'Prepare for a tight schedule.' :
                    data.riskLevel === 'Medium Risk' ? 'Moderate load expected.' :
                        'Light schedule. Focus on quality.')}
            </div>

            {warnings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {warnings.map((w, i) => (
                        <div key={i} className={`text-xs p-2 rounded flex items-start ${w.severity === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                            <Siren className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{w.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TomorrowPreview;

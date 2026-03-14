import React, { useState } from 'react';
import { 
    Shield, 
    FileText, 
    Download, 
    Clock, 
    Database, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Lock,
    ArrowRight
} from 'lucide-react';
import { ComplianceClient } from '../domain/compliance';
import { useAuth } from '../hooks/useAuth';

const CompliancePage: React.FC = () => {
    const { user } = useAuth();
    // In this app, the user object from useAuth likely contains the role/tier
    // Let's check for TEAM_ENTERPRISE tier. 
    const isInstitutional = user?.role?.name === 'COACH' || (user as any)?.plan_tier === 'TEAM_ENTERPRISE';

    const [period, setPeriod] = useState<'LAST_30' | 'LAST_90' | 'LAST_180' | 'CUSTOM'>('LAST_90');
    const [format, setFormat] = useState<'PDF' | 'JSON' | 'BOTH'>('PDF');
    const [scope, setScope] = useState<'USER' | 'ORG'>('USER');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ComplianceClient.generateEvidencePack({
                period,
                format,
                scope
            });
            setResult(data);
            
            // Auto-trigger downloads if successful
            if (data.pdfBase64) downloadPdf(data.pdfBase64, data.packId);
            if (data.jsonData) downloadJson(data.jsonData, data.packId);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate compliance record.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = (base64: string, packId: string) => {
        const linkSource = `data:application/pdf;base64,${base64}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = `${packId}.pdf`;
        downloadLink.click();
    };

    const downloadJson = (data: any, packId: string) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadLink = document.createElement("a");
        downloadLink.href = dataStr;
        downloadLink.download = `${packId}.json`;
        downloadLink.click();
    };

    if (!isInstitutional) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
                <div className="max-w-md w-full border border-iron-800 bg-[#0A0A0A] p-10 text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                    <Lock size={48} className="mx-auto text-red-600 mb-4" />
                    <div className="space-y-4">
                        <h1 className="text-xl font-display font-black tracking-tighter uppercase italic text-white flex items-center justify-center gap-2">
                            COMPLIANCE_ENGINE // LOCKED
                        </h1>
                        <p className="text-xs text-iron-500 leading-relaxed uppercase">
                            Evidence pack generation is a TEAM_ENTERPRISE feature. 
                            Used by healthcare providers, trading desks, and HR teams for regulatory oversight.
                        </p>
                    </div>
                    <button className="w-full bg-white text-black p-4 font-black uppercase tracking-tighter italic flex items-center justify-center gap-2 hover:bg-iron-200 transition-colors">
                        Upgrade_to_Institutional <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-iron-300 font-mono p-4 md:p-8 space-y-8">
            <header className="border-b border-iron-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
                        <Shield size={14} /> Compliance_Service_v1.0
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        Evidence_Pack_Generator
                    </h1>
                </div>
                <div className="text-[10px] text-iron-600 uppercase tracking-widest bg-iron-900 border border-iron-800 px-3 py-1">
                    Node_Status: SECURE // INSTITUTIONAL Tier
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="text-xs text-iron-500 leading-relaxed uppercase italic">
                            // GENERATE A TAMPER-EVIDENT AUDIT RECORD OF ALL BEHAVIORAL DATA, 
                            // POLICY EVENTS, AND DISCIPLINE SCORES FOR A SELECTED PERIOD.
                        </div>

                        <div className="space-y-6">
                            {/* Period Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-iron-500 uppercase tracking-widest font-bold">Reporting_Period:</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {(['LAST_30', 'LAST_90', 'LAST_180', 'CUSTOM'] as const).map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            className={`p-3 text-[10px] font-bold border transition-all ${period === p ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-black border-iron-800 text-iron-600 hover:border-iron-600'}`}
                                        >
                                            {p.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-iron-500 uppercase tracking-widest font-bold">Output_Format:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['PDF', 'JSON', 'BOTH'] as const).map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => setFormat(f)}
                                            className={`p-3 text-[10px] font-bold border transition-all ${format === f ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-black border-iron-800 text-iron-600 hover:border-iron-600'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scope Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-iron-500 uppercase tracking-widest font-bold">Data_Scope:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setScope('USER')}
                                        className={`p-3 text-[10px] font-bold border transition-all ${scope === 'USER' ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-black border-iron-800 text-iron-600 hover:border-iron-600'}`}
                                    >
                                        MY_DATA_ONLY
                                    </button>
                                    <button 
                                        onClick={() => setScope('ORG')}
                                        className={`p-3 text-[10px] font-bold border transition-all ${scope === 'ORG' ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-black border-iron-800 text-iron-600 hover:border-iron-600'}`}
                                    >
                                        FULL_ORGANIZATION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-5 font-black uppercase tracking-tighter italic flex items-center justify-center gap-3 transition-all relative group"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Compiling_Evidence_Pack...
                            </>
                        ) : (
                            <>
                                <Database size={18} />
                                Generate_Signed_Evidence_Pack
                            </>
                        )}
                        <div className="absolute inset-0 border border-white/20 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all"></div>
                    </button>

                    {error && (
                        <div className="p-4 border border-red-900 bg-red-950/20 text-red-500 text-[10px] font-bold uppercase flex items-center gap-3">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-iron-800 p-6 space-y-6 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest border-b border-iron-800 pb-4">
                            <Clock size={14} /> Recent_Generations
                        </div>
                        
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase">
                                        <CheckCircle2 size={12} /> Pack_Generated_Success
                                    </div>
                                    <div className="bg-black border border-iron-800 p-4 space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-[9px] text-iron-600 uppercase tracking-widest">Pack_ID:</div>
                                            <div className="text-[10px] text-iron-300 font-mono break-all">{result.packId}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] text-iron-600 uppercase tracking-widest">HMAC_Signature:</div>
                                            <div className="text-[10px] text-blue-500 font-mono break-all line-clamp-1">{result.signature}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {result.pdfBase64 && (
                                        <button 
                                            onClick={() => downloadPdf(result.pdfBase64, result.packId)}
                                            className="bg-iron-900 border border-iron-800 p-3 hover:bg-iron-800 text-white text-[10px] font-black uppercase tracking-tighter italic flex items-center justify-center gap-2"
                                        >
                                            <Download size={12} /> Download_PDF
                                        </button>
                                    )}
                                    {result.jsonData && (
                                        <button 
                                            onClick={() => downloadJson(result.jsonData, result.packId)}
                                            className="bg-iron-900 border border-iron-800 p-3 hover:bg-iron-800 text-white text-[10px] font-black uppercase tracking-tighter italic flex items-center justify-center gap-2"
                                        >
                                            <FileText size={12} /> Download_JSON
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <FileText size={48} className="mx-auto text-iron-800" />
                                <div className="text-[10px] text-iron-600 uppercase tracking-widest">No Packs Generated in Session</div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 text-blue-500 text-[9px] leading-relaxed uppercase italic">
                        // ALL EVIDENCE PACKS ARE SIGNED WITH SHA-256 HMAC.
                        // ANY ALTERATION TO THE DOWNLOADED JSON DATA WILL RESULT IN
                        // A SIGNATURE MISMATCH DURING VERIFICATION PROTOCOLS.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompliancePage;

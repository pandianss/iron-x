import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { OrganizationClient } from '../domain/organization';
import { IntegrationClient } from '../domain/integration';
import { AnalyticsClient } from '../domain/analytics';

const OrganizationDashboardPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [org, setOrg] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Webhook Form State
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState('*');

    // API Key Form State
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        if (slug) fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            const organization = await OrganizationClient.getBySlug(slug!);
            setOrg(organization);

            const [orgStats, orgWebhooks, orgKeys, logsResponse] = await Promise.all([
                OrganizationClient.getStats(organization.org_id),
                IntegrationClient.getWebhooks(organization.org_id),
                IntegrationClient.getApiKeys(organization.org_id),
                AnalyticsClient.getAuditLogs({ limit: 10 })
            ]);

            setStats(orgStats);
            setWebhooks(orgWebhooks || []);
            setApiKeys(orgKeys || []);
            setAuditLogs(logsResponse.logs || []);
        } catch (err: any) {
            setError('System Access Denied or Organization Not Found');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await IntegrationClient.createWebhook(org.org_id, newWebhookUrl, newWebhookEvents);
            setNewWebhookUrl('');
            const updated = await IntegrationClient.getWebhooks(org.org_id);
            setWebhooks(updated);
        } catch (err: any) {
            setError('Failed to register webhook');
        }
    };

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await IntegrationClient.generateApiKey(org.org_id, newKeyName);
            setGeneratedKey(result.plainKey);
            setNewKeyName('');
            const updated = await IntegrationClient.getApiKeys(org.org_id);
            setApiKeys(updated);
        } catch (err: any) {
            setError('Failed to generate API key');
        }
    };

    if (loading) return <div className="p-8 text-white">Authenticating Organizational Context...</div>;
    if (!org) return <div className="p-8 text-red-500">Error: 404 - Organization Not Found</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 border-b border-iron-800 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-bold uppercase tracking-tighter">{org.name}</h1>
                        <p className="text-iron-500 font-mono text-sm">ORG_ID: {org.org_id} | NODE: INTERNAL_RELIABILITY</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-red-950 text-red-500 border border-red-900 px-3 py-1 text-xs font-bold uppercase">Enterprise Tier</span>
                    </div>
                </header>

                {error && <div className="bg-red-900/20 border border-red-900/50 p-4 rounded mb-8 text-red-400">{error}</div>}

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-iron-900 border border-iron-800 p-6 rounded-xl">
                        <h3 className="text-iron-500 text-xs font-bold uppercase tracking-widest mb-2">Global Discipline Score</h3>
                        <p className="text-4xl font-bold">{stats?.averageScore || 0}</p>
                        <div className="mt-4 h-1 bg-iron-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-600 transition-all duration-1000"
                                style={{ width: `${stats?.averageScore || 0}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-iron-900 border border-iron-800 p-6 rounded-xl">
                        <h3 className="text-iron-500 text-xs font-bold uppercase tracking-widest mb-2">Active Units (Teams)</h3>
                        <p className="text-4xl font-bold">{org.teams?.length || 0}</p>
                    </div>
                    <div className="bg-iron-900 border border-iron-800 p-6 rounded-xl">
                        <h3 className="text-iron-500 text-xs font-bold uppercase tracking-widest mb-2">Total Managed Personnel</h3>
                        <p className="text-4xl font-bold">{org.users?.length || 0}</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Webhooks Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">Outbound Webhooks</h2>
                        <div className="bg-iron-900 border border-iron-800 rounded-xl p-6 mb-6">
                            <form onSubmit={handleCreateWebhook} className="space-y-4">
                                <div>
                                    <label className="block text-iron-400 text-xs uppercase mb-1">Target Endpoint URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-black border border-iron-800 text-white px-4 py-2 rounded focus:border-red-600 outline-none mb-4"
                                        placeholder="https://api.yourdomain.com/webhooks"
                                        value={newWebhookUrl}
                                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                                        required
                                    />
                                    <label className="block text-iron-400 text-xs uppercase mb-1">Subscription Events</label>
                                    <select
                                        className="w-full bg-black border border-iron-800 text-white px-4 py-2 rounded focus:border-red-600 outline-none"
                                        value={newWebhookEvents}
                                        onChange={(e) => setNewWebhookEvents(e.target.value)}
                                    >
                                        <option value="*">ALL_EVENTS (*)</option>
                                        <option value="violation.detected">VIOLATION_DETECTED</option>
                                        <option value="score.updated">SCORE_UPDATED</option>
                                    </select>
                                </div>
                                <button className="w-full bg-white text-black font-bold py-2 rounded uppercase tracking-widest text-xs hover:bg-iron-200">
                                    Register Listener
                                </button>
                            </form>
                        </div>
                        <div className="space-y-2">
                            {webhooks.map((w: any) => (
                                <div key={w.webhook_id} className="bg-iron-900/50 border border-iron-900 p-4 rounded-lg flex justify-between items-center">
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-mono truncate text-iron-300">{w.url}</p>
                                        <p className="text-[10px] text-iron-600 uppercase">Events: {w.events}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${w.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* API Keys Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">Strategic Access Keys</h2>
                        <div className="bg-iron-900 border border-iron-800 rounded-xl p-6 mb-6">
                            {generatedKey ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <p className="text-red-500 text-xs font-bold uppercase mb-2">Warning: Secure this key now. It will not be shown again.</p>
                                    <div className="bg-black border border-red-900 p-4 rounded-lg font-mono text-sm break-all text-white mb-4">
                                        {generatedKey}
                                    </div>
                                    <button
                                        onClick={() => setGeneratedKey(null)}
                                        className="w-full bg-iron-800 text-white font-bold py-2 rounded uppercase tracking-widest text-xs"
                                    >
                                        Acknowledged
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleGenerateKey} className="space-y-4">
                                    <div>
                                        <label className="block text-iron-400 text-xs uppercase mb-1">Key Description / Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black border border-iron-800 text-white px-4 py-2 rounded focus:border-red-600 outline-none"
                                            placeholder="System Integration Alpha"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-red-600 text-white font-bold py-2 rounded uppercase tracking-widest text-xs hover:bg-red-700">
                                        Generate New Token
                                    </button>
                                </form>
                            )}
                        </div>
                        <div className="space-y-2">
                            {apiKeys.map((k: any) => (
                                <div key={k.key_id} className="bg-iron-900/50 border border-iron-900 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-iron-300">{k.name}</p>
                                        <p className="text-[10px] text-iron-600 uppercase">Last Used: {k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}</p>
                                    </div>
                                    <div className="text-[10px] font-mono text-iron-700">SHA256_ACTIVE</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Audit Logs Section */}
                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">Centralized Audit Log</h2>
                    <div className="bg-iron-900 border border-iron-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                            <thead>
                                <tr className="bg-black border-b border-iron-800">
                                    <th className="px-4 py-3 uppercase tracking-widest text-iron-500">Timestamp</th>
                                    <th className="px-4 py-3 uppercase tracking-widest text-iron-500">Actor</th>
                                    <th className="px-4 py-3 uppercase tracking-widest text-iron-500">Action</th>
                                    <th className="px-4 py-3 uppercase tracking-widest text-iron-500">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-iron-900">
                                {auditLogs.map((log: any) => (
                                    <tr key={log.log_id} className="hover:bg-iron-800/50 transition-colors">
                                        <td className="px-4 py-2 text-iron-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-white">{log.actor?.email || 'SYSTEM'}</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-iron-800 px-2 py-0.5 rounded text-iron-300 border border-iron-700">{log.action}</span>
                                        </td>
                                        <td className="px-4 py-2 text-iron-500 truncate max-w-xs">{log.details}</td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-iron-600 uppercase italic">No recent security events recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OrganizationDashboardPage;

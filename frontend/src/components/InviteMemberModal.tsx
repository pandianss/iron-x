
import React, { useState } from 'react';
import { X, Mail, Shield } from 'lucide-react';
import { TeamClient } from '../domain/team';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string; // We need teamId to invite
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, teamId }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await TeamClient.sendInvitation(teamId, email, role);
            setMessage({ type: 'success', text: 'Invitation sent successfully!' });
            setEmail('');
            setTimeout(() => {
                onClose();
                setMessage(null);
            }, 1500);
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send invitation.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-iron-900 border border-iron-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-iron-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-1 flex items-center">
                    <Mail className="mr-2 text-indigo-500" size={20} />
                    Invite Team Member
                </h2>
                <p className="text-iron-500 text-sm mb-6">
                    Add a new member to your team. They will receive an email with a link to join.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-iron-400 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -traniron-y-1/2 text-iron-500" size={16} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-iron-950 border border-iron-800 rounded-md py-2 pl-10 pr-4 text-white placeholder-iron-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="colleague@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-iron-400 mb-1">Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -traniron-y-1/2 text-iron-500" size={16} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-iron-950 border border-iron-800 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>
                        <p className="text-xs text-iron-600 mt-1">Managers can invite others and modify team settings.</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 rounded-md font-medium text-white transition-all ${loading ? 'bg-indigo-700 opacity-70 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-900/20'}`}
                        >
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;

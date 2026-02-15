import React, { useEffect, useState } from 'react';
import { useDiscipline } from '../../hooks/useDiscipline';
import { AuthClient } from '../../domain/auth';
import { UserPlus } from 'lucide-react';
import InviteMemberModal from '../InviteMemberModal';

interface UserProfile {
    user_id: string;
    team_memberships: Array<{
        role: string;
        team: {
            team_id: string;
            name: string;
            owner_id: string;
        }
    }>;
    teams_owned: Array<{
        team_id: string;
        name: string;
    }>;
}

export const DisciplineStatusBar: React.FC = () => {
    const { state } = useDiscipline();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await AuthClient.getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };
        fetchProfile();
    }, []);

    if (!state) return <div className="p-4 bg-iron-900 border border-iron-800 animate-pulse h-24">Loading System State...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'STRICT': return 'text-iron-200'; // Neutral/White
            case 'STABLE': return 'text-iron-400';
            case 'DRIFTING': return 'text-amber-500';
            case 'BREACH': return 'text-red-600 animate-pulse';
            default: return 'text-iron-500';
        }
    };

    // Determine if user can invite (Manager or Owner of any team)
    // For simplicity, we pick the first team they manage/own to invite to.
    // Ideally, if multiple, we'd have a dropdown or the modal would ask which team.
    // MVP: Pick first team found.
    const managedTeam = profile?.team_memberships.find(m => m.role === 'MANAGER' || m.team.owner_id === profile.user_id)?.team
        || profile?.teams_owned[0];

    return (
        <div className="w-full bg-iron-950 border-b border-iron-800 p-4 font-mono text-sm flex justify-between items-center">

            <div className="grid grid-cols-4 gap-8 items-center flex-1">
                <div className="flex flex-col">
                    <span className="text-iron-500 text-xs uppercase tracking-wider">Discipline Score</span>
                    <span className="text-3xl font-bold text-iron-100">{state.score}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-iron-500 text-xs uppercase tracking-wider">Status Classification</span>
                    <span className={`text-xl font-bold ${getStatusColor(state.classification)}`}>{state.classification}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-iron-500 text-xs uppercase tracking-wider">Policies Active</span>
                    <span className="text-iron-300">{state.activeConstraints?.policiesActive ?? 0}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-iron-500 text-xs uppercase tracking-wider">Violation Horizon</span>
                    <span className="text-amber-500 font-bold">{state.violationHorizon?.daysUntilBreach ? `${state.violationHorizon.daysUntilBreach} days` : 'Stable'}</span>
                </div>
            </div>

            {managedTeam && (
                <div className="ml-4 pl-4 border-l border-iron-800">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors text-xs uppercase font-bold tracking-wider"
                    >
                        <UserPlus size={16} />
                        Invite
                    </button>
                    {/* Define modal here conditionally or outside */}
                    <InviteMemberModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        teamId={managedTeam.team_id || (managedTeam as any).id /* handle potential schema diff if any */}
                    />
                </div>
            )}
        </div>
    );
};

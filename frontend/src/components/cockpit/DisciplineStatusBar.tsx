import { useEffect, useState } from 'react';
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

export function DisciplineStatusBar() {
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
        <div className="w-full bg-iron-950/90 backdrop-blur-md border-b border-iron-900 px-6 py-4 font-mono text-sm flex justify-between items-center glass-panel relative z-50">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-iron-800 to-transparent"></div>

            <div className="flex-1 grid grid-cols-4 gap-12 items-center">
                <div className="flex flex-col border-l border-iron-900 pl-4">
                    <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] mb-1">DS_Index (Realtime)</span>
                    <span className="text-3xl font-bold text-white font-display tabular-nums leading-none">{state.score}</span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-4">
                    <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] mb-1">Operational Tier</span>
                    <span className={`text-xl font-bold uppercase font-display tracking-tight leading-none ${getStatusColor(state.classification)}`}>
                        {state.classification}
                    </span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-4">
                    <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] mb-1">Policy Constraints</span>
                    <span className="text-xl font-bold text-iron-300 font-display tabular-nums leading-none">
                        {state.activeConstraints?.policiesActive ?? 0}
                    </span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-4">
                    <span className="text-iron-600 text-[9px] uppercase tracking-[0.3em] mb-1">Violation Horizon</span>
                    <span className={`text-xl font-bold font-display uppercase tracking-tight leading-none ${state.violationHorizon?.daysUntilBreach ? 'text-amber-500' : 'text-iron-500'}`}>
                        {state.violationHorizon?.daysUntilBreach ? `${state.violationHorizon.daysUntilBreach} Cycles` : 'STABLE'}
                    </span>
                </div>
            </div>

            {managedTeam && (
                <div className="ml-8 pl-8 border-l-2 border-iron-900">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-iron-200 transition-all text-[10px] uppercase font-bold tracking-[0.2em] border border-white"
                    >
                        <UserPlus size={14} className="stroke-[3]" />
                        Initialize Node
                    </button>
                    <InviteMemberModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        teamId={managedTeam.team_id || (managedTeam as any).id}
                    />
                </div>
            )}
        </div>
    );
};

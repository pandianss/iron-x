import React, { useEffect, useState } from 'react';
import { getDisciplineState, type DisciplineState } from '../../api/discipline';
import { getProfile } from '../../api/client';
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
    const [state, setState] = useState<DisciplineState | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [disciplineData, profileData] = await Promise.all([
                    getDisciplineState(),
                    getProfile()
                ]);
                setState(disciplineData);
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    if (!state) return <div className="p-4 bg-zinc-900 border border-zinc-800 animate-pulse h-24">Loading System State...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'STRICT': return 'text-zinc-200'; // Neutral/White
            case 'STABLE': return 'text-zinc-400';
            case 'DRIFTING': return 'text-amber-500';
            case 'BREACH': return 'text-red-600 animate-pulse';
            default: return 'text-zinc-500';
        }
    };

    // Determine if user can invite (Manager or Owner of any team)
    // For simplicity, we pick the first team they manage/own to invite to.
    // Ideally, if multiple, we'd have a dropdown or the modal would ask which team.
    // MVP: Pick first team found.
    const managedTeam = profile?.team_memberships.find(m => m.role === 'MANAGER' || m.team.owner_id === profile.user_id)?.team
        || profile?.teams_owned[0];

    return (
        <div className="w-full bg-zinc-950 border-b border-zinc-800 p-4 font-mono text-sm flex justify-between items-center">

            <div className="grid grid-cols-4 gap-8 items-center flex-1">
                <div className="flex flex-col">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Discipline Score</span>
                    <span className="text-3xl font-bold text-zinc-100">{state.score}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Status Classification</span>
                    <span className={`text-xl font-bold ${getStatusColor(state.status)}`}>{state.status}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Time Since Violation</span>
                    <span className="text-zinc-300">{state.timeSinceLastViolation}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Next Enforcement Check</span>
                    <span className="text-amber-500 font-bold">{state.countdownToNextCheck}</span>
                </div>
            </div>

            {managedTeam && (
                <div className="ml-4 pl-4 border-l border-zinc-800">
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
                        teamId={managedTeam.team_id || (managedTeam as any).id /* handle potential schema diff if any */}
                    />
                </div>
            )}
        </div>
    );
};

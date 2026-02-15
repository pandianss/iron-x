
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';
import { emailService } from '../communication/email.service';
import { v4 as uuidv4 } from 'uuid';
import { AppError, NotFoundError, ForbiddenError, BadRequestError } from '../../utils/AppError';

@autoInjectable()
export class TeamService {
    async createInvitation(teamId: string, email: string, role: string, requesterId: string) {
        // 1. Check permissions (assuming requester is manager/owner - verified by controller or here)
        const membership = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });

        if (!membership || membership.role !== 'MANAGER') {
            throw new ForbiddenError('Not authorized to invite members');
        }

        // 2. Check team capacity
        const team = await prisma.team.findUnique({
            where: { team_id: teamId },
            include: { _count: { select: { members: true } } }
        });

        if (!team) throw new NotFoundError('Team not found');
        if (team._count.members >= team.max_seats) {
            throw new ForbiddenError(`Seat limit reached (${team.max_seats} max)`);
        }

        // 3. Check if user is already a member
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            const existingMember = await prisma.teamMember.findUnique({
                where: { team_id_user_id: { team_id: teamId, user_id: existingUser.user_id } }
            });
            if (existingMember) throw new BadRequestError('User is already a member of this team');
        }

        // 4. Create Invitation
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await prisma.teamInvitation.create({
            data: {
                team_id: teamId,
                email,
                role: role || 'MEMBER',
                token,
                expires_at: expiresAt
            }
        });

        // 5. Send Email
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${token}`;
        await emailService.sendInvitationEmail(email, team.name, inviteLink);

        return invitation;
    }

    async acceptInvitation(token: string, userId: string) {
        // 1. Find Invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { token }
        });

        if (!invitation) throw new NotFoundError('Invalid invitation token');
        if (invitation.status !== 'PENDING') throw new BadRequestError('Invitation already accepted or declined');
        if (new Date() > invitation.expires_at) throw new BadRequestError('Invitation expired');

        // 2. Add Member to Team
        // Check if user is already in team again to be safe
        const existingMember = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: invitation.team_id, user_id: userId } }
        });

        if (existingMember) {
            // Just mark accepted if they are already in (idempotent-ish)
            await prisma.teamInvitation.update({
                where: { invitation_id: invitation.invitation_id },
                data: { status: 'ACCEPTED' }
            });
            return { message: 'Already a member' };
        }

        await prisma.$transaction([
            prisma.teamMember.create({
                data: {
                    team_id: invitation.team_id,
                    user_id: userId,
                    role: invitation.role
                }
            }),
            prisma.teamInvitation.update({
                where: { invitation_id: invitation.invitation_id },
                data: { status: 'ACCEPTED' }
            })
        ]);

        return { message: 'Joined team successfully', teamId: invitation.team_id };
    }
}

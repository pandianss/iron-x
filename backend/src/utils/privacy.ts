/**
 * Privacy Utility for Data Masking
 */

export const maskEmail = (email: string): string => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email; // Invalid format, return as is or empty? Return as is for now.

    const maskedLocal = local.length > 2
        ? `${local.slice(0, 2)}***`
        : `${local.slice(0, 1)}***`;

    return `${maskedLocal}@${domain}`;
};

export interface SafeProfile {
    userId: string;
    email: string;
    score: number | null;
    mode: string;
    isLocked: boolean | null;
}

export interface MemberWithUser {
    user: {
        user_id: string;
        email: string;
        current_discipline_score: number | null;
        enforcement_mode: string;
        locked_until: Date | null;
    };
}

export const sanitizeMemberProfile = (member: MemberWithUser, viewerRole: string): SafeProfile => {
    // Determine strictness based on role
    const isManager = viewerRole === 'MANAGER';
    // For now, Managers see full email. Members (if allowed) would see masked.
    // If system config requires strict privacy even for managers, we'd check that here.

    const email = isManager ? member.user.email : maskEmail(member.user.email);

    return {
        userId: member.user.user_id,
        email,
        score: member.user.current_discipline_score,
        mode: member.user.enforcement_mode,
        isLocked: member.user.locked_until ? new Date(member.user.locked_until) > new Date() : false
    };
};

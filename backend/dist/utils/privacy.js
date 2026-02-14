"use strict";
/**
 * Privacy Utility for Data Masking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMemberProfile = exports.maskEmail = void 0;
const maskEmail = (email) => {
    if (!email)
        return '';
    const [local, domain] = email.split('@');
    if (!domain)
        return email; // Invalid format, return as is or empty? Return as is for now.
    const maskedLocal = local.length > 2
        ? `${local.slice(0, 2)}***`
        : `${local.slice(0, 1)}***`;
    return `${maskedLocal}@${domain}`;
};
exports.maskEmail = maskEmail;
const sanitizeMemberProfile = (member, viewerRole) => {
    // Determine strictness based on role
    const isManager = viewerRole === 'MANAGER';
    // For now, Managers see full email. Members (if allowed) would see masked.
    // If system config requires strict privacy even for managers, we'd check that here.
    const email = isManager ? member.user.email : (0, exports.maskEmail)(member.user.email);
    return {
        userId: member.user.user_id,
        email,
        score: member.user.current_discipline_score,
        mode: member.user.enforcement_mode,
        isLocked: member.user.locked_until ? new Date(member.user.locked_until) > new Date() : false
    };
};
exports.sanitizeMemberProfile = sanitizeMemberProfile;

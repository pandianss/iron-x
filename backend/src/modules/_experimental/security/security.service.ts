import { singleton } from 'tsyringe';
import { generateSecret, verify, generateURI } from 'otplib';
import * as QRCode from 'qrcode';

@singleton()
export class SecurityService {
    /**
     * Generates a new TOTP secret for a user.
     */
    generateSecret() {
        return generateSecret();
    }

    /**
     * Generates a QR code URL for the user to scan.
     */
    async generateQRCode(email: string, secret: string) {
        const otpauth = generateURI({ issuer: 'Iron-X', label: email, secret });
        return await QRCode.toDataURL(otpauth);
    }

    /**
     * Verifies a TOTP code against a secret.
     */
    verifyToken(token: string, secret: string) {
        return verify({ token, secret });
    }
}

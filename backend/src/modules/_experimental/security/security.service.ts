import { singleton } from 'tsyringe';
const { authenticator } = require('otplib');
import * as QRCode from 'qrcode';

@singleton()
export class SecurityService {
    /**
     * Generates a new TOTP secret for a user.
     */
    generateSecret() {
        return authenticator.generateSecret();
    }

    /**
     * Generates a QR code URL for the user to scan.
     */
    async generateQRCode(email: string, secret: string) {
        const otpauth = authenticator.keyuri(email, 'Iron-X', secret);
        return await QRCode.toDataURL(otpauth);
    }

    /**
     * Verifies a TOTP code against a secret.
     */
    verifyToken(token: string, secret: string) {
        return authenticator.verify({ token, secret });
    }
}

import { singleton } from 'tsyringe';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

@singleton()
export class SecurityService {
    /**
     * Generates a new TOTP secret.
     */
    generateSecret(): string {
        return generateSecret();
    }

    /**
     * Generates a QR code data URL for the given secret.
     */
    async generateQRCode(email: string, secret: string): Promise<string> {
        const otpauth = generateURI({
            issuer: 'Iron-X',
            label: email,
            secret: secret
        });
        return await QRCode.toDataURL(otpauth);
    }

    /**
     * Verifies a TOTP token against a secret.
     */
    verifyToken(token: string, secret: string): boolean {
        const result = verifySync({ token, secret });
        return result.valid;
    }
}

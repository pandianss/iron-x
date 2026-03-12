import { Request, Response, NextFunction } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { AuthService } from './auth.service';
import { PolicyService } from '../policies/policy.service';
import { EmailService } from '../communication/email.service';

@autoInjectable()
export class AuthController {
    constructor(
        @inject(AuthService) private authService: AuthService,
        @inject(PolicyService) private policyService: PolicyService,
        @inject(EmailService) private emailService: EmailService
    ) { }

    sync = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // The auth middleware has already validated the token and set req.user if they exist
            // Wait, sync actually needs to CREATE the user if they don't exist yet, so we should
            // read from the body, since we want to pass org parameters. OR we can grab the uid directly
            // from the decoded token we expect the frontend to pass as Bearer token.

            // To keep it simple, we expect the frontend to call this endpoint AFTER firebase login. 
            // We'll read the email and uid from the Firebase token they pass in the Authorization header.
            // But wait, our `authMiddleware.ts` was set up to block if user DOES NOT exist. 
            // So we need a special path for sync, or we verify the token manually here!

            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { firebaseAuth } = require('../../config/firebase');
            const decodedToken = await firebaseAuth.verifyIdToken(token);

            const syncData = {
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                ...req.body // includes timezone, orgName, orgSlug
            };

            const result = await this.authService.syncUser(syncData);

            // Phase 6: Institutionalization - Assign Default Role (if first time, but policyService handles idempotent checks)
            try {
                await this.policyService.assignDefaultRole(result.user.id);
            } catch (e) {
                // Ignore
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

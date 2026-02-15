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

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.register(req.body);

            // Trigger Welcome Email
            try {
                await this.emailService.sendWelcomeEmail(result.user.email, result.user.email.split('@')[0]);
            } catch (e) {
                console.error('Failed to send welcome email:', e);
            }

            // Phase 6: Institutionalization - Assign Default Role
            try {
                await this.policyService.assignDefaultRole(result.user.id);
            } catch (e) {
                console.error('Failed to assign default role:', e);
                // Don't fail registration
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.login(req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}

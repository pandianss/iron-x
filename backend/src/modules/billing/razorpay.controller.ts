
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { RazorpayService } from './razorpay.service';

export class RazorpayController {
    static async createSubscription(req: Request, res: Response) {
        try {
            const { planId } = req.body;
            const userId = (req as any).user.id;
            const email = (req as any).user.email;

            const service = container.resolve(RazorpayService);
            const subscription = await service.createSubscription(userId, email, planId);

            res.json(subscription);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async verifyPayment(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const paymentResponse = req.body;

            const service = container.resolve(RazorpayService);
            const result = await service.verifyPayment(userId, paymentResponse);

            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async webhook(req: Request, res: Response) {
        try {
            const signature = req.headers['x-razorpay-signature'] as string;
            const payload = req.body;

            const service = container.resolve(RazorpayService);
            await service.handleWebhook(signature, payload);

            res.status(200).send('OK');
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

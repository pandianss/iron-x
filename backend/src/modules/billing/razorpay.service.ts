
import Razorpay from 'razorpay';
import prisma from '../../db';
import { container } from 'tsyringe';
import crypto from 'crypto';

export class RazorpayService {
    private razorpay: Razorpay;

    constructor() {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('Razorpay configuration is missing required environment variables.');
        }

        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });
    }

    async createCustomer(userId: string, email: string): Promise<string> {
        // Check if existing
        const existingSub = await prisma.subscription.findUnique({ where: { user_id: userId } });
        if (existingSub?.razorpay_customer_id) return existingSub.razorpay_customer_id;

        const customer = await this.razorpay.customers.create({
            email,
            notes: { userId },
        } as any);

        // Update DB
        await prisma.subscription.upsert({
            where: { user_id: userId },
            update: { razorpay_customer_id: customer.id },
            create: {
                user_id: userId,
                razorpay_customer_id: customer.id,
                plan_tier: 'FREE'
            }
        });

        return customer.id;
    }

    async createSubscription(userId: string, email: string, planId: string) {
        const customerId = await this.createCustomer(userId, email);

        const subscription = await this.razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12, // For example, 1 year
            notes: { userId },
        });

        // Store subscription ID in DB (initially inactive)
        await prisma.subscription.update({
            where: { user_id: userId },
            data: {
                razorpay_subscription_id: subscription.id,
                is_active: false
            }
        });

        return subscription;
    }

    async verifyPayment(userId: string, paymentResponse: any) {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = paymentResponse;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error('Razorpay secret not configured.');
        const body = razorpay_payment_id + "|" + razorpay_subscription_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update DB
            await prisma.subscription.update({
                where: { user_id: userId },
                data: {
                    razorpay_subscription_id: razorpay_subscription_id,
                    plan_tier: 'INDIVIDUAL_PRO',
                    is_active: true,
                    start_date: new Date(),
                    end_date: null
                }
            });
            return { success: true };
        } else {
            throw new Error('Invalid signature');
        }
    }

    async handleWebhook(signature: string, payload: any) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify signature
        if (webhookSecret) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(payload))
                .digest('hex');

            if (expectedSignature !== signature) {
                throw new Error('Invalid signature');
            }
        }

        const event = payload.event;
        const data = payload.payload;

        switch (event) {
            case 'subscription.activated':
                await this.handleSubscriptionUpdated(data.subscription.entity, true);
                break;
            case 'subscription.halted':
            case 'subscription.cancelled':
            case 'subscription.expired':
                await this.handleSubscriptionUpdated(data.subscription.entity, false);
                break;
            default:
                console.log(`Unhandled event type ${event}`);
        }
    }

    private async handleSubscriptionUpdated(subscription: any, isActive: boolean) {
        const userId = subscription.notes?.userId;
        const subscriptionId = subscription.id;

        if (subscriptionId) {
            await prisma.subscription.update({
                where: { razorpay_subscription_id: subscriptionId },
                data: {
                    is_active: isActive,
                    plan_tier: isActive ? 'INDIVIDUAL_PRO' : 'FREE'
                }
            });
        } else if (userId) {
            await prisma.subscription.update({
                where: { user_id: userId },
                data: {
                    is_active: isActive,
                    plan_tier: isActive ? 'INDIVIDUAL_PRO' : 'FREE'
                }
            });
        }
    }
}

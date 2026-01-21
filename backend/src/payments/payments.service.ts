import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}

export interface PaymentVerification {
    orderId: string;
    paymentId: string;
    signature: string;
}

@Injectable()
export class PaymentsService implements OnModuleInit {
    private razorpay: any = null;

    onModuleInit() {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.warn('Razorpay credentials not configured. Payment features will be unavailable.');
            return;
        }

        this.razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        console.log('✅ Razorpay client initialized');
    }

    isConfigured(): boolean {
        return !!this.razorpay;
    }

    /**
     * Create a Razorpay order for hold deposit
     */
    async createHoldDepositOrder(
        bookingId: string,
        amount: number,
        customerPhone?: string,
    ): Promise<RazorpayOrder> {
        if (!this.razorpay) {
            throw new BadRequestException('Payment service not configured');
        }

        try {
            const order = await this.razorpay.orders.create({
                amount: amount * 100, // Razorpay expects paise
                currency: 'INR',
                receipt: bookingId,
                notes: {
                    bookingId,
                    type: 'hold_deposit',
                    customerPhone: customerPhone || '',
                },
            });

            return {
                id: order.id,
                amount: Number(order.amount),
                currency: order.currency,
                receipt: order.receipt || bookingId,
                status: order.status,
            };
        } catch (error: any) {
            throw new BadRequestException(`Failed to create order: ${error.message}`);
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    verifyPaymentSignature(verification: PaymentVerification): boolean {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
            throw new BadRequestException('Payment service not configured');
        }

        const body = verification.orderId + '|' + verification.paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex');

        return expectedSignature === verification.signature;
    }

    /**
     * Process webhook event from Razorpay
     */
    verifyWebhookSignature(body: string, signature: string): boolean {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.warn('Razorpay webhook secret not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    }

    /**
     * Fetch payment details
     */
    async getPaymentDetails(paymentId: string): Promise<any> {
        if (!this.razorpay) {
            throw new BadRequestException('Payment service not configured');
        }

        return this.razorpay.payments.fetch(paymentId);
    }

    /**
     * Initiate refund for cancelled hold
     */
    async initiateRefund(
        paymentId: string,
        amount?: number,
        reason?: string,
    ): Promise<any> {
        if (!this.razorpay) {
            throw new BadRequestException('Payment service not configured');
        }

        const refundData: any = {
            speed: 'normal',
        };

        if (amount) {
            refundData.amount = amount * 100; // paise
        }

        if (reason) {
            refundData.notes = { reason };
        }

        return this.razorpay.payments.refund(paymentId, refundData);
    }
}

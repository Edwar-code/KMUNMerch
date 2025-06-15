import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Assuming this is your Prisma client instance
import { PaymentStatus as PrismaPaymentStatus, OrderStatus } from '@prisma/client'; // Assuming these enums are defined in your Prisma schema

// Define the expected payload structure from PayHero Button SDK
interface PayHeroButtonCallbackPayload {
  paymentSuccess: boolean;
  reference: string; // PayHero's internal transaction reference
  user_reference: string; // This is YOUR externalReference sent from the frontend
  provider?: string; // e.g., "m-pesa"
  providerReference?: string; // e.g., M-Pesa transaction code
  amount: number;
  phone?: string;
  customerName?: string;
  channel?: string;
  message?: string; // Optional message from PayHero
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json() as PayHeroButtonCallbackPayload;
        console.log("PayHero Button Callback Received:", JSON.stringify(payload, null, 2));

        // --- Basic Payload Validation ---
        if (typeof payload.paymentSuccess === 'undefined' || !payload.user_reference || !payload.reference) {
            console.error("PayHero Callback: Missing critical fields (paymentSuccess, user_reference, reference).", payload);
            return NextResponse.json(
                { message: "Invalid payload: Missing critical fields." },
                { status: 400 }
            );
        }

        const yourExternalReference = payload.user_reference; // This is what you used as 'reference' in PayHero.init
        const payheroTransactionReference = payload.reference; // PayHero's own transaction ID
        const providerTransactionReference = payload.providerReference; // e.g., M-Pesa code

        // 1. Find the Order record using your external reference.
        // Ensure your Order model has a field (e.g., 'paymentReference' or 'externalReference')
        // that stores the 'user_reference' you sent to PayHero.
        // I'm assuming your 'payheroReference' field in the Order model is used for this.
        const order = await prisma.order.findUnique({ // Use findUnique if your reference field is unique
            where: {
                // IMPORTANT: This field in your Order model MUST store the 'user_reference'
                // you passed to PayHero.init({ reference: "YOUR_EXTERNAL_REFERENCE" })
                // If your field is named differently, adjust here.
                // Based on your old code, it seems to be 'payheroReference'
                payheroReference: yourExternalReference,
            },
        });

        if (!order) {
            console.error(`Order record not found for your external reference (user_reference): ${yourExternalReference}`);
            // Acknowledge receipt to PayHero to prevent retries for a non-existent order from our side.
            return NextResponse.json(
                { message: "Order record not found by user_reference." },
                { status: 200 } // 200 to stop PayHero retries; 404 might also be okay if they don't retry on 404
            );
        }

        // --- Idempotency Check: Prevent reprocessing ---
        // Check if the order is already in a final "paid" or "completed" state.
        if (order.paymentStatus === PrismaPaymentStatus.completed ||  order.status === OrderStatus.processing) {
            // Check against relevant "final" statuses for payment
            console.log(`PayHero Callback: Order ${order.id} (user_reference: ${yourExternalReference}) already processed as ${order.status} with payment ${order.paymentStatus}.`);
            return NextResponse.json({ message: "Order already processed." }, { status: 200 });
        }


        if (payload.paymentSuccess === true) {
            // Payment was successful according to PayHero

            // --- Amount Verification (Optional but Recommended) ---
            const amountPaid = parseFloat(payload.amount.toString());
            if (Math.ceil(order.total) !== Math.ceil(amountPaid)) { // Compare integers or use a small epsilon for floats
                console.warn(`PayHero Callback: Amount mismatch for order ${order.id}. Expected: ${order.total}, Paid: ${amountPaid}. Processing anyway, but flag for review.`);
                // Decide if this is a critical failure or just a warning.
            }

            // 2. Update the Order record with transaction details and status
            try {
                await prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        // Assuming 'transactionId' in your Order model is for the provider's (e.g., M-Pesa) reference
                        transactionId: providerTransactionReference,
                        // You might want a new field for PayHero's own reference, e.g., 'paymentGatewayReference'
                        payheroReference: payheroTransactionReference, // Store PayHero's internal Ref
                        paymentStatus: PrismaPaymentStatus.completed, // Your enum for payment status
                        status: OrderStatus.processing,
                    },
                });
                console.log(`Order ${order.id} (user_reference: ${yourExternalReference}) updated to PAID/PROCESSING.`);

                // --- Clear User's Cart ---
                // This is a good place to clear the cart as the payment is confirmed.
                try {
                    await prisma.cart.deleteMany({
                        where: { userId: order.userId }, // Assuming Order model has userId
                    });
                    console.log(`Cart cleared for user ${order.userId}.`);
                } catch (cartError) {
                    console.error(`Error clearing cart for user ${order.userId} after order ${order.id} payment:`, cartError);
                }

                return NextResponse.json({ message: 'Payment processed successfully' }, { status: 200 });

            } catch (dbUpdateError) {
                console.error('Error updating database:', dbUpdateError);
                return NextResponse.json(
                    { message: 'Error updating database', error: (dbUpdateError as Error).message },
                    { status: 500 }
                );
            }
        } else {
            // Payment failed or was cancelled according to PayHero
            console.log(`PayHero Callback: Payment not successful for order ${order.id} (user_reference: ${yourExternalReference}). Reason: ${payload.message || 'N/A'}`);
            try {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: PrismaPaymentStatus.failed,
                        status: OrderStatus.cancelled, // Or a specific payment failed status
                        payheroReference: payheroTransactionReference, // Store PayHero's ref even for failures
                    },
                });
                return NextResponse.json({ message: 'Payment failed or cancelled as per callback.' }, { status: 200 }); // 200 to acknowledge
            } catch (dbUpdateError) {
                 console.error('Error updating database for failed payment:', dbUpdateError);
                return NextResponse.json(
                    { message: 'Error updating database for failed payment', error: (dbUpdateError as Error).message },
                    { status: 500 }
                );
            }
        }

    } catch (error) {
        console.error('Callback processing error:', error);
        return NextResponse.json(
            { message: 'Error processing callback', error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

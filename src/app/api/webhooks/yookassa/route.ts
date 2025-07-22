import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { handleSubscriptionCreation } from "~/lib/subscription-management";

interface YooKassaEvent {
  type: string;
  object?: YooKassaPayment;
}

interface YooKassaPayment {
  id: string;
  status: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // In production, you should verify the webhook signature
    // const headersList = await headers();
    // const signature = headersList.get("x-yookassa-signature");
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const event = JSON.parse(body) as YooKassaEvent;
    
    console.log("YooKassa webhook received:", event.type, event.object?.id);

    // Handle different event types
    switch (event.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(event.object);
        break;
      case "payment.canceled":
        await handlePaymentCanceled(event.object);
        break;
      case "payment.waiting_for_capture":
        // Auto-capture if needed (we already set capture: true)
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(payment: YooKassaPayment | undefined) {
  try {
    if (!payment) {
      console.error("Payment object is undefined");
      return;
    }

    const paymentId = payment.id;
    const metadata = payment.metadata ?? {};
    
    console.log("Processing successful payment:", paymentId, metadata);

    // Find the pending subscription
    const subscription = await db.subscription.findFirst({
      where: {
        paymentId: paymentId,
        status: "PENDING",
      },
      include: {
        plan: true,
        user: true,
      },
    });

    if (!subscription) {
      console.error("Subscription not found for payment:", paymentId);
      return;
    }

    // Activate the subscription
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        isActive: true,
      },
    });

    console.log("Subscription activated:", subscription.id);

    // Add user to all 3x-ui inbounds and generate configs
    try {
      console.log(`Setting up VPN access for subscription ${subscription.id}`);
      await handleSubscriptionCreation(subscription.id);
      console.log(`Successfully set up VPN access for subscription ${subscription.id}`);
    } catch (setupError) {
      console.error(`Error setting up VPN access for subscription ${subscription.id}:`, setupError);
      
      // Log the error but don't fail the webhook - the subscription is still activated
      // We can retry the setup later or handle it manually
      console.warn(`Subscription ${subscription.id} is active but VPN setup failed. Manual intervention may be required.`);
    }
    
    // TODO: Send welcome email with setup instructions

  } catch (error) {
    console.error("Error processing successful payment:", error);
    throw error;
  }
}

async function handlePaymentCanceled(payment: YooKassaPayment | undefined) {
  try {
    if (!payment) {
      console.error("Payment object is undefined");
      return;
    }

    const paymentId = payment.id;
    
    console.log("Processing canceled payment:", paymentId);

    // Find and cancel the pending subscription
    const subscription = await db.subscription.findFirst({
      where: {
        paymentId: paymentId,
        status: "PENDING",
      },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "CANCELLED",
          isActive: false,
        },
      });

      console.log("Subscription cancelled:", subscription.id);
    }
  } catch (error) {
    console.error("Error processing canceled payment:", error);
    throw error;
  }
}

// In production, implement signature verification
// function verifySignature(body: string, signature: string): boolean {
//   const crypto = require('crypto');
//   const secret = env.YOOKASSA_SECRET_KEY;
//   const computedSignature = crypto
//     .createHmac('sha256', secret)
//     .update(body)
//     .digest('hex');
//   return signature === computedSignature;
// } 
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

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

    // Here you would also:
    // 1. Create VPN configuration for the user
    // 2. Send welcome email
    // 3. Set up user in 3x-ui panel
    // 4. Generate connection configs
    
    // TODO: Integrate with 3x-ui API to create user account
    // TODO: Generate and store connection configs
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
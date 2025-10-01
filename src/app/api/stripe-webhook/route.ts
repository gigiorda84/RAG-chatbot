import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSubscription, updateSubscription } from "@/lib/database";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { botId, userId } = session.metadata || {};

        if (botId && userId) {
          // Create subscription in database
          await createSubscription({
            user_id: userId,
            bot_id: botId,
            stripe_sub_id: session.subscription as string,
            active: true,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === "active";

        // Find and update subscription in database
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("stripe_sub_id", subscription.id);

        if (subs && subs.length > 0) {
          await updateSubscription(subs[0].id, { active: isActive });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

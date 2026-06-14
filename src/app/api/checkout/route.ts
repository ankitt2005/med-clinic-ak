// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(req: Request) {
  try {
    const {
      userId,
      userEmail,
      serviceId,
      serviceName,
      servicePrice,
      doctorId,
      doctorName,
      date,
      time,
    } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is missing in environment variables.");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${serviceName} - ${doctorName}`,
              description: `AuraCare Consultation on ${date} at ${time}`,
            },
            unit_amount: Math.round(servicePrice * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get(
        "origin"
      )}/booking/success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&serviceId=${serviceId}&serviceName=${encodeURIComponent(
        serviceName
      )}&doctorId=${doctorId}&doctorName=${encodeURIComponent(
        doctorName
      )}&date=${date}&time=${time}&price=${servicePrice}`,
      cancel_url: `${req.headers.get("origin")}/booking?cancelled=true`,
      metadata: {
        userId,
        userEmail,
        serviceId,
        doctorId,
        date,
        time,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ message: err.message || "Failed to create payment session" }, { status: 500 });
  }
}

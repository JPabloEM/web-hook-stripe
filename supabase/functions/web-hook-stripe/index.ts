import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { stripe } from "https://cdn.skypack.dev/stripe?dts"; // Stripe SDK para Deno

const STRIPE_SECRET = "tu_stripe_secret_key";
const STRIPE_WEBHOOK_SECRET = "tu_webhook_secret"; // Lo obtienes en el dashboard de Stripe

// Función para guardar datos en la base de datos (puedes usar Supabase)
async function guardarEnBaseDeDatos(paymentData: any, status: string) {
  console.log(`Guardando en la base de datos: ${status}`, paymentData);
  // Aquí conecta con Supabase o tu base de datos
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Leer el cuerpo como texto para validar la firma
    const rawBody = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    if (!signature) {
      return new Response("Missing Stripe-Signature header", { status: 400 });
    }

    // Validar la firma del webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }

    // Procesar eventos específicos
    if (event.type === "checkout.session.completed") {
      const paymentData = event.data.object;
      await guardarEnBaseDeDatos(paymentData, "success");
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentData = event.data.object;
      await guardarEnBaseDeDatos(paymentData, "failed");
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

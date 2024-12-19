// Importa la librería de Stripe compatible con Deno
import Stripe from "https://esm.sh/stripe?target=deno";

// Configura Stripe con la clave secreta
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-08-16",
});

// Servidor para manejar las solicitudes
Deno.serve(async (req) => {
  try {
    // Extrae amount y currency del body de la solicitud
    const { amount, currency } = await req.json();

    // Validar los parámetros
    if (!amount || !currency) {
      return new Response(
        JSON.stringify({ error: "Amount and currency are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crear el PaymentIntent usando Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    // Responder con el client_secret
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    // Manejo de errores
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Create a Stripe PaymentIntent for a booking
 */
export async function createPaymentIntent(opts: {
  amount: number;
  currency: string;
  bookingId: number;
  paymentId: number;
  idempotencyKey?: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();

  // Stripe expects amounts in the smallest currency unit.
  // FCFA/XAF and GHS are already in whole units (no subunits),
  // but USD needs cents. Adjust if currency has decimals.
  const zeroDecimalCurrencies = ["xaf", "xof", "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv"];
  const currencyLower = opts.currency.toLowerCase();
  // Map FCFA to XAF (its ISO 4217 code) for Stripe
  const stripeCurrency = currencyLower === "fcfa" ? "xaf" : currencyLower;
  const isZeroDecimal = zeroDecimalCurrencies.includes(stripeCurrency);
  const stripeAmount = isZeroDecimal ? opts.amount : opts.amount * 100;

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: stripeAmount,
      currency: stripeCurrency,
      metadata: {
        bookingId: opts.bookingId.toString(),
        paymentId: opts.paymentId.toString(),
      },
    },
    opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : undefined,
  );

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Verify a Stripe webhook signature and parse the event
 */
export function verifyWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

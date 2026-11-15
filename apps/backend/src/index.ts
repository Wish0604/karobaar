import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { db } from "./store.js";
import { sendPush } from "./services/onesignal.js";

const app = express();
const port = Number(process.env.BACKEND_PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "localai-backend" } });
});

app.post("/api/v1/auth/send-otp", (req, res) => {
  const schema = z.object({
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
  }).refine((data) => data.phone || data.email, {
    message: "Either mobile number or email address is required",
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ success: false, error: result.error.flatten() });

  res.json({ success: true, data: { otpSessionId: "demo-session", expiresInSeconds: 300 } });
});

app.post("/api/v1/auth/verify-otp", (req, res) => {
  const schema = z.object({
    otpSessionId: z.string(),
    otp: z.string().length(6),
    role: z.enum(["customer", "merchant", "admin"]),
    phone: z.string().optional(),
    email: z.string().optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ success: false, error: result.error.flatten() });

  res.json({
    success: true,
    data: {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      user: {
        id: "u_demo",
        role: result.data.role,
        phone: result.data.phone,
        email: result.data.email,
      }
    }
  });
});

app.post("/api/v1/auth/google", (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(["customer", "merchant", "admin"]).default("customer"),
    googleId: z.string().optional(),
    avatar: z.string().optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ success: false, error: result.error.flatten() });

  res.json({
    success: true,
    data: {
      accessToken: "demo-google-access-token",
      refreshToken: "demo-google-refresh-token",
      user: {
        id: `u_google_${Date.now()}`,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        avatar: result.data.avatar,
      }
    }
  });
});

app.post("/api/v1/merchant/onboarding", (req, res) => {
  const schema = z.object({
    legalEntity: z.enum(["individual", "partnership", "llp", "private_limited", "other"]),
    operatingModel: z.enum(["home_based", "physical_storefront", "online_only", "service_based"]),
    businessCategory: z.string().min(2),
    displayName: z.string().min(2),
    city: z.string().min(2)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const merchant = { id: `biz_${db.merchants.length + 1}`, ...parsed.data };
  db.merchants.push(merchant);

  res.status(201).json({ success: true, data: merchant });
});

app.get("/api/v1/merchant/onboarding/status", (_req, res) => {
  res.json({ success: true, data: { stage: "profile_started", next: "document_verification" } });
});

app.post("/api/v1/merchant/products", (req, res) => {
  const schema = z.object({
    businessId: z.string(),
    name: z.string().min(2),
    price: z.number().positive(),
    quantity: z.number().int().nonnegative()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const product = { id: `prd_${db.products.length + 1}`, ...parsed.data };
  db.products.push(product);
  res.status(201).json({ success: true, data: product });
});

app.get("/api/v1/merchant/products", (req, res) => {
  const businessId = req.query.businessId?.toString();
  const items = businessId ? db.products.filter((p) => p.businessId === businessId) : db.products;
  res.json({ success: true, data: items });
});

app.patch("/api/v1/merchant/inventory/:productId", (req, res) => {
  const schema = z.object({ quantity: z.number().int().nonnegative() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const product = db.products.find((p) => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, error: "Product not found" });

  product.quantity = parsed.data.quantity;
  res.json({ success: true, data: product });
});

app.get("/api/v1/discovery/search", (req, res) => {
  const q = (req.query.q?.toString() || "").toLowerCase();
  const maxPrice = Number(req.query.maxPrice || Number.MAX_SAFE_INTEGER);

  const results = db.products
    .filter((p) => p.name.toLowerCase().includes(q))
    .filter((p) => p.price <= maxPrice)
    .map((p) => ({
      ...p,
      availability: p.quantity > 0 ? "confirmed" : "unavailable"
    }));

  res.json({ success: true, data: results });
});

app.get("/api/v1/discovery/compare", (req, res) => {
  const productName = req.query.productName?.toString().toLowerCase() || "";
  const matches = db.products
    .filter((p) => p.name.toLowerCase().includes(productName))
    .map((p) => ({
      merchantId: p.businessId,
      productId: p.id,
      productName: p.name,
      price: p.price,
      availability: p.quantity > 0 ? "confirmed" : "unavailable"
    }));

  res.json({ success: true, data: matches });
});

app.post("/api/v1/reservations", (req, res) => {
  const schema = z.object({
    businessId: z.string(),
    customerId: z.string(),
    productId: z.string(),
    quantity: z.number().int().positive()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const product = db.products.find((p) => p.id === parsed.data.productId);
  if (!product) return res.status(404).json({ success: false, error: "Product not found" });
  if (product.quantity < parsed.data.quantity) {
    return res.status(409).json({ success: false, error: "Insufficient stock" });
  }

  const reservation = {
    id: `res_${db.reservations.length + 1}`,
    ...parsed.data,
    status: "awaiting_confirmation" as const
  };
  db.reservations.push(reservation);

  res.status(201).json({ success: true, data: reservation });
});

app.post("/api/v1/reservations/:id/confirm", (req, res) => {
  const reservation = db.reservations.find((r) => r.id === req.params.id);
  if (!reservation) return res.status(404).json({ success: false, error: "Reservation not found" });

  const product = db.products.find((p) => p.id === reservation.productId);
  if (!product || product.quantity < reservation.quantity) {
    return res.status(409).json({ success: false, error: "Stock unavailable" });
  }

  product.quantity -= reservation.quantity;
  reservation.status = "confirmed";

  // Notify the customer that their reservation is confirmed
  void sendPush({
    externalIds: [`customer_${reservation.customerId}`],
    heading: "Reservation confirmed ✅",
    content: `${product.name} × ${reservation.quantity} is confirmed — ready for pickup at the store.`,
    data: { type: "reservation_confirmed", reservationId: reservation.id, productId: product.id },
  });

  res.json({ success: true, data: reservation });
});

app.post("/api/v1/orders", (req, res) => {
  const schema = z.object({ customerId: z.string(), items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  const total = parsed.data.items.reduce((sum, item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const order = {
    id: `ord_${Date.now()}`,
    status: "created" as const,
    total,
    items: parsed.data.items
  };

  // Notify every merchant whose products are in this order
  const businessIds = [...new Set(parsed.data.items.flatMap((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    return product ? [product.businessId] : [];
  }))];
  const itemCount = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
  for (const businessId of businessIds) {
    void sendPush({
      externalIds: [`merchant_${businessId}`],
      heading: "New Order! 🛒",
      content: `Order #${order.id} — ${itemCount} item${itemCount === 1 ? "" : "s"}, ₹${total}`,
      data: { type: "new_order", orderId: order.id, total, itemCount },
    });
  }

  res.status(201).json({ success: true, data: order });
});

app.post("/api/v1/payments/create", (req, res) => {
  const schema = z.object({ orderId: z.string(), amount: z.number().positive(), method: z.enum(["upi", "wallet", "card"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  res.status(201).json({
    success: true,
    data: {
      paymentId: `pay_${Date.now()}`,
      orderId: parsed.data.orderId,
      amount: parsed.data.amount,
      status: "pending",
      provider: "paytm-demo",
      redirectUrl: "https://example.com/paytm-demo"
    }
  });
});

app.post("/api/v1/payments/webhook", (req, res) => {
  res.json({ success: true, data: { received: true, event: req.body?.event || "payment.updated" } });
});

app.post("/api/v1/ai/assistant/message", async (req, res) => {
  const schema = z.object({ role: z.enum(["merchant", "customer"]), message: z.string().min(2), language: z.string().default("en") });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  // This keeps the backend independent of any specific model provider.
  const summary = parsed.data.role === "merchant"
    ? "I can help with sales trends, stock suggestions, and campaign drafts."
    : "I can help find nearby products, compare prices, and create reservations.";

  res.json({
    success: true,
    data: {
      response: `${summary} You asked: ${parsed.data.message}`,
      suggestedActions: parsed.data.role === "merchant"
        ? ["get_inventory", "get_merchant_sales", "generate_offer"]
        : ["search_nearby_products", "compare_prices", "create_reservation"]
    }
  });
});

// ─────────────────────────────────────────────────────────────
// AI voice proxy: browser → Express → ai-service (:8000 → Sarvam).
// Keeps the Sarvam API key server-side; the web app only ever talks
// to this same-origin /api path.
// ─────────────────────────────────────────────────────────────
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function forwardToAiService(upstream: Response, res: express.Response) {
  const body = await upstream.json().catch(() => null);
  if (body && typeof body === "object" && "detail" in body) {
    // FastAPI wraps HTTPException payloads in {"detail": ...} — unwrap for the client
    res.status(upstream.status).json((body as { detail: unknown }).detail);
  } else if (body === null) {
    res.status(502).json({ success: false, error: { code: "ai_service_error", message: "Invalid response from AI service" } });
  } else {
    res.status(upstream.status).json(body);
  }
}

app.get("/api/v1/ai/voice/config", async (_req, res) => {
  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/v1/voice/config`);
    await forwardToAiService(upstream, res);
  } catch {
    res.status(502).json({ success: false, error: { code: "ai_service_down", message: "AI service unreachable" } });
  }
});

app.post("/api/v1/ai/voice/stt", express.raw({ type: "*/*", limit: "10mb" }), async (req, res) => {
  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/v1/voice/stt`, {
      method: "POST",
      headers: { "content-type": req.headers["content-type"] || "audio/webm" },
      body: new Uint8Array(req.body as Buffer),
    });
    await forwardToAiService(upstream, res);
  } catch {
    res.status(502).json({ success: false, error: { code: "ai_service_down", message: "AI service unreachable" } });
  }
});

app.post("/api/v1/ai/voice/tts", async (req, res) => {
  const schema = z.object({
    text: z.string().min(1).max(2500),
    languageCode: z.string().default("en-IN"),
    speaker: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });

  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/v1/voice/tts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    await forwardToAiService(upstream, res);
  } catch {
    res.status(502).json({ success: false, error: { code: "ai_service_down", message: "AI service unreachable" } });
  }
});

// Serve the built web app (apps/web/dist) when it exists, so the whole product
// runs on a single port behind the sandbox preview gateway.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, "../../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`LocalAI backend running on http://localhost:${port}`);
});

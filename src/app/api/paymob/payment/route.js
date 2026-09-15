const paymobBaseUrl = "https://accept.paymob.com/api";

async function paymobRequest(path, body) {
  const response = await fetch(`${paymobBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.message || "فشل الاتصال بـ Paymob");
  return data;
}

export async function POST(request) {
  if (!process.env.PAYMOB_API_KEY) {
    return Response.json({ error: "إعدادات Paymob غير مكتملة في الخادم" }, { status: 503 });
  }

  try {
    const { productId, name, price, email = "customer@nova-country.com", phone = "01000000000" } = await request.json();
    const amountCents = Math.round(Number(price) * 100);
    if (!name || !Number.isFinite(amountCents) || amountCents <= 0) {
      return Response.json({ error: "بيانات المنتج غير صحيحة" }, { status: 400 });
    }

    const auth = await paymobRequest("/auth/tokens", { api_key: process.env.PAYMOB_API_KEY });
    const order = await paymobRequest("/ecommerce/orders", {
      auth_token: auth.token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      items: [{ name: String(name).slice(0, 120), amount_cents: amountCents, description: `NOVA product ${productId || ""}`.trim(), quantity: 1 }],
    });
    return Response.json({ orderId: order.id, status: "created", message: "تم إنشاء الطلب في Paymob" });
  } catch (error) {
    return Response.json({ error: error.message || "تعذر إنشاء عملية الدفع" }, { status: 502 });
  }
}
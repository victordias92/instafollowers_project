import { API_BASE, getCheckoutReturnBase } from "./config.js";

async function parseResponse(res) {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!res.ok) {
    throw new Error(json?.message || json?.error || text || `HTTP ${res.status}`);
  }
  return json;
}

export async function criarOrder({ package: pkg, price, buyer_name, buyer_email, payment_method, link }) {
  const res = await fetch(`${API_BASE}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: pkg,
      price,
      buyer_name,
      buyer_email,
      payment_method,
      link,
    }),
  });
  return parseResponse(res);
}

export async function criarPreference(orderId) {
  const res = await fetch(`${API_BASE}/api/create_preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      return_base_url: getCheckoutReturnBase(),
    }),
  });
  const pref = await parseResponse(res);

  const checkoutUrl = pref.init_point || pref.sandbox_init_point;
  if (checkoutUrl) {
    window.location.href = checkoutUrl;
    return pref;
  }

  const detail = pref.detail || pref.raw?.message || pref.error;
  throw new Error(detail || "Nenhum link de pagamento disponível");
}

export async function confirmarPagamento(paymentId) {
  const res = await fetch(`${API_BASE}/payment_status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });
  return parseResponse(res);
}

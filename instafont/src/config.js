// Em dev, deixe vazio para usar o proxy do Vite. Em produção, defina VITE_API_BASE no .env
export const API_BASE = import.meta.env.VITE_API_BASE || "";

// URL pública HTTPS para retorno do Mercado Pago (obrigatório em dev com localhost)
export const PUBLIC_BASE =
  import.meta.env.VITE_PUBLIC_BASE_URL ||
  "https://grumpily-staple-endanger.ngrok-free.dev";

export function getCheckoutReturnBase() {
  const origin = window.location.origin;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return PUBLIC_BASE.replace(/\/$/, "");
  }
  return origin.replace(/\/$/, "");
}
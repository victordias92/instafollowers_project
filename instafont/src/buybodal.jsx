import { useState } from "react";
import { criarOrder, criarPreference } from "./api.js";

export default function BuyModal({ isOpen, onClose, pkg, price }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!buyerName || !buyerEmail || !paymentMethod) {
      setStatus("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setStatus("Processando pagamento...");

    try {
      const order = await criarOrder({
        package: pkg,
        price: Number(price),
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        payment_method: paymentMethod,
        link: instagramLink.trim(),
      });

      if (!order?.orderId) {
        throw new Error("Resposta inválida do servidor: orderId ausente");
      }

      setStatus("Redirecionando para o pagamento...");
      await criarPreference(order.orderId);
    } catch (err) {
      console.error("Erro ao processar pedido:", err);
      setStatus(err.message || "Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setBuyerName("");
    setBuyerEmail("");
    setInstagramLink("");
    setPaymentMethod("");
    setStatus("");
    setLoading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {pkg} — R${price}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="@ do Instagram (ex: seu_perfil)"
            value={instagramLink}
            onChange={(e) => setInstagramLink(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Selecione o método</option>
            <option value="pix">Pix</option>
            <option value="card">Cartão</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processando..." : "Finalizar Compra"}
          </button>
        </form>

        {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 text-red-600 font-semibold hover:underline"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

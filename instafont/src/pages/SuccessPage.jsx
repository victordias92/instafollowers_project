import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmarPagamento } from "../api.js";
import PaymentResultLayout from "./PaymentResultLayout.jsx";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState(
    "Recebemos a confirmação do seu pagamento. Em breve iniciaremos a entrega do seu pacote. Você receberá atualizações no e-mail informado na compra."
  );

  useEffect(() => {
    const paymentId =
      searchParams.get("payment_id") ||
      searchParams.get("collection_id") ||
      searchParams.get("paymentId");

    if (!paymentId) return;

    confirmarPagamento(paymentId)
      .then((result) => {
        if (result.api_five_error) {
          setDetail(
            "Pagamento confirmado. Estamos processando a entrega do seu pacote — pode levar alguns minutos."
          );
          console.warn("API Five:", result.api_five_error);
        }
      })
      .catch((err) => {
        console.error("Erro ao confirmar pagamento:", err);
      });
  }, [searchParams]);

  return (
    <PaymentResultLayout
      tone="success"
      icon="✓"
      title="Pagamento efetuado com sucesso!"
      description={detail}
    />
  );
}

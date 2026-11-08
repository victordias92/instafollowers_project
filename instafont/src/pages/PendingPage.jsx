import PaymentResultLayout from "./PaymentResultLayout.jsx";

export default function PendingPage() {
  return (
    <PaymentResultLayout
      tone="pending"
      icon="⏳"
      title="Pagamento pendente"
      description="Seu pagamento ainda está sendo processado. Assim que for confirmado, iniciaremos a entrega automaticamente. Para Pix ou boleto, a confirmação pode levar alguns minutos."
    />
  );
}

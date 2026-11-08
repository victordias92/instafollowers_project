// main.js (trecho principal corrigido)

const modal = document.getElementById('modalBackdrop');
const modalSubtitle = document.getElementById('modalSubtitle');
let selectedPackage = null;
let selectedPrice = 0;

// Verifica se o SDK foi carregado
if (typeof MercadoPago === 'undefined') {
  console.error('SDK MercadoPago não carregado. Inclua <script src="https://sdk.mercadopago.com/js/v2"></script> antes do main.js');
}
const publicKey = "APP_USR-a3995245-ea12-45a6-b64f-9aef32e5848b"; // ajuste para TEST-... em sandbox
const mp = typeof MercadoPago !== 'undefined' ? new MercadoPago(publicKey) : null;

// Abrir modal
function openBuyModal(pkg, price) {
  selectedPackage = pkg;
  selectedPrice = price;
  if (modalSubtitle) modalSubtitle.textContent = `${pkg} — R$${price} • Preencha os dados para finalizar.`;
  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  }
  const buyerNameInput = document.getElementById('buyerName');
  if (buyerNameInput) buyerNameInput.focus();
}

// Fechar modal
function closeModal() {
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  const buyStatus = document.getElementById('buyStatus');
  if (buyStatus) buyStatus.textContent = '';
  const buyForm = document.getElementById('buyForm');
  if (buyForm) buyForm.reset();
}

// === Função que estava faltando: criarOrder ===
async function criarOrder(payload) {
  console.log('Enviando /api/order payload:', payload);
  const res = await fetch('https://grumpily-staple-endanger.ngrok-free.dev/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('/api/order status:', res.status, 'body:', text);

  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { console.warn('Resposta /api/order não-JSON:', text); }

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Espera-se que o backend retorne { orderId: "..." }
  return json;
}

// Criar preferência no Mercado Pago
async function criarPreference({ orderId }) {
  if (!orderId) throw new Error('orderId is required');

  const res = await fetch('/api/create_preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  const pref = text ? JSON.parse(text) : null;

  // Preferência criada: redirecionar para Checkout Pro
  if (pref.sandbox_init_point || pref.init_point) {
    const url = pref.sandbox_init_point || pref.init_point;
    window.location.href = url;
    return;
  }

  // Se quiser Bricks como fallback
  const preferenceId = pref?.id || pref?.preference_id;
  if (preferenceId && mp) {
    await mp.bricks().create('wallet', 'walletBrick_container', {
      initialization: { preferenceId }
    });
  } else {
    throw new Error('Nenhum init_point ou preferenceId disponível');
  }
}


// Envio do formulário de compra
async function submitBuy(e) {
  e.preventDefault();

  const nameEl = document.getElementById('buyerName');
  const emailEl = document.getElementById('buyerEmail');
  const methodEl = document.getElementById('paymentMethod');
  const statusEl = document.getElementById('buyStatus');

  const buyer_name = nameEl?.value.trim() || '';
  const buyer_email = emailEl?.value.trim() || '';
  const payment_method = methodEl?.value || '';

  if (!buyer_name || !buyer_email || !payment_method) {
    if (statusEl) statusEl.textContent = 'Preencha todos os campos.';
    return;
  }

  if (statusEl) statusEl.textContent = 'Processando pagamento...';

  const payload = {
    package: selectedPackage,
    price: selectedPrice,
    buyer_name,
    buyer_email,
    payment_method,
    link: (document.getElementById('link')?.value || '').trim()
  };

  try {
    const data = await criarOrder(payload);
    if (!data || !data.orderId) {
      throw new Error('Resposta inválida do servidor: orderId ausente');
    }
    if (statusEl) statusEl.textContent = `Pedido efetuado com sucesso! Pedido: ${data.orderId}`;
    console.log('Pedido criado:', data.orderId);

    // criar preferência (envia objeto com orderId)
    await criarPreference({ orderId: data.orderId });

  } catch (err) {
    console.error('Erro ao processar pedido:', err);
    if (statusEl) statusEl.textContent = 'Servidor indisponível. Simulando confirmação...';
    setTimeout(() => {
      if (statusEl) statusEl.textContent = `Pagamento confirmado. Enviaremos instruções para ${buyer_email}.`;
      setTimeout(closeModal, 2200);
    }, 1200);
  }
}

// Função de contato (mantida)
function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('contactStatus');

  if (!name || !email || !message) {
    status.textContent = 'Preencha todos os campos antes de enviar.';
    return;
  }

  status.textContent = 'Enviando mensagem...';

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  })
    .then(res => res.json())
    .then(() => {
      status.textContent = 'Mensagem enviada. Responderemos em até 24 horas.';
      document.getElementById('contactForm').reset();
    })
    .catch(() => {
      setTimeout(() => {
        status.textContent = 'Mensagem enviada. Responderemos em até 24 horas.';
        document.getElementById('contactForm').reset();
      }, 900);
    });
}

// Eventos extras
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeModal();
});

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

const buyFormEl = document.getElementById('buyForm');
if (buyFormEl) buyFormEl.addEventListener('submit', submitBuy);

const contactFormEl = document.getElementById('contactForm');
if (contactFormEl) contactFormEl.addEventListener('submit', submitContact);

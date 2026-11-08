import { useState } from "react";
import BuyModal from "./buybodal";






export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ pkg: "", price: "" });

  function openBuyModal(pkg, price) {
    setSelectedPlan({ pkg, price });
    setModalOpen(true);
  }
 
 
  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen">
      {/* Header / Navbar */}
      <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-black tracking-tight text-indigo-600">InstaBoost</div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-indigo-600 transition">Benefícios</a>
            <a href="#depoimentos" className="hover:text-indigo-600 transition">Depoimentos</a>
            <a href="#precos" className="hover:text-indigo-600 transition">Planos</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </nav>
          <a href="#precos" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm">
            Ver Planos
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-4">
            Entrega Rápida e Segura
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Aumente sua autoridade nas redes sociais hoje
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Conquiste mais visibilidade, atraia marcas e passe credibilidade com milhares de novos seguidores reais e ativos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#precos" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5">
              Quero Crescer Agora
            </a>
            <a href="#beneficios" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-base font-bold transition">
              Saiba Mais
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">⚡ Entrega em minutos</div>
            <div className="flex items-center gap-2">🔒 Sem pedir senha</div>
            <div className="flex items-center gap-2">⭐ 4.9/5 Avaliações</div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Por que investir no seu perfil?</h2>
            <p className="mt-4 text-slate-600">Ter um perfil volumoso funciona como prova social, atraindo naturalmente mais clientes orgânicos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🤝</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mais Credibilidade</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Usuários e marcas confiam mais em perfis que já possuem uma base sólida de seguidores.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6">🔒</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Seguro</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Não precisamos da sua senha. Processo seguro através do seu @ de usuário.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-6">♻️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reposição Garantida</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Garantia de reposição automática caso haja quedas na contagem do seu perfil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quem já comprou, aprova!</h2>
            <p className="mt-4 text-slate-600">Veja o resultado de clientes que transformaram a percepção de suas marcas.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "Criei uma loja de roupas e ninguém comprava por falta de confiança. Coloquei o pacote intermediário de seguidores e na mesma semana as vendas começaram a cair."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-slate-700 text-sm">MA</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Mariana Almeida</h4>
                  <p className="text-xs text-slate-500">@use_mariclothes</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "Entrega absurdamente rápida. Fiquei com medo de cair de uma vez, mas já faz 3 semanas e os números continuam estáveis. Excelente atendimento no suporte."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-slate-700 text-sm">RS</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rodrigo Santos</h4>
                  <p className="text-xs text-slate-500">@rodrigo.mkt</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "Como influenciadora de beleza, as marcas nem respondiam meus e-mails. Depois que mudei o patamar do meu perfil com o plano Influenciador, fechei parcerias!"
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-slate-700 text-sm">GC</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Gabriela Costa</h4>
                  <p className="text-xs text-slate-500">@gabicosta_beauty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos de Preço */}
      <section id="precos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Escolha o seu plano ideal</h2>
            <p className="mt-4 text-slate-600">Selecione a quantidade que melhor se adapta ao seu momento.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Plano Iniciante */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Iniciante</h3>
              <p className="text-xs text-slate-500 mt-1">Ideal para novos perfis</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">R$ 19</span>
                <span className="text-sm font-medium text-slate-500">/ único</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2">✔️ <strong>500</strong> Seguidores</li>
                <li className="flex items-center gap-2">✔️ Entrega em até 24h</li>
                <li className="flex items-center gap-2">✔️ Sem queda drástica</li>
              </ul>
              <button
                onClick={() => openBuyModal("Iniciante", 0.10)}
                className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-xl font-bold transition"
              >
                Comprar Agora
              </button>
            </div>

            {/* Plano Intermediário */}
            <div className="bg-indigo-600 p-8 rounded-2xl border-2 border-indigo-600 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                Mais Vendido
              </div>
              <h3 className="text-lg font-bold text-white">Intermediário</h3>
              <p className="text-xs text-indigo-200 mt-1">Melhor custo-benefício</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">R$ 49</span>
                <span className="text-sm font-medium text-indigo-200">/ único</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-indigo-100 border-t border-indigo-500 pt-6">
                <li className="flex items-center gap-2">✔️ <strong>2.000</strong> Seguidores</li>
                <li className="flex items-center gap-2">✔️ Início imediato</li>
                <li className="flex items-center gap-2">✔️ Garantia de Reposição</li>
              </ul>
              <button
                onClick={() => openBuyModal("Intermediário", 49)}
                className="mt-8 w-full bg-white hover:bg-slate-100 text-indigo-600 px-6 py-3 rounded-xl font-bold transition"
              >
                Comprar Agora
              </button>
            </div>

            {/* Plano Avançado */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Influenciador</h3>
              <p className="text-xs text-slate-500 mt-1">Para crescimento massivo</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">R$ 99</span>
                <span className="text-sm font-medium text-slate-500">/ único</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2">✔️ <strong>5.000</strong> Seguidores</li>
                <li className="flex items-center gap-2">✔️ Alta qualidade</li>
                <li className="flex items-center gap-2">✔️ Suporte Exclusivo</li>
              </ul>
              <button
                onClick={() => openBuyModal("Influenciador", 99)}
                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      <BuyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPlan.pkg}
        price={selectedPlan.price}
      />

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-16 text-center">Dúvidas Frequentes</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Vocês precisam da minha senha?</h3>
              <p className="text-slate-600 text-sm">Nunca. Precisamos apenas do seu nome de usuário (@) para realizar o envio com segurança.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-lg font-black text-white mb-2">InstaBoost</div>
          <p className="text-sm">© 2026 InstaBoost. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );}
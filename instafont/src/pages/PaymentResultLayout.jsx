import { Link } from "react-router-dom";

export default function PaymentResultLayout({ icon, title, description, tone = "indigo" }) {
  const tones = {
    success: {
      ring: "bg-emerald-100 text-emerald-600",
      button: "bg-indigo-600 hover:bg-indigo-700",
    },
    pending: {
      ring: "bg-amber-100 text-amber-600",
      button: "bg-indigo-600 hover:bg-indigo-700",
    },
  };

  const styles = tones[tone] || tones.pending;

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="text-xl font-black tracking-tight text-indigo-600">
            InstaBoost
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${styles.ring}`}
          >
            {icon}
          </div>
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">{description}</p>
          <Link
            to="/"
            className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition ${styles.button}`}
          >
            Voltar para Home
          </Link>
        </div>
      </main>
    </div>
  );
}

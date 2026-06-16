import React, { useState } from "react";
import { ArrowRight, LogIn, UserPlus, ShieldAlert, Cpu, Lock, Loader2 } from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onNavigateToDashboard: () => void;
  isLoggedIn: boolean;
  onShowTerms: () => void;
}

export default function LandingPage({
  onLoginClick,
  onRegisterClick,
  onNavigateToDashboard,
  isLoggedIn,
  onShowTerms,
}: LandingPageProps) {
  // Mini administrative login gate states
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Dados administrativos inválidos.");
      }
      // Set admin session state and reload applet directly
      localStorage.setItem("pf_user", JSON.stringify(data.user));
      localStorage.setItem("pf_token", data.token);
      window.location.reload();
    } catch (err: any) {
      setAdminError(err.message || "Credenciais não reconhecidas.");
    } finally {
      setAdminLoading(false);
    }
  };
  return (
    <div className="bg-[#050914] min-h-[calc(100vh-4rem)] flex flex-col justify-between relative overflow-hidden" id="landing-page">
      {/* Abstract light glow background */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Streamlined Access Box */}
      <div className="mx-auto max-w-md px-4 py-16 flex-1 flex flex-col justify-center items-center w-full relative z-10">
        <div className="bg-[#0b1329] border border-blue-900/30 p-8 rounded-3xl shadow-2xl w-full text-center space-y-6">
          
          {/* Platform Icon Symbol */}
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 animate-pulse">
            <Cpu className="h-6 w-6" />
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-black text-white tracking-tight">
              Agelga Mineração
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Plataforma operacional de mineração de hashrate e sorteio da sorte diária em Kwanza (AOA).
            </p>
          </div>

          {/* Principal Forms Action triggers */}
          <div className="pt-2 space-y-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                id="hero-go-dashboard"
              >
                <span>Ir para o Painel do Usuário</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-sm"
                  id="hero-login"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Efetuar Login no Sistema</span>
                </button>

                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-blue-900/40 py-3.5 px-6 rounded-2xl font-bold transition-all cursor-pointer text-sm"
                  id="hero-register"
                >
                  <UserPlus className="h-4 w-4 shrink-0" />
                  <span>Cadastrar Nova Conta de Minerador</span>
                </button>
              </div>
            )}
          </div>

          {/* Secure footnote */}
          <div className="pt-4 border-t border-blue-900/20 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-600" />
            <span>Encriptação SSL de 256 bits Ativa</span>
          </div>
        </div>
      </div>

      {/* Simplified legal regulatory footholds */}
      <footer className="bg-slate-950 text-slate-500 py-6 text-center border-t border-blue-900/10 text-[10px] font-sans">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <span>Agelga Mineração &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdminGate(!showAdminGate)}
              type="button"
              className="text-slate-600 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer font-sans"
            >
              <Lock className="h-3 w-3" />
              <span>Painel de Administração</span>
            </button>
            <button
              onClick={onShowTerms}
              type="button"
              className="text-slate-500 hover:text-amber-400 transition-colors underline decoration-slate-800 underline-offset-4 cursor-pointer font-sans"
            >
              Termos de Uso &amp; Políticas Gerais
            </button>
          </div>
        </div>

        {/* Small Admin Credentials Field Gate */}
        {showAdminGate && (
          <div className="mt-4 mx-auto max-w-xs p-4 bg-[#080f24] border border-blue-900/30 rounded-xl text-left space-y-2.5 animate-fadeIn">
            <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider font-mono">Entrada de Administrador</span>
            {adminError && (
              <p className="text-[9px] text-rose-450 bg-rose-500/10 p-1 px-2 rounded">{adminError}</p>
            )}
            <form onSubmit={handleAdminSubmit} className="space-y-1.5 font-sans">
              <input
                type="email"
                placeholder="E-mail administrador"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-900 border border-blue-900/40 rounded text-[10px] text-white placeholder-slate-600 outline-none focus:border-amber-400"
              />
              <input
                type="password"
                placeholder="Senha"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-900 border border-blue-900/40 rounded text-[10px] text-white placeholder-slate-600 outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                {adminLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-950" /> : <Lock className="h-2.5 w-2.5" />}
                <span>Verificar Código Admin</span>
              </button>
            </form>
          </div>
        )}
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import { User, Mail, Phone, Lock, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "./Toast";

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
  onShowTerms: () => void;
}

export default function RegisterForm({
  onRegisterSuccess,
  onNavigateToLogin,
  onBackToLanding,
  onShowTerms,
}: RegisterFormProps) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validations
    if (!name || !email || !phone || !password || !confirmPassword) {
      const msg = "Todos os campos são de preenchimento obrigatório.";
      setError(msg);
      toast.error(msg, "Campos em Falta");
      return;
    }

    if (password !== confirmPassword) {
      const msg = "As senhas inseridas não coincidem.";
      setError(msg);
      toast.error(msg, "Divergência de Senhas");
      return;
    }

    if (password.length < 5) {
      const msg = "A senha deve conter no mínimo 5 caracteres.";
      setError(msg);
      toast.error(msg, "Senha Curta");
      return;
    }

    if (!agreeTerms) {
      const msg = "Deverá aceitar os Termos de Uso e Política de Privacidade para prosseguir com o cadastro.";
      setError(msg);
      toast.error(msg, "Termos Não Aceites");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Houve uma falha ao realizar o cadastro.");
      }

      toast.success("Conta criada com sucesso! Carregando painel de acesso...", "Cadastro Concluído");
      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess(data.user);
      }, 1500);
    } catch (err: any) {
      const msg = err.message || "E-mail já cadastrado ou erro temporário de rede.";
      setError(msg);
      toast.error(msg, "Erro no Cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50 py-12" id="register-layout">
      <div className="w-full max-w-md bg-white shadow-xl shadow-slate-200/55 rounded-2xl border border-slate-100 overflow-hidden">
        
        {/* Card Header */}
        <div className="px-6 pt-8 pb-4 text-center border-b border-slate-50 relative">
          <button
            onClick={onBackToLanding}
            className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voltar para o início"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h2 className="font-display text-2xl font-bold text-slate-800">Crie sua Conta</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            Inscreva-se em poucos segundos e comece a enviar comprovativos
          </p>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-4 animate-fadeIn" id="register-success">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-850">Cadastro Realizado!</h3>
            <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
              Sua conta foi criada com sucesso. Redirecionando para as credenciais de login...
            </p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-500 mt-4" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" id="form-register">
            {error && (
              <div className="flex items-center space-x-2 bg-rose-50 text-rose-700 p-3 rounded-lg text-xs border border-rose-100 animate-fadeIn font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block pl-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block pl-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block pl-1">Telemóvel / Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+351 912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block pl-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Min. 5 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block pl-1">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Terms of Use & Privacy checkbox */}
            <div className="flex items-start gap-2.5 py-1 text-left">
              <input
                id="agree-terms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-[11px] text-slate-500 cursor-pointer select-none leading-relaxed">
                Eu li e concordo com os{" "}
                <button
                  type="button"
                  onClick={onShowTerms}
                  className="text-amber-500 font-bold hover:underline inline focus:outline-none cursor-pointer"
                >
                  Termos de Uso e Política de Privacidade
                </button>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b1329] text-white hover:bg-blue-950 font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 mt-2 border border-blue-900/30"
              id="btn-register-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registrando conta...</span>
                </>
              ) : (
                <span>Cadastrar</span>
              )}
            </button>
          </form>
        )}

        {/* Back link */}
        <div className="px-6 py-4 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-100">
          Já possui conta cadastrada?{" "}
          <button
            onClick={onNavigateToLogin}
            type="button"
            className="text-amber-500 font-semibold hover:underline"
            id="register-link-login"
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}

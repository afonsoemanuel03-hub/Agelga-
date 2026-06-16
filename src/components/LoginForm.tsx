import React, { useState } from "react";
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, Sparkles, Smartphone, Eye, EyeOff } from "lucide-react";
import { useToast } from "./Toast";

interface LoginFormProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigateToRegister: () => void;
  onBackToLanding: () => void;
}

export default function LoginForm({
  onLoginSuccess,
  onNavigateToRegister,
  onBackToLanding,
}: LoginFormProps) {
  const toast = useToast();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick Login Helpers for testers (admin / test user)
  const handleQuickLogin = async (role: "user" | "admin") => {
    setError("");
    setLoading(true);

    const testEmail = role === "admin" ? "afonsoemanuel03@gmail.com" : "joao@email.com";
    const testPassword = role === "admin" ? "Caminhodobem3" : "user123";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado durante o login.");
      }

      toast.success("Login efetuado com sucesso!", "Sessão Iniciada");
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      const msg = err.message || "Erro de conexão com o servidor.";
      setError(msg);
      toast.error(msg, "Falha no Login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = loginMethod === "phone" ? phone : email;
    if (!identifier || !password) {
      const msg = "Por favor, preencha todos os campos.";
      setError(msg);
      toast.error(msg, "Dados Incompletos");
      return;
    }

    setError("");
    setLoading(true);

    // If phone number does not start with +244, append it for Angola
    let finalPhone = phone;
    if (loginMethod === "phone" && !phone.startsWith("+") && !phone.startsWith("244")) {
      finalPhone = "+244 " + phone;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginMethod === "email" ? email : undefined,
          phone: loginMethod === "phone" ? finalPhone : undefined,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Combinação de dados e senha inválida.");
      }

      toast.success("Login efetuado com sucesso! Bem-vindo.", "Sessão Iniciada");
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      const msg = err.message || "E-mail/Telefone ou senha incorretos.";
      setError(msg);
      toast.error(msg, "Falha na Autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#e6f9ed] via-white to-[#f0fcf4] py-12 font-sans relative overflow-hidden" id="login-layout">
      {/* Decorative ambient bubbles like in screenshots */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-[#00cc66]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#d9f99d]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/60 space-y-6 relative z-10">
        {/* Back and Method Switcher tools */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBackToLanding}
            className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod(loginMethod === "phone" ? "email" : "phone");
              setError("");
            }}
            className="text-[11px] font-bold text-[#00b359] hover:text-[#00cc66] transition-colors py-1 px-3 bg-green-50 rounded-full hover:bg-green-100/60 cursor-pointer"
          >
            {loginMethod === "phone" ? "Aceder com E-mail" : "Aceder com Telemóvel"}
          </button>
        </div>

        {/* Brand Logo & Title with currency union representing dollar and kwanza */}
        <div className="text-center flex flex-col items-center">
          {/* Beautifully styled badge representation grouping Dollar and Kwanza */}
          <div className="mb-4 bg-white/90 p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center space-x-2">
            <div className="flex items-center justify-center h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-xl font-black font-sans leading-none">$</span>
            </div>
            <div className="text-xs font-bold text-slate-350 select-none font-mono">/</div>
            <div className="flex items-center justify-center h-12 w-12 bg-amber-50 text-amber-500 rounded-xl border border-amber-100 shadow-sm">
              <span className="text-sm font-black font-sans leading-none">Kz</span>
            </div>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">Agelga Mining</h2>
          <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block tracking-wider">
            {loginMethod === "phone" ? "Login por Telemóvel" : "Login por E-mail"}
          </span>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs border border-rose-100 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="form-login">
          {/* SMART TOGGLED INPUT : PHONE OR EMAIL */}
          {loginMethod === "phone" ? (
            <div className="space-y-1.5">
              <div className="relative flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-[#00cc66]/20 focus-within:border-[#00cc66] rounded-full p-1 pl-4.5 pr-2 shadow-sm transition-all h-13">
                <span className="text-slate-400 mr-2 flex items-center">
                  <Smartphone className="h-5 w-5" />
                </span>
                <span className="text-slate-800 font-extrabold text-sm border-r border-slate-200 pr-3 mr-3 shrink-0">
                  +244
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Número de telefone celular"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  disabled={loading}
                  className="w-full h-full text-slate-800 text-sm focus:outline-none bg-transparent"
                  id="login-phone-input"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-[#00cc66]/20 focus-within:border-[#00cc66] rounded-full p-1 pl-4.5 pr-2 shadow-sm transition-all h-13">
                <span className="text-slate-400 mr-3 flex items-center">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="E-mail registado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full h-full text-slate-800 text-sm focus:outline-none bg-transparent"
                  id="login-email-input"
                />
              </div>
            </div>
          )}

          {/* PASSWORD FIELD WITH HIDE/SHOW ADORNMENT */}
          <div className="space-y-1.5">
            <div className="relative flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-[#00cc66]/20 focus-within:border-[#00cc66] rounded-full p-1 pl-4.5 pr-3 shadow-sm transition-all h-13">
              <span className="text-slate-400 mr-3 flex items-center">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-full text-slate-800 text-sm focus:outline-none bg-transparent"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Forgot password option aligned right exactly as screenshot */}
          <div className="text-right pr-2">
            <button
              type="button"
              onClick={() => toast.info("Para recuperar o acesso, envie uma mensagem ao nosso suporte administrativo no Telegrama.", "Recuperação de Senha")}
              className="text-xs font-bold text-[#00b359] hover:underline"
              id="login-forgot-password"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Large green Enter button representing screenshot */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00cc66] text-white font-extrabold py-3.5 rounded-full shadow-md shadow-green-500/10 hover:shadow-green-500/20 hover:bg-[#00b359] transition-all flex items-center justify-center space-x-2 h-12 cursor-pointer mt-4"
            id="btn-login-submit"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        {/* Redirect options visually centered representing the screenshot */}
        <div className="text-center pt-2">
          <button
            onClick={onNavigateToRegister}
            type="button"
            className="text-sm font-semibold text-[#00b359] hover:text-[#00cc66] hover:underline transition-colors cursor-pointer"
            id="login-link-register"
          >
            Cadastro
          </button>
        </div>

      </div>
    </div>
  );
}

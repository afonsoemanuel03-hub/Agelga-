import { LogOut, User as UserIcon, ShieldAlert, CreditCard, LayoutDashboard, Copy, Check, Coins } from "lucide-react";
import { User } from "../types";
import { useState } from "react";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Header({ user, onLogout, currentView, onNavigate }: HeaderProps) {
  const [copied, setCopied] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm" id="main-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Title */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => onNavigate("home")}
            id="logo-button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/10 transition-transform group-hover:scale-105">
              <Coins className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-800">
                Agelga<span className="text-amber-500"> Mining</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Mineração &amp; Sorteios</p>
            </div>
          </div>

          {/* Quick Credential Banner (Header Left Accessories) */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-slate-500">
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="font-medium mr-1.5 text-slate-700">IBAN:</span>
              <span className="text-slate-600">0040 ... 101 49</span>
              <button 
                onClick={() => handleCopy("0040 0000 11629140101 49", "iban")}
                className="ml-2 text-amber-500 hover:text-amber-600 font-sans"
              >
                {copied === "iban" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="font-medium text-amber-500 mr-1.5">USDT:</span>
              <span className="text-slate-600">TMWd ... Q7oUh</span>
              <button 
                onClick={() => handleCopy("TMWdkLjJsN3eJwNuv95Bd8u512jVDQ7oUh", "usdt")}
                className="ml-2 text-amber-500 hover:text-amber-600 font-sans"
              >
                {copied === "usdt" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Navigation & Session options */}
          <div className="flex items-center space-x-3" id="nav-actions">
            {user ? (
              <>
                {/* Dashboard Options */}
                {user.role === "admin" ? (
                  <button
                    onClick={() => onNavigate("admin")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === "admin"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                    id="nav-admin-dashboard"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Painel Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate("dashboard")}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === "dashboard"
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                    id="nav-user-dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Área do Cliente</span>
                  </button>
                )}

                {/* Profile Detail */}
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-mono leading-none py-0.5 px-1.5 font-bold rounded bg-slate-100 text-slate-600 uppercase">
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </span>
                </div>

                {/* Separator */}
                <span className="h-6 w-px bg-slate-200/80"></span>

                {/* Log Out Button */}
                <button
                  onClick={onLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-100"
                  title="Sair da Conta"
                  id="btn-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("login")}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === "login"
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  id="nav-goto-login"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="bg-[#0b1329] text-white hover:bg-blue-950 transition-colors px-3.5 py-2 rounded-lg text-sm font-medium border border-blue-900/30"
                  id="nav-goto-register"
                >
                  Cadastrar-se
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

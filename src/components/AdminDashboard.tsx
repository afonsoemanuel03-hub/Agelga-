import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  Calendar,
  Eye,
  MessageSquare,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  Mail,
  Phone,
  Ticket,
  Trophy,
  Gift,
  Award,
  Plus,
  CreditCard,
} from "lucide-react";
import { User, Payment, AdminStats, Raffle, Withdrawal } from "../types";
import { useToast } from "./Toast";

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const { success, error, info, warning } = useToast();

  // Array lists
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Sorteios Admin States
  const [activeTab, setActiveTab] = useState<"comprovativos" | "sorteios" | "saques">("comprovativos");
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [raffleLoading, setRaffleLoading] = useState(false);
  const [drawingId, setDrawingId] = useState<string | null>(null);

  // Withdrawal Admin States
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawResponseNote, setWithdrawResponseNote] = useState("");
  const [withdrawActionLoading, setWithdrawActionLoading] = useState(false);
  
  // New Raffle Form States
  const [newTitle, setNewTitle] = useState("");
  const [newPrize, setNewPrize] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDrawDate, setNewDrawDate] = useState("");
  const [raffleFormLoading, setRaffleFormLoading] = useState(false);
  const [raffleMessage, setRaffleMessage] = useState("");

  // Status and filter flags
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Todos" | "Pendente" | "Aprovado" | "Rejeitado">("Todos");

  // Audit interactive fields
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [adminResponseNote, setAdminResponseNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Dev state
  const [resetting, setResetting] = useState(false);

  // Fetch administrator records
  const fetchAdminData = async () => {
    try {
      const pRes = await fetch("/api/admin/payments", {
        headers: { Authorization: token },
      });
      const uRes = await fetch("/api/admin/users", {
        headers: { Authorization: token },
      });

      if (pRes.ok && uRes.ok) {
        const pData = await pRes.json();
        const uData = await uRes.json();

        setPayments(pData.payments || []);
        setUsers(uData.users || []);
        setStats(uData.stats || null);
      }
    } catch (err) {
      console.error("Error reading admin directories", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRaffles = async () => {
    try {
      setRaffleLoading(true);
      const response = await fetch("/api/raffles", {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setRaffles(data.raffles || []);
      }
    } catch (err) {
      console.error("Error fetching admin raffles", err);
    } finally {
      setRaffleLoading(false);
    }
  };

  const fetchAdminWithdrawals = async () => {
    try {
      setWithdrawLoading(true);
      const response = await fetch("/api/admin/withdrawals", {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error("Error fetching admin withdrawals", err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleWithdrawEvaluate = async (withdrawId: string, targetStatus: "Aprovado" | "Rejeitado") => {
    setWithdrawActionLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          status: targetStatus,
          adminNotes: withdrawResponseNote.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Houve uma falha ao processar o saque.");
      }

      success(`Solicitação de saque ${targetStatus.toLowerCase()} com sucesso!`, "Saque Homologado");
      setWithdrawResponseNote("");
      setSelectedWithdrawal(null);
      await fetchAdminWithdrawals();
    } catch (err: any) {
      error(err.message || "Erro desconhecido.", "Falha no Saque");
    } finally {
      setWithdrawActionLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchRaffles();
    fetchAdminWithdrawals();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
    fetchRaffles();
    fetchAdminWithdrawals();
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrize || !newDesc || !newDrawDate) return;

    try {
      setRaffleFormLoading(true);
      setRaffleMessage("");
      const response = await fetch("/api/admin/raffles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: newTitle,
          prize: newPrize,
          description: newDesc,
          drawDate: new Date(newDrawDate).toISOString(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRaffles(data.raffles || []);
        setNewTitle("");
        setNewPrize("");
        setNewDesc("");
        setNewDrawDate("");
        const msg = "Sorteio cadastrado de forma bem-sucedida!";
        setRaffleMessage(msg);
        success(msg, "Sorteio Criado");
        setTimeout(() => setRaffleMessage(""), 4000);
      } else {
        const errMsg = `Erro: ${data.error}`;
        setRaffleMessage(errMsg);
        error(data.error || "Erro ao criar sorteio.", "Falha de Cadastro");
      }
    } catch (err: any) {
      const connectMsg = "Módulo de conexão falhou.";
      setRaffleMessage(connectMsg);
      error(connectMsg, "Erro de Conexão");
    } finally {
      setRaffleFormLoading(false);
    }
  };

  const handleDrawRaffle = async (raffleId: string) => {
    try {
      setDrawingId(raffleId);
      // Give it a real suspenseful simulated loading time (1.8 seconds) for maximum visual satisfaction of draw result!
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const response = await fetch(`/api/admin/raffles/${raffleId}/draw`, {
        method: "POST",
        headers: { Authorization: token },
      });

      const data = await response.json();
      if (response.ok) {
        setRaffles(data.raffles || []);
        success("O sorteio foi realizado com sucesso! O vencedor eletrónico foi definido aleatoriamente pelas hashes homologadas.", "Sorteio Concluído");
      } else {
        const errMsg = data.error || "Erro ao realizar o sorteio.";
        error(errMsg, "Falha no Sorteio");
      }
    } catch (err) {
      console.error("Error drawing raffle", err);
      error("Falha ao comunicar com o servidor de sorteio.", "Erro de Sorteio");
    } finally {
      setDrawingId(null);
    }
  };

  // Submit Audit Evaluation (Approve or Reject)
  const handleEvaluate = async (paymentId: string, targetStatus: "Aprovado" | "Rejeitado") => {
    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          status: targetStatus,
          adminNotes: adminResponseNote.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Houve uma falha ao atualizar o status do item.");
      }

      // Sync and reload lists
      const successMsg = `Comprovativo ${targetStatus.toLowerCase()} com sucesso!`;
      setActionMessage(successMsg);
      success(successMsg, "Homologação Concluída");
      setAdminResponseNote("");
      setSelectedPayment(null);
      await fetchAdminData();
    } catch (err: any) {
      const errMsg = err.message || "Erro desconhecido";
      setActionMessage(`Erro: ${errMsg}`);
      error(errMsg, "Falha na Homologação");
    } finally {
      setActionLoading(false);
    }
  };

  // Database developer reset flow
  const handleResetDatabase = async () => {
    if (!window.confirm("Atenção: Tem certeza de que deseja reiniciar o banco de dados? Todos os novos registros e comprovativos carregados serão removidos e restaurados aos valores padrão de simulação.")) {
      return;
    }
    setResetting(true);
    try {
      const r = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { Authorization: token },
      });
      if (r.ok) {
        success("Banco de dados reiniciado aos parâmetros originais de simulação!", "Reset Concluído");
        await fetchAdminData();
      } else {
        error("Erro ao reiniciar o banco de dados.", "Operação Falhou");
      }
    } catch (err) {
      console.error("Error resetting database", err);
      error("Módulo de sincronização falhou.", "Erro de Sincronização");
    } finally {
      setResetting(false);
    }
  };

  // List search & tab filtration computation
  const filteredPayments = payments.filter((p) => {
    // Search matching
    const matchesSearch =
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.amount.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filtration matching
    if (activeFilter === "Todos") return matchesSearch;
    return p.status === activeFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans" id="admin-portal">
      {/* Header Info Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="h-3 w-3" />
            <span>Sessão de Auditor Administrativo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">Painel Executivo de Comprovativos</h2>
          <p className="text-slate-500 text-xs mt-1">
            Plataforma centralizada de processamento fiduciário IBAN e Tether TRC20 para regulação de balanço.
          </p>
        </div>

        {/* Header Action controls */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sincronizar Dados</span>
          </button>
          
          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="flex items-center bg-rose-50 border border-rose-100 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
            id="btn-re-seed-db"
          >
            {resetting ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <AlertTriangle className="h-3 w-3 mr-1.5 text-rose-600" />
            )}
            <span>Reiniciar Banco de Dados</span>
          </button>
        </div>
      </div>

      {/* Statistics board widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="admin-stats-cards">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold tracking-wider">Usuários Registrados</span>
              <span className="text-lg font-bold text-slate-800 block mt-0.5">{stats.totalUsers}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold tracking-wider">Envios Recebidos</span>
              <span className="text-lg font-bold text-slate-800 block mt-0.5">{stats.totalPayments}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold tracking-wider font-semibold text-amber-600">Pendentes de Validação</span>
              <span className="text-lg font-bold text-amber-600 block mt-0.5">{stats.pendingPayments}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[9px] block uppercase font-bold tracking-wider text-amber-600">Volume Homologado</span>
              <span className="text-sm font-bold text-amber-650 block mt-1 truncate">
                {parseFloat(stats.approvedVolume).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tab Switching Navigation Menu */}
      <div className="flex border-b border-slate-200 mb-6 gap-2" id="admin-main-tabs">
        <button
          onClick={() => setActiveTab("comprovativos")}
          className={`pb-3 px-5 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "comprovativos"
              ? "border-amber-500 text-amber-700 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Clock className="h-4 w-4" />
          Comprovativos Bancários ({stats?.pendingPayments ?? 0} pendentes)
        </button>
        <button
          onClick={() => {
            setActiveTab("sorteios");
            fetchRaffles();
          }}
          className={`pb-3 px-5 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "sorteios"
              ? "border-amber-500 text-amber-700 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Ticket className="h-4 w-4" />
          Painel de Sorteios Agelga ({raffles.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("saques");
            fetchAdminWithdrawals();
          }}
          className={`pb-3 px-5 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "saques"
              ? "border-amber-500 text-amber-700 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Solicitações de Saque ({withdrawals.filter((w) => w.status === "Pendente").length} pendentes)
        </button>
      </div>

      {activeTab === "comprovativos" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="admin-ledger-table-section">
        
        {/* Navigation ledgers toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Search container */}
          <div className="relative w-full md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Filtrar por nome, email ou valor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0" id="filter-tabs">
            {(["Todos", "Pendente", "Aprovado", "Rejeitado"] as const).map((tab) => {
              const active = activeFilter === tab;
              const tabStyles = {
                Todos: "hover:bg-slate-200/60 text-slate-600 border-slate-200",
                Pendente: active 
                  ? "bg-amber-100/90 text-amber-800 border-amber-200 font-bold" 
                  : "hover:bg-amber-50 text-amber-600 border-slate-200",
                Aprovado: active 
                  ? "bg-emerald-100/90 text-emerald-800 border-emerald-250 font-bold" 
                  : "hover:bg-emerald-50 text-emerald-600 border-slate-200",
                Rejeitado: active 
                  ? "bg-rose-100/90 text-rose-800 border-rose-250 font-bold" 
                  : "hover:bg-rose-50 text-rose-600 border-slate-200",
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    active && tab === "Todos"
                      ? "bg-slate-800 text-white border-slate-800"
                      : active
                      ? ""
                      : "bg-white text-slate-500 shrink-0"
                  } ${tabStyles[tab]}`}
                >
                  {tab === "Todos" ? "Ver Todos" : tab}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dynamic content area */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="text-xs text-slate-400 font-medium">Buscando cadastros de transações...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-24 text-center px-4" id="ledger-empty">
            <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhum comprovativo encontrado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Não existem registros que coincidam com o termo procurado ou os filtros selecionados no momento.
            </p>
          </div>
        ) : (
          /* Table ledger layout */
          <div className="overflow-x-auto" id="admin-table">
            <table className="w-full text-slate-600 text-left border-collapse text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider font-bold text-slate-400 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Comprovante / Recibo</th>
                  <th className="py-3 px-4">Remetente / Usuário</th>
                  <th className="py-3 px-4">Valor Declarado</th>
                  <th className="py-3 px-4">Via de Destino</th>
                  <th className="py-3 px-4">Data do Envio</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPayments.map((p) => {
                  const statusConfig = {
                    Pendente: { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400", label: "Pendente" },
                    Aprovado: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", label: "Aprovado" },
                    Rejeitado: { bg: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500", label: "Rejeitado" },
                  }[p.status];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                      {/* Image Thumbnail Preview column */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setFullscreenImageUrl(p.imageUrl)}
                          className="h-12 w-20 rounded border border-slate-200 bg-slate-50/80 shadow-sm shrink-0 overflow-hidden relative flex items-center justify-center cursor-zoom-in group"
                          title="Clique para ver em tela cheia"
                        >
                          <img
                            src={p.imageUrl}
                            alt="Receipt Graphic"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Sender details column */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-800">{p.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5" title="E-mail">
                          <Mail className="h-2.5 w-2.5" />
                          {p.userEmail}
                        </div>
                      </td>

                      {/* Declared sum column */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {parseFloat(p.amount).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                      </td>

                      {/* Asset pathway column */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className="bg-slate-100 border border-slate-150 rounded text-[9px] font-mono py-0.5 px-1.5 text-slate-600 uppercase">
                          {p.currency}
                        </span>
                      </td>

                      {/* Submission timestamp column */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div>{new Date(p.timestamp).toLocaleDateString("pt-PT")}</div>
                        <div className="text-[9px] mt-0.5">{new Date(p.timestamp).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>

                      {/* Current resolution badge column */}
                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusConfig.bg}`}>
                          <span className={`h-1 w-1 rounded-full ${statusConfig.dot}`} />
                          <span>{statusConfig.label}</span>
                        </div>
                        {p.adminNotes && (
                          <div className="text-[9px] text-slate-400 italic block mt-1 truncate max-w-[150px]">
                            Obs: "{p.adminNotes}"
                          </div>
                        )}
                      </td>

                      {/* Trigger Actions Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="py-1 px-3 border border-slate-200 hover:border-emerald-500 rounded bg-white hover:bg-emerald-50/10 hover:text-emerald-700 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {p.status === "Pendente" ? "Auditar / Julgar" : "Ver Detalhes"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      ) : (
        /* ADEMIN RAFFLE CENTER MANAGEMENT MODULE */
        <div className="space-y-8 animate-fadeIn animate-duration-300" id="admin-sorteios-screen">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create new Sorteio container - 4 cols */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-amber-500" />
                  Cadastrar Sorteio da Sorte
                </h3>

                {raffleMessage && (
                  <div className="p-3 rounded-xl text-xs font-semibold mb-4 bg-amber-50 border border-amber-150 text-amber-800">
                    {raffleMessage}
                  </div>
                )}

                <form onSubmit={handleCreateRaffle} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Título do Sorteio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sorteio Mega-Investidor Junho"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-550/10 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Prémio de Premiação</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 500.000,00 AOA de Bónus Mineiro"
                      value={newPrize}
                      onChange={(e) => setNewPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-550/10 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Data Limite / Sorteio</label>
                    <input
                      type="date"
                      required
                      value={newDrawDate}
                      onChange={(e) => setNewDrawDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-550/10 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Descrição / Termos Especiais</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Indique como adquirir bilhetes (ex: cada depósito de 100.000,00 AOA aprovado gera um bilhete eletrônico automático)."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-550/10 focus:border-amber-500 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={raffleFormLoading}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {raffleFormLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Cadastrando...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 text-amber-400" />
                        <span>Criar Sorteio Oficial</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* List and drawing manager - 8 cols */}
            <div className="lg:col-span-12 xl:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                  <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Sorteios Ativos & Finalizados ({raffles.length})
                  </h3>
                  <button
                    onClick={fetchRaffles}
                    disabled={raffleLoading}
                    className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-105 hover:border-slate-200 rounded-lg transition-all"
                  >
                    <RefreshCw className={`h-4 w-4 ${raffleLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {raffleLoading && raffles.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                    <p className="text-xs text-slate-400">Carregando sorteios ativos...</p>
                  </div>
                ) : raffles.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-150 rounded-2xl">
                    <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Nenhum sorteio cadastrado no banco.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Utilize o formulário ao lado para cadastrar o primeiro sorteio.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {raffles.map((raffle) => {
                      const isActive = raffle.status === "active";
                      const isDrawing = drawingId === raffle.id;

                      return (
                        <div key={raffle.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-150 text-slate-600"
                              }`}>
                                {isActive ? "Ativo" : "Finalizado"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: #{raffle.id}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 font-display">{raffle.title}</h4>
                            <p className="text-xs text-slate-500 max-w-xl">{raffle.description}</p>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-450 pt-1">
                              <span>Prémio: <b className="text-amber-800 font-display">{raffle.prize}</b></span>
                              <span>Data limite: <b>{new Date(raffle.drawDate).toLocaleDateString("pt-PT")}</b></span>
                              <span>Participantes: <b>{raffle.participantsCount} investidores</b></span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center">
                            {isActive ? (
                              <button
                                onClick={() => handleDrawRaffle(raffle.id)}
                                disabled={isDrawing || raffle.participantsCount === 0 || drawingId !== null}
                                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 hover:text-white text-amber-955 transition-all text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isDrawing ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-900" />
                                    <span>Sorteando com semente...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Realizar Sorteio Automático</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl min-w-[180px] text-xs">
                                <div className="text-[9px] text-slate-400 block uppercase font-bold font-mono">Ganhador Oficial</div>
                                <div className="font-bold text-slate-800 truncate font-display mb-1">{raffle.winnerUserName}</div>
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-slate-400">Bilhete:</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                                    {raffle.winnerTicketNumber}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "saques" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-2" id="admin-withdrawals-ledger-section">
          {/* Withdrawals Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Filtrar saques por nome, email ou IBAN/Carteira..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
              {(["Todos", "Pendente", "Aprovado", "Rejeitado"] as const).map((tab) => {
                const active = activeFilter === tab;
                const tabStyles = {
                  Todos: "hover:bg-slate-200/60 text-slate-600 border-slate-200",
                  Pendente: active
                    ? "bg-amber-100/90 text-amber-800 border-amber-200 font-bold"
                    : "hover:bg-amber-50 text-amber-600 border-slate-200",
                  Aprovado: active
                    ? "bg-emerald-100/90 text-emerald-800 border-emerald-250 font-bold"
                    : "hover:bg-emerald-50 text-emerald-600 border-slate-200",
                  Rejeitado: active
                    ? "bg-rose-100/90 text-rose-800 border-rose-250 font-bold"
                    : "hover:bg-rose-50 text-rose-600 border-slate-200",
                };

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      active && tab === "Todos"
                        ? "bg-slate-800 text-white border-slate-800"
                        : active
                        ? ""
                        : "bg-white text-slate-500 shrink-0"
                    } ${tabStyles[tab]}`}
                  >
                    {tab === "Todos" ? "Ver Todos" : tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table List / Empty View */}
          {withdrawLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="text-xs text-slate-400 font-medium">Sincronizando livro de retiradas...</span>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-24 text-center px-4">
              <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Nenhuma solicitação de saque no momento</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                As retiradas solicitadas por investidores angolanos aparecerão estruturadas nesta zona para auditoria imediata.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-slate-600 text-left border-collapse text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider font-bold text-slate-400 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">ID de Saque</th>
                    <th className="py-3 px-4">Usuário / Solicitante</th>
                    <th className="py-3 px-4">Valor Requirido</th>
                    <th className="py-3 px-4">Canal / Categoria</th>
                    <th className="py-3 px-4">Destino (IBAN / Carteira)</th>
                    <th className="py-3 px-4">Data do Pedido</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {withdrawals
                    .filter((w) => {
                      const matchesSearch =
                        w.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.destination.toLowerCase().includes(searchQuery.toLowerCase());
                      if (activeFilter === "Todos") return matchesSearch;
                      return w.status === activeFilter && matchesSearch;
                    })
                    .map((w) => {
                      const statusConfig = {
                        Pendente: { bg: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400", label: "Pendente" },
                        Aprovado: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", label: "Aprovado" },
                        Rejeitado: { bg: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500", label: "Rejeitado" },
                      }[w.status];

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/50 transition-all font-sans">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                            #{w.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-slate-800 block">{w.userName}</span>
                              <span className="text-slate-400 text-[10px] block">{w.userEmail}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {parseFloat(w.amount).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] border border-blue-150 font-mono">
                              {w.currency}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] font-medium text-slate-600 max-w-[180px] truncate" title={w.destination}>
                            {w.destination}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-450 text-[10px]">
                            {new Date(w.timestamp).toLocaleString("pt-PT")}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusConfig.bg}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(w);
                                setWithdrawResponseNote(w.adminNotes || "");
                              }}
                              className="bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Avaliar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL & ACTIVE PANEL: RESOLUTION AND COMMENTS */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPayment(null)}
          id="admin-evaluate-modal"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual preview box (Left half on desktop) */}
            <div className="bg-slate-950 p-4 md:w-1/2 flex flex-col justify-between select-none border-r border-slate-100">
              <div className="flex items-center justify-between text-white/50 text-[10px] font-mono uppercase pb-2 border-b border-white/5 mb-3">
                <span>Comprovativo Anexado</span>
                <span>Zoom Seguro</span>
              </div>
              
              <div 
                className="flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-black/10 shadow-inner h-64 md:h-auto max-h-[400px] cursor-zoom-in hover:brightness-110 transition-all"
                onClick={() => setFullscreenImageUrl(selectedPayment.imageUrl)}
                title="Clique para ver em tela cheia"
              >
                <img
                  src={selectedPayment.imageUrl}
                  alt="Receipt Preview Zoom"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="text-white/60 text-[9px] font-mono text-center pt-3 border-t border-white/5 mt-3">
                Identificador: {selectedPayment.id}
              </div>
            </div>

            {/* Resolution form box (Right half) */}
            <div className="p-6 md:w-1/2 flex flex-col justify-between text-left">
              {/* Header metadata details */}
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h4 className="font-display font-extrabold text-slate-800 text-sm">Auditoria de Recibo</h4>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">Submetido por: <b>{selectedPayment.userName}</b></p>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="p-1 rounded bg-slate-150 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Sender card and contact details */}
                <div className="space-y-4 font-sans text-xs">
                  {/* Sender statistics summary list */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                    <div>
                      <span className="block font-sans font-semibold text-slate-400 text-[8px] uppercase">E-mail cadastrado</span>
                      <span className="text-slate-700 truncate block font-sans">{selectedPayment.userEmail}</span>
                    </div>
                    <div>
                      <span className="block font-sans font-semibold text-slate-400 text-[8px] uppercase">Montante do Depósito</span>
                      <span className="text-slate-800 font-bold block">
                        {parseFloat(selectedPayment.amount).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-slate-250/20 pt-1.5 mt-1">
                      <span className="block font-sans font-semibold text-slate-400 text-[8px] uppercase">Notas de Remissão</span>
                      <span className="text-slate-600 leading-normal block italic font-sans font-normal">
                        "{selectedPayment.notes || "Não foram inseridas notas extras pelo usuário."}"
                      </span>
                    </div>
                  </div>

                  {/* Admin feedback input */}
                  {selectedPayment.status === "Pendente" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block pl-0.5">Nota de Auditoria Administrativa</label>
                      <textarea
                        placeholder="Informe detalhes de compensação, conta de recepção ou motivo em caso de rejeição..."
                        rows={3}
                        value={adminResponseNote}
                        onChange={(e) => setAdminResponseNote(e.target.value)}
                        disabled={actionLoading}
                        className="w-full border border-slate-250 p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                      ></textarea>
                    </div>
                  ) : (
                    /* Processed banner */
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col space-y-2 text-[11px]">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {selectedPayment.status === "Aprovado" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                        <span className={selectedPayment.status === "Aprovado" ? "text-emerald-800" : "text-rose-800"}>
                          Operação {selectedPayment.status}
                        </span>
                      </div>
                      <p className="text-slate-500 italic block leading-relaxed pl-1">
                        <b>Justificativa:</b> "{selectedPayment.adminNotes || "Nenhum comentário administrativo foi anotado."}"
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono block text-right">
                        Data: {new Date(selectedPayment.processedAt).toLocaleString("pt-PT")}
                      </span>
                    </div>
                  )}

                  {actionMessage && (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-center text-xs animate-fadeIn font-semibold font-mono">
                      {actionMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Action layout buttons */}
              <div className="pt-6 border-t border-slate-100 mt-6 shrink-0 flex items-center justify-end gap-2">
                {selectedPayment.status === "Pendente" ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleEvaluate(selectedPayment.id, "Rejeitado")}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rejeitar</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleEvaluate(selectedPayment.id, "Aprovado")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-lg shadow-emerald-500/15 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Aprovar Comprovante</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPayment(null)}
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 py-2 px-4 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Voltar para o Painel
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX VISUALIZATION FOR PROOF IMAGES */}
      {fullscreenImageUrl && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4 transition-all"
          onClick={() => setFullscreenImageUrl(null)}
          id="fullscreen-lightbox"
        >
          {/* Close button & top bar */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
            <button
              onClick={() => setFullscreenImageUrl(null)}
              className="p-2.5 rounded-full bg-slate-900/80 text-white/80 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
              title="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Fullscreen interactive image display */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImageUrl}
              alt="Fullscreen Receipt Document"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 scale-95 animate-scaleUp cursor-zoom-out"
              onClick={() => setFullscreenImageUrl(null)}
            />
          </div>

          <p className="mt-4 text-xs font-mono text-slate-400 select-none">
            Clique em qualquer lugar para fechar a visualização em tela cheia
          </p>
        </div>
      )}

    </div>
  );
}

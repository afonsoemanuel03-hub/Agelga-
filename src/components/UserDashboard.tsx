import React, { useState, useEffect, useMemo } from "react";
import {
  Coins,
  Landmark,
  Copy,
  Check,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  AlertCircle,
  Calendar,
  X,
  CreditCard,
  Loader2,
  HelpCircle,
  Ticket,
  Trophy,
  Gift,
  Sparkles,
  Award,
  Home,
  Users,
  Cpu,
  User as UserIcon,
  Play,
  Square,
  Activity,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  Flame,
  Volume2,
  Tv,
  Lock,
} from "lucide-react";
import { User, Payment, Raffle, Withdrawal } from "../types";
import MiningYieldDashboard from "./MiningYieldDashboard";
import { useToast } from "./Toast";

export interface Investment {
  id: string;
  productId: string;
  productName: string;
  price: number;
  dailyIncome: number;
  duration: number;
  remainingDays: number;
  purchaseDate: string;
  status: "Ativo" | "Concluído";
}

interface UserDashboardProps {
  user: User;
  token: string;
}

export default function UserDashboard({ user, token }: UserDashboardProps) {
  const { success, error, info, warning } = useToast();

  // Static lists & data coordinates
  const IBAN_VALUE = "0040 0000 11629140101 49";
  const USDT_VALUE = "TMWdkLjJsN3eJwNuv95Bd8u512jVDQ7oUh";

  // Navigation states: "inicio" | "mineracao" | "sorteios" | "equipa" | "financas" | "meu"
  const [activeSection, setActiveSection] = useState<
    "inicio" | "mineracao" | "sorteios" | "equipa" | "financas" | "meu"
  >("inicio");

  // Core database lists
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Raffles state
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [raffleLoading, setRaffleLoading] = useState(false);
  const [enteringRaffleId, setEnteringRaffleId] = useState<string | null>(null);
  const [enteredRaffles, setEnteredRaffles] = useState<Record<string, boolean>>({});

  // Submission Form States (Finanças Tab)
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"AOA (IBAN)" | "USDT (TRC20)">("AOA (IBAN)");
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal overlays
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showMinerModal, setShowMinerModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // --- MINING PATTERNS ENGINE (Exact Mock/Live simulation matching the screenshot) ---
  const [miningActive, setMiningActive] = useState<boolean>(() => {
    return localStorage.getItem(`pf_mining_active_${user.email}`) === "true";
  });

  const [miningBalance, setMiningBalance] = useState<number>(() => {
    return parseFloat(localStorage.getItem(`pf_mined_balance_${user.email}`) || "0");
  });

  const [wheelBonus, setWheelBonus] = useState<number>(() => {
    return parseFloat(localStorage.getItem(`pf_wheel_bonus_${user.email}`) || "0");
  });

  const [spinCount, setSpinCount] = useState<number>(() => {
    return parseInt(localStorage.getItem(`pf_spin_count_${user.email}`) || "0");
  });

  // Share & Earn bonus state
  const [shareBonus, setShareBonus] = useState<number>(() => {
    return parseFloat(localStorage.getItem(`pf_share_bonus_${user.email}`) || "0");
  });

  // Daily spin tracking date
  const [lastSpinDate, setLastSpinDate] = useState<string>(() => {
    return localStorage.getItem(`pf_last_spin_date_${user.email}`) || "";
  });

  // Withdraw & Finance tab state
  const [financeTab, setFinanceTab] = useState<"deposito" | "saque">("deposito");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState<"AOA (IBAN)" | "USDT (TRC20)">("AOA (IBAN)");
  const [withdrawDestination, setWithdrawDestination] = useState("");
  const [withdrawSubmitLoading, setWithdrawSubmitLoading] = useState(false);
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState("");
  const [withdrawSuccessMessage, setWithdrawSuccessMessage] = useState("");

  // Mini administrative login gate states in dashboard
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
      localStorage.setItem("pf_user", JSON.stringify(data.user));
      localStorage.setItem("pf_token", data.token);
      window.location.reload();
    } catch (err: any) {
      setAdminError(err.message || "Credenciais não reconhecidas.");
    } finally {
      setAdminLoading(false);
    }
  };

  // Luck Spinner Minigame States
  const [gameIsSpinning, setGameIsSpinning] = useState(false);
  const [gameResultTitle, setGameResultTitle] = useState("");
  const [gameValueWon, setGameValueWon] = useState(0);

  // Simple Returns Calculator States
  const [calcAmount, setCalcAmount] = useState<number>(150000);
  const [calcPlan, setCalcPlan] = useState<"bronze" | "prata" | "ouro">("bronze");
  const [calcCompounding, setCalcCompounding] = useState<boolean>(true);
  const [calcDurationDays, setCalcDurationDays] = useState<number>(30);

  // New Fundo Mensal / Renda Diária / Meus Contratos panel states
  const [activeSubSection, setActiveSubSection] = useState<"fundo_mensal" | "renda_diaria" | "meus_contratos">("fundo_mensal");
  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const stored = localStorage.getItem(`pf_investments_${user.email}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch payments on mount
  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/user/payments", {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Error fetching payments", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch raffles list
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
      console.error("Error fetching raffles", err);
    } finally {
      setRaffleLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch("/api/user/withdrawals", {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error("Error fetching withdrawals", err);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawErrorMessage("");
    setWithdrawSuccessMessage("");

    const parsedAmount = parseFloat(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWithdrawErrorMessage("Por favor, insira um valor válido de saque.");
      return;
    }

    const availableWithdrawBalance = miningBalance + wheelBonus + shareBonus;
    if (parsedAmount > availableWithdrawBalance) {
      setWithdrawErrorMessage(`Saldo de lucros insuficiente para efetuar o saque. Seu saldo de retirada disponível atual é de ${availableWithdrawBalance.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}.`);
      return;
    }

    if (!withdrawDestination.trim()) {
      setWithdrawErrorMessage("Por favor, preencha a conta de destino (IBAN ou Carteira USDT) para o envio de fundos.");
      return;
    }

    try {
      setWithdrawSubmitLoading(true);
      const response = await fetch("/api/user/withdrawals/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency: withdrawCurrency,
          destination: withdrawDestination.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Houve um erro inesperado ao solicitar o saque.");
      }

      // Deduct immediately for highest fidelity mock experience
      if (parsedAmount <= wheelBonus) {
        setWheelBonus((prev) => {
          const nextVal = Math.max(0, prev - parsedAmount);
          localStorage.setItem(`pf_wheel_bonus_${user.email}`, nextVal.toFixed(2));
          return nextVal;
        });
      } else {
        const remainder = parsedAmount - wheelBonus;
        setWheelBonus(0);
        localStorage.setItem(`pf_wheel_bonus_${user.email}`, "0.00");
        setMiningBalance((prev) => {
          const nextVal = Math.max(0, prev - remainder);
          localStorage.setItem(`pf_mined_balance_${user.email}`, nextVal.toFixed(4));
          return nextVal;
        });
      }

      setWithdrawSuccessMessage(`Parabéns! Sua solicitação de saque de ${parsedAmount.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })} foi submetida com sucesso para avaliação!`);
      success("Sua solicitação de saque foi registrada no livro administrativo.", "Saque Registado com Sucesso!");
      setWithdrawAmount("");
      setWithdrawDestination("");
      await fetchWithdrawals();
    } catch (err: any) {
      setWithdrawErrorMessage(err.message || "Falha técnica ao submeter o pedido.");
      error(err.message || "Erro no Saque", "Erro de Submissão");
    } finally {
      setWithdrawSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchRaffles();
    fetchWithdrawals();
  }, [token]);

  // Approved deposit balance
  const approvedVolume = useMemo(() => {
    return payments
      .filter((p) => p.status === "Aprovado")
      .reduce((acc, p) => acc + parseFloat(p.amount), 0);
  }, [payments]);

  // Live Decimals Yield Counter Engine
  useEffect(() => {
    let interval: any = null;
    if (miningActive) {
      interval = setInterval(() => {
        // Base baseline hashrate yields 0.65 AOA per second
        // Additional 1.5% daily hashrate increment based on approved deposited volume
        const baseRate = 0.65;
        const depositRate = (approvedVolume * 0.015) / 86400; // 1.5% daily yield rate translated to seconds
        
        // Sum yields of active stable product investments
        const activeInvestmentsYield = investments
          .filter((inv) => inv.status === "Ativo")
          .reduce((acc, inv) => acc + inv.dailyIncome, 0) / 86400;

        const secondsYield = baseRate + depositRate + activeInvestmentsYield;

        setMiningBalance((prev) => {
          const nextVal = prev + secondsYield;
          localStorage.setItem(`pf_mined_balance_${user.email}`, nextVal.toFixed(4));
          return nextVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [miningActive, approvedVolume, investments]);

  // Start/Stop machine handler
  const toggleMiningSequence = () => {
    if (approvedVolume === 0) {
      warning("É necessário que o seu primeiro faturamento / depósito seja aprovado para ativar a sua máquina de mineração real.", "Ativação Bloqueada");
      return;
    }
    const nextState = !miningActive;
    setMiningActive(nextState);
    localStorage.setItem(`pf_mining_active_${user.email}`, nextState ? "true" : "false");
  };

  // Generate sweepstakes digital tickets code automatically (1 ticket per 100,000.00 AOA approved)
  const myTickets = useMemo(() => {
    const approved = payments.filter((p) => p.status === "Aprovado");
    const ticketsList: { code: string; paymentId: string; amount: number; date: string }[] = [];

    approved.forEach((p) => {
      const val = parseFloat(p.amount);
      const count = Math.floor(val / 100000);
      for (let i = 0; i < count; i++) {
        const hashPart = p.id.substring(2).toUpperCase();
        ticketsList.push({
          code: `AG-${hashPart}-${2400 + i + Math.floor(val % 73)}`,
          paymentId: p.id,
          amount: val,
          date: p.processedAt || p.timestamp,
        });
      }
    });
    return ticketsList;
  }, [payments]);

  // Subscribe user's tickets to active raffles
  const handleEnterRaffleSilently = (raffleId: string) => {
    setEnteringRaffleId(raffleId);
    setTimeout(() => {
      setEnteredRaffles((prev) => ({ ...prev, [raffleId]: true }));
      setEnteringRaffleId(null);
      success("Seus bilhetes foram vinculados com sucesso a este sorteio!", "Inscrição Concluída");
    }, 1200);
  };

  // Click Copy Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    success(`${label.toUpperCase()} copiado com sucesso para a área de transferência!`, "Copiado");
    setTimeout(() => setCopiedText(""), 2200);
  };

  // Convert files binary to base64 preview
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione apenas arquivos de imagem (JPEG, PNG, etc).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("O tamanho da imagem excede o limite de 10 MB.");
      return;
    }
    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMessage("Falha ao ler o arquivo de imagem.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit payment form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const msg = "Por favor, insira um valor de depósito numérico válido.";
      setErrorMessage(msg);
      error(msg, "Dados de Envio Inválidos");
      return;
    }

    if (!imagePreview) {
      const msg = "Anexar o comprovativo gráfico (captura ou foto) é obrigatório.";
      setErrorMessage(msg);
      error(msg, "Comprovativo em Falta");
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await fetch("/api/user/payments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          amount: parseFloat(amount).toFixed(2),
          currency,
          notes: notes.trim(),
          imageUrl: imagePreview,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Algo falhou durante o envio.");
      }

      const successMsg = "Comprovativo de faturação enviado com sucesso! Aguarde homologação.";
      setSuccessMessage(successMsg);
      success(successMsg, "Comprovativo Enviado");
      setAmount("");
      setNotes("");
      setImagePreview(null);
      fetchPayments();
    } catch (err: any) {
      const errMsg = err.message || "Erro na conexão com o servidor.";
      setErrorMessage(errMsg);
      error(errMsg, "Erro de Envio");
    } finally {
      setSubmitLoading(false);
    }
  };

  const clearFile = () => {
    setImagePreview(null);
    setErrorMessage("");
  };

  // Jogo Online Lucky Spin Wheel trigger
  const spinLuckyWheel = () => {
    if (gameIsSpinning) return;

    // Check daily limit ("por dia só gira uma vez")
    const todayStr = new Date().toISOString().split("T")[0];
    const prevSpinDate = localStorage.getItem(`pf_last_spin_date_${user.email}`) || "";
    if (prevSpinDate === todayStr) {
      warning("Você já utilizou o seu giro diário hoje! Volte amanhã para girar a roleta da sorte novamente.", "Apenas 1 Giro por Dia");
      return;
    }

    setGameIsSpinning(true);
    setGameResultTitle("");
    setGameValueWon(0);

    // Dynamic roulette suspence interval (2.4 seconds spin animation)
    setTimeout(() => {
      // Outocmes arrays representing fun Angolan kwanza prizes with percentage gains
      const prizes = [
        { title: "+15% de Rendimento ⚙️", value: 1500 },
        { title: "+30% de Rendimento 💎", value: 3000 },
        { title: "+50% de Rendimento ⚡", value: 5000 },
        { title: "+100% de Rendimento 🌟", value: 10000 },
        { title: "+150% de Rendimento 🚀", value: 15000 },
        { title: "+200% de Rendimento 👑", value: 20000 },
      ];

      const chosen = prizes[Math.floor(Math.random() * prizes.length)];
      
      setWheelBonus((prev) => {
        const nextVal = prev + chosen.value;
        localStorage.setItem(`pf_wheel_bonus_${user.email}`, nextVal.toFixed(2));
        return nextVal;
      });

      setSpinCount((prev) => {
        const nextCount = prev + 1;
        localStorage.setItem(`pf_spin_count_${user.email}`, nextCount.toString());
        return nextCount;
      });

      // Save today's date as the last spin date
      localStorage.setItem(`pf_last_spin_date_${user.email}`, todayStr);
      setLastSpinDate(todayStr);

      setGameResultTitle(chosen.title);
      setGameValueWon(chosen.value);
      setGameIsSpinning(false);
      success(`Parabéns! Ganhou um ganho percentual de ${chosen.title} equivalente a ${chosen.value.toLocaleString("pt-AO")} AOA!`, "Prémio Ganho!");
    }, 2400);
  };

  // Cryptocurrecny markets ticker rows
  const cryptoMarkets = useMemo(() => {
    return [
      { name: "Bitcoin", symbol: "BTC", priceAOA: 63840000, change: "+3.84%", icon: "₿", isUp: true },
      { name: "Ethereum", symbol: "ETH", priceAOA: 2470000, change: "+1.92%", icon: "Ξ", isUp: true },
      { name: "Tether USD", symbol: "USDT", priceAOA: 850, change: "0.00%", icon: "₮", isUp: false },
      { name: "Tron RX", symbol: "TRX", priceAOA: 112, change: "+5.16%", icon: "▼", isUp: true },
      { name: "Solana", symbol: "SOL", priceAOA: 118400, change: "-2.10%", icon: "S", isUp: false },
    ];
  }, []);

  // Derived state for investments
  const totalInvestedSum = useMemo(() => {
    return investments.reduce((acc, inv) => acc + inv.price, 0);
  }, [investments]);

  const availableDepositBalance = useMemo(() => {
    return Math.max(0, approvedVolume - totalInvestedSum);
  }, [approvedVolume, totalInvestedSum]);

  const handleInvestInProduct = (product: {
    id: string;
    name: string;
    price: number;
    dailyIncome: number;
    duration: number;
  }) => {
    if (availableDepositBalance < product.price) {
      warning(
        `Saldo insuficiente para investir neste produto. O preço é de ${product.price.toLocaleString("pt-AO")} AOA, mas você tem apenas ${availableDepositBalance.toLocaleString("pt-AO")} AOA de saldo disponível na Carteira de Depósito. Por favor, faça um depósito de ativação.`,
        "Saldo Insuficiente"
      );
      // Automatically redirect to Financas tab to submit proof
      setActiveSection("financas");
      return;
    }

    // Process new investment
    const newInv: Investment = {
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      dailyIncome: product.dailyIncome,
      duration: product.duration,
      remainingDays: product.duration,
      purchaseDate: new Date().toISOString(),
      status: "Ativo",
    };

    const nextInvestments = [...investments, newInv];
    setInvestments(nextInvestments);
    localStorage.setItem(`pf_investments_${user.email}`, JSON.stringify(nextInvestments));

    success(
      `O seu investimento de ${product.price.toLocaleString("pt-AO")} AOA no "${product.name}" foi ativado com sucesso! As taxas de rendimento foram adicionadas à sua máquina de mineração em tempo real.`,
      "Investimento Ativo"
    );
  };

  // Global counts for UI
  const stats = {
    total: payments.length,
    approved: payments.filter((p) => p.status === "Aprovado").length,
    pending: payments.filter((p) => p.status === "Pendente").length,
    rejected: payments.filter((p) => p.status === "Rejeitado").length,
    totalVolume: approvedVolume,
  };

  // Live combined calculation
  const totalAssetsValue = stats.totalVolume + miningBalance + wheelBonus + shareBonus;

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between"
      id="user-dashboard-wrapper"
    >
      {/* HEADER SECTION LOGO + BALANCES VIEW (Direct match to screenshot visual blueprint) */}
      <div className="mx-auto max-w-7xl w-full px-4 pt-6 pb-2" id="dashboard-header-block">
        <div className="bg-[#0b1329] border border-blue-900/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-blue-950/50">
          {/* Subtle cosmic glow in the corner represent mine tunnels */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left side info block */}
            <div className="md:col-span-8 flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-lg shadow-amber-500/10">
                <Coins className="h-7 w-7 animate-pulse text-slate-950" />
              </div>
              
              <div className="space-y-1.5 w-full">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-white tracking-wide">Agelga Mining</span>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono font-bold border border-amber-400/20 uppercase tracking-tight">Active Node</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">Ativos totais</span>
                    <span className="text-2xl sm:text-3xl font-mono text-white tracking-tight font-extrabold flex items-baseline gap-1 select-all">
                      AOA {totalAssetsValue.toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">Minerador</span>
                    <span className="text-2xl sm:text-3xl font-mono text-amber-400 tracking-tight font-bold block">
                      {miningActive ? "1 Active GPU" : "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side floating computer rig model graphic representation with animated rotation vectors */}
            <div className="hidden md:flex md:col-span-4 justify-end items-center relative pr-4">
              <div className="relative group p-4 border border-blue-900/50 bg-[#070d1e]/80 rounded-2xl w-44 hover:border-amber-400/40 transition-color">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Hash Monitor</span>
                </div>
                <div className="h-16 flex items-center justify-center gap-1.5 font-mono text-xs text-white">
                  <Cpu className={`h-11 w-11 ${miningActive ? "animate-spin text-amber-400" : "text-slate-500"}`} />
                  <span className="text-xs font-bold font-mono">
                    {miningActive ? "28.5 TH/S" : "OFFLINE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WARNING NOTIFICATION BAR WITH "INICIAR" TOGGLE BUTTON (Direct screenshot layout matching) */}
      <div className="mx-auto max-w-7xl w-full px-4 py-2" id="mining-warning-control">
        <div className="bg-[#121b33] border border-blue-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${miningActive ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
              {miningActive ? <Flame className="h-5 w-5 animate-pulse" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white font-sans leading-tight">
                {miningActive ? "Sua máquina de mineração está ativada!" : "Você tem 0 máquina de mineração ativa."}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Certifique-se de iniciá-la diariamente ou você poderá interromper o acúmulo temporário de novos ganhos mineráveis.
              </p>
            </div>
          </div>

          <button
            onClick={toggleMiningSequence}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shrink-0 shadow-lg cursor-pointer transition-all ${
              miningActive
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/15"
                : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-extrabold shadow-amber-500/10"
            }`}
          >
            {miningActive ? "Interromper" : "Iniciar"}
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENT SPEECH MARQUEE BAR */}
      <div className="mx-auto max-w-7xl w-full px-4 py-1" id="scrolling-announcement">
        <div className="bg-[#0b1329]/50 border border-blue-950 rounded-xl px-4 py-2 flex items-center gap-2 overflow-hidden">
          <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="text-xs font-semibold text-slate-350 overflow-hidden relative w-full h-4">
            <div className="absolute whitespace-nowrap animate-marquee left-0 transform">
              🎉 Bem-vindo ao Agelga Gold Mining! A maior plataforma de mineração digital de Angola. Conclua depósitos a partir de 100.000,00 AOA para receber automaticamente bilhetes semanais eletrónicos e concorrer em sorteios semanais.
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW: SOBRE NÓS, JOGO ONLINE, TELEGRAMA (Circular icons row layout) */}
      <div className="mx-auto max-w-7xl w-full px-4 py-4" id="circular-action-row">
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* About us action button */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="bg-[#0b1329]/80 border border-blue-900/30 hover:border-amber-400/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#101936] transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-blue-900/40 text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-250 font-display">Sobre Nós</span>
          </button>

          {/* Online Roulette luck game button */}
          <button
            onClick={() => setShowGameModal(true)}
            className="bg-[#0b1329]/80 border border-blue-900/30 hover:border-amber-400/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#101936] transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative">
              <span className="absolute -top-1.5 -right-1.5 h-4 px-1 rounded-full bg-red-500 font-mono text-[8px] text-white flex items-center justify-center font-bold">
                PROMO
              </span>
              <Gift className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-250 font-display">Jogo Online 🎟️</span>
          </button>

          {/* Telegram support simulation button */}
          <button
            onClick={() => setShowTelegramModal(true)}
            className="bg-[#0b1329]/80 border border-blue-900/30 hover:border-amber-400/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#101936] transition-all cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-5 w-5 text-sky-400" />
            </div>
            <span className="text-xs font-bold text-slate-250 font-display">Telegrama</span>
          </button>
        </div>
      </div>

      {/* DECORATIVE/FESTIVE COUNTDOWN EVENT BANNER (Exact visual screenshot match banner) */}
      <div className="mx-auto max-w-7xl w-full px-4 py-2" id="event-carousel-banner">
        <div className="bg-gradient-to-r from-teal-980 via-[#0a233b] to-indigo-980 border border-amber-500/25 rounded-2xl p-6 relative overflow-hidden shadow-lg h-44 flex items-center">
          {/* Decorative design graphic overlay mimics screenshot Christmas/NewYear clock gold elements */}
          <div className="absolute right-6 inset-y-0 flex items-center justify-center pointer-events-none opacity-20 md:opacity-50">
            <svg width="150" height="150" viewBox="0 0 100 100" className="text-amber-400">
              {/* Gold luxury clock rings representing 2026/Mining countdown */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3By" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="50" y1="50" x2="70" y2="45" stroke="currentColor" strokeWidth="2" />
              <text x="32" y="54" className="text-[7px] font-mono fill-current font-bold">AGELGA</text>
            </svg>
          </div>

          <div className="relative z-10 space-y-2 max-w-sm">
            <span className="bg-amber-400 text-slate-900 text-[8px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">
              TEMPORADA AGELGA 2026
            </span>
            <h3 className="text-lg md:text-xl font-bold font-display leading-tight text-white">
              Sorteio Extraordinário Premium
            </h3>
            <p className="text-xs text-slate-300">
              Todos os depósitos homologados administrativamente acima de 100.000,00 AOA geram faturas e bilhetes digitais automáticos que figuram no sorteio da sorte.
            </p>
            
            {/* Carousel dots indicator */}
            <div className="flex gap-1.5 pt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* CORE WEB VIEWS CONTAINER (Unified central section renderer) */}
      <div className="mx-auto max-w-7xl w-full px-4 py-6 flex-1 pb-24" id="central-modules-board">
        {/* VIEW 1: INÍCIO (SCREENSHOT HOME TABS) */}
        {activeSection === "inicio" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* TOP HEADER: MEU MINERADOR PANEL */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/25 rounded-2xl p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Cpu className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider font-mono">Status da Máquina</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display text-base font-extrabold text-white">Meu Minerador :</span>
                    <span className="font-mono text-base font-extrabold text-[#00cc66]">
                      {1 + investments.filter(inv => inv.status === "Ativo").length}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowMinerModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-950/20 text-white font-extrabold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                type="button"
                id="view-miner-details"
              >
                <span>Ver</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* BALANCE BOXES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carteira de Depósito Box */}
              <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/15 transition-all">
                <div className="flex items-center gap-2 text-slate-405 text-xs font-semibold">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Carteira de Depósito</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-mono text-white tracking-tight font-extrabold select-all truncate">
                    AOA {availableDepositBalance.toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-505 font-mono font-medium shrink-0">Balanço Ativo</span>
                </div>
              </div>

              {/* Carteira de Retirada Box */}
              <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/15 transition-all">
                <div className="flex items-center gap-2 text-slate-405 text-xs font-semibold">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Carteira de Retirada</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-mono text-cyan-400 tracking-tight font-bold select-all truncate">
                    AOA {(miningBalance + wheelBonus + shareBonus).toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-505 font-mono font-medium shrink-0">Lucro de Hashrate</span>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR: FUNDO MENSAL vs RENDA DIÁRIA vs MEUS CONTRATOS */}
            <div className="border-b border-blue-900/20 pb-0 flex items-center gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveSubSection("fundo_mensal")}
                className={`pb-3 text-sm font-bold tracking-wide relative cursor-pointer font-display transition-colors whitespace-nowrap ${
                  activeSubSection === "fundo_mensal" ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-white"
                }`}
                type="button"
              >
                <span>Fundo mensal</span>
                {activeSubSection === "fundo_mensal" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => setActiveSubSection("renda_diaria")}
                className={`pb-3 text-sm font-bold tracking-wide relative cursor-pointer font-display transition-colors whitespace-nowrap ${
                  activeSubSection === "renda_diaria" ? "text-amber-400 font-extrabold" : "text-slate-400 hover:text-white"
                }`}
                type="button"
              >
                <span>Renda diária</span>
                {activeSubSection === "renda_diaria" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveSubSection("meus_contratos")}
                className={`pb-3 text-sm font-bold tracking-wide relative cursor-pointer font-display transition-colors whitespace-nowrap ${
                  activeSubSection === "meus_contratos" ? "text-sky-400 font-extrabold" : "text-slate-400 hover:text-white"
                }`}
                type="button"
              >
                <span>Meus Contratos ({investments.length})</span>
                {activeSubSection === "meus_contratos" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENTS RENDER PANEL */}
            {activeSubSection === "fundo_mensal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { id: "prod_1", name: "Estável Nível 1", price: 5000, dailyIncome: 474, totalIncome: 45000, duration: 95, maxShares: 1 },
                  { id: "prod_2", name: "Estável Nível 2", price: 10000, dailyIncome: 947, totalIncome: 90000, duration: 95, maxShares: 1 },
                  { id: "prod_3", name: "Estável Nível 3", price: 15000, dailyIncome: 1421, totalIncome: 135000, duration: 95, maxShares: 1 },
                  { id: "prod_4", name: "Estável Nível 4", price: 20000, dailyIncome: 1895, totalIncome: 180000, duration: 95, maxShares: 1 },
                  { id: "prod_5", name: "Estável Nível 5", price: 25000, dailyIncome: 2368, totalIncome: 225000, duration: 95, maxShares: 1 },
                  { id: "prod_6", name: "Estável Nível 6", price: 30000, dailyIncome: 2842, totalIncome: 270000, duration: 95, maxShares: 1 },
                  { id: "prod_7", name: "Estável Nível 7", price: 35000, dailyIncome: 3316, totalIncome: 315000, duration: 95, maxShares: 1 },
                  { id: "prod_8", name: "Estável Nível 8", price: 40000, dailyIncome: 3789, totalIncome: 360000, duration: 95, maxShares: 1 },
                  { id: "prod_9", name: "Estável Nível 9", price: 45000, dailyIncome: 4263, totalIncome: 405000, duration: 95, maxShares: 1 },
                  { id: "prod_10", name: "Estável Nível 10", price: 50000, dailyIncome: 4737, totalIncome: 450000, duration: 95, maxShares: 1 },
                ].map((p, idx) => {
                  return (
                    <div
                      key={p.id}
                      className="bg-[#0b1329] border border-blue-900/30 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between transform hover:-translate-y-0.5 transition-all hover:border-blue-900/60"
                    >
                      {/* Upper block with Coin illustration and Stats Grid */}
                      <div className="p-4 flex gap-4">
                        {/* Stylized high-fidelity Orange Bitcoin circle matching description and screenshot */}
                        <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 font-extrabold text-2xl shadow-md border-2 border-slate-950/40 relative">
                          <span className="text-white text-lg font-bold font-mono">₿</span>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 text-left font-sans">
                          <div className="col-span-2">
                            <span className="text-[11px] font-bold text-white block truncate">{p.name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Ganho Diário</span>
                            <span className="font-mono text-xs font-bold text-white block">
                              {p.dailyIncome.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0, maximumFractionDigits: 0 })}/dia
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Retorno</span>
                            <span className="font-mono text-xs font-bold text-white block/inline">
                              95 dias
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Ganho Médio</span>
                            <span className="font-mono text-xs font-bold text-[#00cc66] block">
                              {p.totalIncome.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Part. Máxima</span>
                            <span className="font-mono text-xs font-bold text-slate-400 block">
                              {p.maxShares} parte
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom bar with Price and green pill Investir button */}
                      <div className="bg-slate-950/50 p-3 px-4 border-t border-blue-900/10 flex items-center justify-between gap-3">
                        <div className="text-left w-2/3">
                          <span className="text-[8px] font-bold text-slate-500 block uppercase font-mono leading-none">Preço de Investimento</span>
                          <span className="text-[#00cc66] font-mono text-base font-extrabold block mt-0.5 truncate">
                            {p.price.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleInvestInProduct(p)}
                          className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-950/10 text-white font-extrabold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          type="button"
                        >
                          <span>Investir</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeSubSection === "renda_diaria" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-90">
                {[
                  { price: 5000, dailyIncome: 15000 },
                  { price: 8000, dailyIncome: 24000 },
                  { price: 12000, dailyIncome: 36000 },
                  { price: 15000, dailyIncome: 45000 },
                  { price: 20000, dailyIncome: 60000 },
                  { price: 35000, dailyIncome: 105000 },
                  { price: 45000, dailyIncome: 135000 },
                ].map((p, idx) => {
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between relative filter grayscale"
                    >
                      {/* Grayscale indicator banner overlays */}
                      <div className="absolute top-2 right-2 z-10 bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[9px] font-mono font-bold uppercase py-0.5 px-2.5 rounded-full select-none">
                        Indisponível (Esgotado)
                      </div>

                      <div className="p-4 flex gap-4">
                        <div className="h-14 w-14 shrink-0 rounded-full bg-slate-805 text-slate-600 flex items-center justify-center text-xl font-bold border border-slate-700/50">
                          🛡️
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-y-2 flex-1 text-left font-sans">
                          <div className="col-span-2">
                            <span className="text-[11px] font-bold text-slate-400 block truncate">Renda Diária N{idx + 1}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-semibold text-slate-500 block uppercase tracking-wider">Investimento</span>
                            <span className="font-mono text-xs font-bold text-slate-400 block">
                              {p.price.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-semibold text-slate-500 block uppercase tracking-wider">Renda Diária</span>
                            <span className="font-mono text-xs font-bold text-slate-400 block">
                              {p.dailyIncome.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom bar with Price and disabled button */}
                      <div className="bg-slate-950/20 p-3 px-4 border-t border-slate-800/10 flex items-center justify-between gap-3">
                        <div className="text-left w-2/3">
                          <span className="text-[8px] font-medium text-slate-600 block uppercase font-mono">Retorno Diário</span>
                          <span className="text-slate-500 font-mono text-sm font-bold block mt-0.5">
                            Indisponível
                          </span>
                        </div>
                        <button
                          disabled
                          className="bg-slate-800 text-slate-500 font-bold text-xs py-2 px-4 rounded-xl cursor-not-allowed shrink-0"
                          type="button"
                        >
                          Esgotado
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeSubSection === "meus_contratos" && (
              <div className="space-y-4">
                {investments.length === 0 ? (
                  <div className="bg-[#0b1329] rounded-2xl p-12 text-center border border-dashed border-blue-900/20 max-w-xl mx-auto space-y-3">
                    <Activity className="h-8 w-8 text-slate-500 mx-auto opacity-30 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-white text-xs leading-none">Nenhum contrato ativo</h4>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
                        Você ainda não possui nenhum produto estável contratado ou em processamento de hashrate. Adquira um plano na seção "Fundo mensal"!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {investments.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-slate-950/40 border border-blue-900/15 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-900/30 transition-all font-sans text-left"
                      >
                        <div className="flex justify-between items-start pb-2 border-b border-blue-900/10 mb-3">
                          <div>
                            <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                              {inv.status}
                            </span>
                            <span className="text-xs font-bold text-white block mt-1">{inv.productName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">ID: #{inv.id}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-[8.5px] text-slate-500 block uppercase font-mono">Preço Investido</span>
                            <span className="font-mono text-xs text-white block font-bold">
                              {inv.price.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-500 block uppercase font-mono">Retorno Diário</span>
                            <span className="font-mono text-xs text-[#00cc66] block font-bold">
                              {inv.dailyIncome.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-500 block uppercase font-mono">Dias Restantes</span>
                            <span className="font-mono text-xs text-white block font-bold">
                              {inv.remainingDays} / {inv.duration} d
                            </span>
                          </div>
                        </div>

                        <div className="text-[8.5px] text-slate-500 font-mono mt-3 pt-2 border-t border-blue-900/5 text-right">
                          Iniciado em: {new Date(inv.purchaseDate).toLocaleDateString("pt-AO")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cryptocurrency rates list bento block */}
            <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-blue-900/30 mb-4">
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#00cc66] animate-pulse" />
                  Mercados De Criptomoedas
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Quotes em AOA</span>
              </div>

              <div className="divide-y divide-blue-900/30">
                {cryptoMarkets.map((coin, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-900/20 text-[#00cc66] flex items-center justify-center font-bold text-sm font-mono border border-blue-900/50">
                        {coin.icon}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">{coin.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{coin.symbol} / AOA</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold block text-white">
                        {coin.priceAOA.toLocaleString("pt-AO")} AOA
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded inline-block ${
                          coin.isUp ? "bg-emerald-500/10 text-[#00cc66]" : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {coin.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro-guide card */}
            <div className="bg-gradient-to-r from-[#0b1329] to-[#040817] border border-blue-900/30 rounded-2xl p-5 flex items-start gap-3">
              <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block">Central de Operações Digitais</span>
                <p className="text-[11px] text-slate-400 leading-normal mt-1">
                  Seja bem-vindo ao portal de faturamento transparente Agelga. Utilize o menu abaixo na barra inferior para realizar depósitos, ver o andamento da sua mineração, participar dos sorteio ou conferir sua equipa de comissões.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: MINERAÇÃO PLAN CALCULATORS */}
        {activeSection === "mineracao" && (
          <div className="space-y-6 animate-fadeIn">
            {approvedVolume === 0 ? (
              <div className="bg-[#0b1329] rounded-2xl p-6 border border-blue-900/40 text-center max-w-2xl mx-auto space-y-6 shadow-xl py-10 animate-fadeIn" id="mineracao-locked">
                <div className="relative inline-flex items-center justify-center p-4 bg-amber-500/10 text-amber-400 rounded-full animate-pulse border border-amber-500/20 shadow-lg">
                  <ShieldAlert className="h-10 w-10 text-amber-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white">Mineração Digital Bloqueada</h3>
                  <p className="text-xs text-slate-350 max-w-md mx-auto leading-relaxed font-sans">
                    A ativação do console de mineração e a projeção de contratos de poder de hash (Hashrate) de alto rendimento estão disponíveis exclusivamente após a realização do seu primeiro investimento.
                  </p>
                </div>

                {/* Display coordinates directly in the view exactly as requested by user */}
                <div className="bg-[#070d1e] border border-blue-950 rounded-2xl p-5 text-left space-y-4">
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block border-b border-blue-950 pb-2 font-mono">
                    Dados de Pagamento de Ativação do Sistema
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* IBAN */}
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-blue-900/15 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="font-bold text-xs text-white block">Transferência de IBAN (Kwanza - AOA)</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Transferência interbancária em Angola</span>
                      </div>
                      <div className="bg-[#050914] px-3 py-2 rounded-lg border border-blue-900/30 flex items-center justify-between font-mono text-[10.5px]">
                        <span className="text-slate-350 font-bold select-all truncate">{IBAN_VALUE}</span>
                        <button
                          onClick={() => handleCopy(IBAN_VALUE, "iban-lock")}
                          className="text-amber-400 hover:text-amber-500 shrink-0 ml-1.5 cursor-pointer"
                          type="button"
                        >
                          {copiedText === "iban-lock" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* USDT (TRC20) */}
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-blue-900/15 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="font-bold text-xs text-white block">Carteira USDT (TRC20 Blockchain)</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Rede Tron (TRC20) apenas</span>
                      </div>
                      <div className="bg-[#050914] px-3 py-2 rounded-lg border border-blue-900/30 flex items-center justify-between font-mono text-[10.5px]">
                        <span className="text-slate-350 font-bold select-all truncate">{USDT_VALUE}</span>
                        <button
                          onClick={() => handleCopy(USDT_VALUE, "usdt-lock")}
                          className="text-amber-400 hover:text-amber-500 shrink-0 ml-1.5 cursor-pointer"
                          type="button"
                        >
                          {copiedText === "usdt-lock" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status display if they already submitted but pending */}
                {payments.some(p => p.status === "Pendente") ? (
                  <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 rounded-xl text-xs font-medium max-w-md mx-auto leading-normal font-sans">
                    🕒 <b>Comprovativo em Análise:</b> O seu comprovativo de depósito foi enviado com sucesso e está em análise pela equipa administrativa. Assim que for homologado pela administração, esta seção de mineração e faturamento será desbloqueada automaticamente.
                  </div>
                ) : null}

                {/* Active trigger to financas tab to upload proof */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      // Switch content tab directly
                      setActiveSection("financas");
                      // Scroll smoothly to form setup
                      setTimeout(() => {
                        const formEl = document.getElementById("finance-tab-screen");
                        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                      }, 150);
                    }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold py-3 px-8 rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all cursor-pointer inline-flex items-center gap-2"
                    type="button"
                  >
                    <span>Submeter Comprovativo de Depósito</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-1.5 bg-amber-400/10 text-amber-450 border border-amber-400/20 rounded-xl flex items-center justify-center gap-2 text-xs">
                  <Sparkles className="h-4 w-4 animate-bounce shrink-0" />
                  <span>Insira um capital abaixo para simular os rendimentos diários e compostos.</span>
                </div>
                {/* Interactive MiningYieldDashboard */}
                <MiningYieldDashboard
                  onSelectPlanAmount={(amt, note) => {
                    setAmount(amt.toString());
                    setNotes(note);
                    // Move users to financas view automatically so they can see copy coordinates!
                    setActiveSection("financas");
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW 3: SORTEIOS MODULE */}
        {activeSection === "sorteios" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0b1329] border border-blue-900/40 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="bg-amber-400/10 text-amber-455 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-amber-400/20 inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Sorteio Transparente Auditado
                  </span>
                  <h3 className="text-lg font-bold text-white font-display">Os Seus Bilhetes Digitais</h3>
                  <p className="text-slate-400 text-xs max-w-lg leading-normal">
                    Adquira bilhetes da sorte automáticos! A cada <b className="text-white">100.000,00 AOA</b> de capital depositado e aprovado pela administração, você ganha 1 Bilhete Digital exclusivo.
                  </p>
                </div>

                <div className="bg-slate-900/90 rounded-2xl p-4 border border-blue-900/40 min-w-[200px] text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1.5">
                    <Ticket className="h-4.5 w-4.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Seu faturamento em bilhetes</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {myTickets.length} <span className="text-xs font-normal text-slate-400">ativos</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Volume aprovado: {stats.totalVolume.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sweepstakes List (col-8) */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-4">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5 mb-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-400" />
                  Sorteios Disponíveis ({raffles.length})
                </h3>

                {raffleLoading ? (
                  <div className="bg-[#0b1329] rounded-2xl p-12 text-center border border-blue-900/20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
                    <p className="text-xs text-slate-400">Consultando sorteios oficiais...</p>
                  </div>
                ) : raffles.length === 0 ? (
                  <div className="bg-[#0b1329] rounded-2xl p-12 text-center border border-dashed border-blue-900/20">
                    <Trophy className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-300">Nenhum sorteio registrado na administração.</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Novos sorteios periódicos são criados pela administração da comissão. Fique atento às nossas comunicações no painel principal!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {raffles.map((raffle) => {
                      const isActive = raffle.status === "active";
                      const isEntered = enteredRaffles[raffle.id];

                      return (
                        <div
                          key={raffle.id}
                          className={`bg-[#0b1329] rounded-2xl border p-5 flex flex-col justify-between h-full transition-all ${
                            isActive
                              ? "border-blue-900/30 hover:border-amber-400/30"
                              : "border-blue-950 bg-slate-900/50 opacity-80"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <span
                                className={`text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                                  isActive
                                    ? "bg-amber-400/10 text-amber-400 border border-amber-400/25"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {isActive ? "● Disponível" : "Encerrado"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: #{raffle.id}</span>
                            </div>

                            <h4 className="font-bold text-white font-display text-sm leading-snug">
                              {raffle.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1.5 leading-normal font-sans">
                              {raffle.description}
                            </p>

                            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-blue-900/30">
                              <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Prémio de Concurso</span>
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-1 font-display">
                                <Trophy className="h-3.5 w-3.5" />
                                {raffle.prize}
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-blue-900/20">
                            {isActive ? (
                              <div className="space-y-3">
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                  <span>Data do Sorteio:</span>
                                  <span className="font-bold text-slate-200">
                                    {new Date(raffle.drawDate).toLocaleDateString("pt-PT")}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                  <span>Participantes:</span>
                                  <span className="font-bold text-slate-200">{raffle.participantsCount} investidores</span>
                                </div>

                                {myTickets.length === 0 ? (
                                  <div className="bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg text-[9px] text-rose-400 font-mono text-center leading-normal">
                                    Requer depósitos ativos para gerar bilhetes. Mínimo 100.000 AOA de investimento faturado.
                                  </div>
                                ) : isEntered ? (
                                  <div className="bg-amber-400/10 text-amber-400 border border-amber-400/20 py-2 text-center font-bold flex items-center justify-center gap-1.5 rounded-xl text-xs">
                                    <Check className="h-3.5 w-3.5" />
                                    <span>{myTickets.length} Bilhetes Vinculados!</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleEnterRaffleSilently(raffle.id)}
                                    disabled={enteringRaffleId !== null}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    {enteringRaffleId === raffle.id ? (
                                      <Loader2 className="h-3.5 w-3.5 text-slate-950 animate-spin" />
                                    ) : (
                                      <Ticket className="h-3.5 w-3.5" />
                                    )}
                                    <span>Inscrever {myTickets.length} Bilhetes Ativos</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-3 space-y-1.5 text-xs">
                                <span className="text-amber-400 font-bold block">Ganhador Oficial:</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                  <div>
                                    <span className="text-slate-500 block uppercase font-mono text-[8px]">Invertidor</span>
                                    <span className="text-slate-250 truncate block font-bold">{raffle.winnerUserName}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block uppercase font-mono text-[8px]">Bilhete Sorteado</span>
                                    <span className="text-amber-400 font-bold block">{raffle.winnerTicketNumber}</span>
                                  </div>
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

              {/* Active Ticket List Sidebar (col-4) */}
              <div className="lg:col-span-12 xl:col-span-4">
                <div className="bg-[#0b1329] rounded-2xl p-5 border border-blue-900/30">
                  <h3 className="text-xs font-bold text-white font-display flex items-center gap-1.5 mb-4 pb-3 border-b border-blue-900/20">
                    <Ticket className="h-4 w-4 text-amber-400" />
                    Seus Bilhetes Ativos ({myTickets.length})
                  </h3>

                  {myTickets.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-dashed border-blue-900/10">
                      <Ticket className="h-7 w-7 text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-400">Nenhum bilhete ativo</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] mx-auto leading-relaxed">
                        Faça faturamentos de depósitos. A cada 100.000 AOA homologados, geramos bilhetes transparentes!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {myTickets.map((t, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-950/40 hover:bg-blue-950 border border-blue-900/30 p-3 rounded-xl flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-white tracking-wider block">
                              {t.code}
                            </span>
                            <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                              Origem: {t.amount.toLocaleString("pt-AO")} AOA
                            </span>
                          </div>
                          <span className="h-5 w-5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 bg-slate-900/60 border border-blue-900/15 rounded-xl text-[10px] text-slate-400 mt-4 flex items-start gap-1.5 leading-relaxed">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      A auditoria do sorteio baseia-se em hash sincronizado block-chain e no ID de depósito público dos investidores.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: TEAM / EQUIPA NETWORK MANAGEMENT */}
        {activeSection === "equipa" && (
          <div className="space-y-6 animate-fadeIn" id="team-module-view">
            <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Sua Rede de Equipa</h3>
                  <p className="text-xs text-slate-400">Indicações e comissões integradas por níveis multinível eletrónicos</p>
                </div>
              </div>

              {/* Commission indicators */}
              <div className="grid grid-cols-3 gap-4 border-y border-blue-900/20 py-4 my-4">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Nível 1</span>
                  <span className="text-lg font-bold text-amber-400">12% Bónus</span>
                </div>
                <div className="text-center border-x border-blue-900/25">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Nível 2</span>
                  <span className="text-lg font-bold text-slate-300">5% Bónus</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Nível 3</span>
                  <span className="text-lg font-bold text-slate-400">2% Bónus</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Membros Referenciados Simulados ({Math.floor(approvedVolume / 150000)})</h4>

                {approvedVolume < 150000 ? (
                  <div className="bg-slate-900/55 p-6 rounded-xl border border-dashed border-blue-900/15 text-center">
                    <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Nenhum membro ativo em rede</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Partilhe o seu link de comissão com os seus parceiros de investimentos. Assim que eles concluírem o primeiro faturamento, faturará comissões de até 12%!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    <div className="bg-blue-950/40 border border-blue-900/25 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-bold block">Manuel Afonso Santos</span>
                        <span className="text-[10px] text-emerald-400 font-sans block mt-0.5">Ativo • Compra Antigravity Hash</span>
                      </div>
                      <span className="text-amber-400 font-bold">+18.000 AOA</span>
                    </div>

                    <div className="bg-blue-950/40 border border-blue-900/25 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-bold">Edson Domingos</span>
                        <span className="text-[10px] text-emerald-400 font-sans block mt-0.5">Ativo • Compra Antigravity Hash</span>
                      </div>
                      <span className="text-amber-400 font-bold">+18.000 AOA</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* NOVO: BLOCO DE COMPARTILHAMENTO E BÓNUS RECORRENTES */}
            <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6 mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Partilhar & Ganhar Bónus 📢</h3>
                  <p className="text-xs text-slate-400">Cada convite partilhado ganha 1.500,00 AOA imediatamente!</p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-blue-900/20 p-4 rounded-xl text-xs space-y-3">
                <p className="text-slate-300 leading-relaxed font-sans">
                  Partilhe a plataforma com os seus amigos. Ao clicar nos canais de partilha abaixo, o seu link pessoal de comissão é gerado. Cada partilha bem-sucedida garante instantaneamente <b className="text-cyan-400 font-mono">1.500,00 AOA</b> de saldo. Se o convidado se tornar um membro oficial investindo em hashrates, ganhará comissões extras de rede multinível!
                </p>

                {/* Simulated Custom Referral Link Box */}
                <div className="bg-[#050914] border border-blue-900/30 p-2.5 rounded-lg flex items-center justify-between gap-3 text-[11px] font-mono select-all">
                  <div className="truncate text-slate-400">
                    {window.location.origin}/?ref={user.id}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.id}`);
                      success("Seu link de afiliado exclusivo foi copiado para a área de transferência!", "Link Copiado!");
                    }}
                    className="p-1 px-2.5 bg-blue-950 hover:bg-amber-400 hover:text-slate-950 text-slate-300 rounded font-bold font-sans text-[10px] transition-colors shrink-0"
                  >
                    Copiar
                  </button>
                </div>

                {/* Practical share indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Olá! Estou a obter excelentes rendimentos minerando na plataforma Agelga. Entre agora e comece a girar a roleta diária grátis! Registe-se com o meu link: ${window.location.origin}/?ref=${user.id}`);
                      window.open(`https://api.whatsapp.com/send?text=${text}`);
                      // Award the 1500 kwanza bonus on share click!
                      setShareBonus((prev) => {
                        const next = prev + 1500;
                        localStorage.setItem(`pf_share_bonus_${user.email}`, next.toFixed(2));
                        return next;
                      });
                      success("Mais 1.500,00 AOA adicionados por partilha no WhatsApp!", "Bónus Creditado!");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Olá! Estou a obter excelentes rendimentos minerando na plataforma Agelga. Entre agora e comece a girar a roleta diária grátis! Registe-se com o meu link: ${window.location.origin}/?ref=${user.id}`);
                      window.open(`https://t.me/share/url?url=${window.location.origin}/?ref=${user.id}&text=${text}`);
                      setShareBonus((prev) => {
                        const next = prev + 1500;
                        localStorage.setItem(`pf_share_bonus_${user.email}`, next.toFixed(2));
                        return next;
                      });
                      success("Mais 1.500,00 AOA adicionados por partilha no Telegram!", "Bónus Creditado!");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/?ref=${user.id}`);
                      setShareBonus((prev) => {
                        const next = prev + 1500;
                        localStorage.setItem(`pf_share_bonus_${user.email}`, next.toFixed(2));
                        return next;
                      });
                      success("Mais 1.500,00 AOA adicionados por partilha no Facebook!", "Bónus Creditado!");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.id}`);
                      setShareBonus((prev) => {
                        const next = prev + 1500;
                        localStorage.setItem(`pf_share_bonus_${user.email}`, next.toFixed(2));
                        return next;
                      });
                      success("Copiou o link! Mais 1.500,00 AOA creditados!", "Bónus Reivindicado!");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Copiar Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: FINANÇAS / DEPOSIT & WITHDRAWAL SYSTEM */}
        {activeSection === "financas" && (
          <div className="space-y-6 animate-fadeIn" id="finance-tab-screen">
            {/* Tab selection header */}
            <div className="flex bg-[#050914] p-1.5 rounded-2xl border border-blue-900/40 gap-2">
              <button
                type="button"
                onClick={() => setFinanceTab("deposito")}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  financeTab === "deposito"
                    ? "bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Depositar Capital 📥
              </button>
              <button
                type="button"
                onClick={() => setFinanceTab("saque")}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  financeTab === "saque"
                    ? "bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Solicitar Saque (Retirada) 📤
              </button>
            </div>

            {financeTab === "deposito" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                {/* Left Column coordinates and form upload */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                
                {/* Coordinates Info */}
                <div className="bg-[#0b1329] rounded-2xl p-6 border border-blue-900/30">
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <span className="h-5 w-1 rounded bg-amber-400 block" />
                    Bancos & Carteiras para Operação
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* IBAN Code */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-900/20 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-xs text-white block">Transferência Bancária (IBAN)</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Operador bancário de angola. Utilize Kwanza (AOA) e salve o extrato de movimentação.
                        </p>
                      </div>

                      <div className="bg-[#050914] px-3 py-2.5 rounded-lg border border-blue-900/30 flex items-center justify-between font-mono text-[11px] mt-4">
                        <span className="text-slate-300 font-bold truncate select-all">{IBAN_VALUE}</span>
                        <button
                          onClick={() => handleCopy(IBAN_VALUE, "iban-fin")}
                          className="text-amber-400 hover:text-amber-500 shrink-0 ml-1.5"
                        >
                          {copiedText === "iban-fin" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* USDT WALLET */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-900/20 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-xs text-white block">USDT (TRC20 Wallet)</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Moeda estável para blockchain Tron TRC20. Encomendas noutras redes serão perdidas permanentemente.
                        </p>
                      </div>

                      <div className="bg-[#050914] px-3 py-2.5 rounded-lg border border-blue-900/30 flex items-center justify-between font-mono text-[11px] mt-4">
                        <span className="text-slate-300 font-bold truncate select-all">{USDT_VALUE}</span>
                        <button
                          onClick={() => handleCopy(USDT_VALUE, "usdt-fin")}
                          className="text-amber-400 hover:text-amber-500 shrink-0 ml-1.5"
                        >
                          {copiedText === "usdt-fin" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitive Receipt Upload Form */}
                <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6">
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <span className="h-5 w-1 rounded bg-amber-400 block" />
                    Enviar Novo Comprovativo de Depósito
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 font-sans">
                    Insira o montante exato enviado, selecione a rede de faturamento e anexe a fotografia do slip/comprovante.
                  </p>

                  {errorMessage && (
                    <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3 rounded-xl text-xs font-semibold mb-4">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-3 rounded-xl text-xs font-semibold mb-4">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4" id="form-comprovativo">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mount value */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Valor Depositado (AOA)</label>
                        <input
                          type="number"
                          required
                          placeholder="Ex: 150000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Currency choice selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Moeda / Canal</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                        >
                          <option value="AOA (IBAN)">AOA (Transferência de IBAN)</option>
                          <option value="USDT (TRC20)">USDT (Blockchain TRC20)</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes descriptions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Notas de Envio / Comentário (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Depósito para rentabilizar plano Antigravity Hash Standard."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Drag-Drop Box loader File proof */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 block">Fotografia ou JPG do Comprovativo Bancário (Obrigatório)</label>
                      
                      {imagePreview ? (
                        <div className="relative border border-amber-400/25 bg-slate-900 rounded-xl p-4 flex flex-col items-center">
                          <img src={imagePreview} alt="Receipt Preview" referrerPolicy="no-referrer" className="h-32 object-contain rounded" />
                          <button
                            type="button"
                            onClick={clearFile}
                            className="absolute top-2 right-2 bg-slate-850 p-1 rounded-full text-slate-450 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <span className="text-[10px] text-amber-400 mt-2 font-mono">Ficha de imagem carregada com sucesso</span>
                        </div>
                      ) : (
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                            dragActive ? "border-amber-400 bg-amber-400/5" : "border-blue-900/30 hover:border-amber-400/20 bg-slate-900/50"
                          }`}
                        >
                          <input
                            type="file"
                            id="file-trigger"
                            required
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label htmlFor="file-trigger" className="cursor-pointer block space-y-2">
                            <Upload className="h-7 w-7 text-slate-500 mx-auto" />
                            <span className="text-xs font-semibold text-slate-350 block">Arraste ou selecione a imagem de faturação</span>
                            <span className="text-[10px] text-slate-500 block">PNG, JPG, JPEG até 10 MB de capacidade</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Check className="h-4 w-4" />}
                      <span>Submeter Comprovativo de Faturamento</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column List Ledger of submitted payments receipts */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-white font-display flex items-center gap-1.5 border-b border-blue-900/20 pb-3 mb-4">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Seu Histórico de Encomendas ({payments.length})
                  </h3>

                  {loading ? (
                    <div className="py-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                      <span className="text-[10px]">A ler registros...</span>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="py-10 text-center bg-slate-900/40 rounded-xl border border-dashed border-blue-900/10">
                      <Clock className="h-7 w-7 text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-slate-500">Nenhum registo de depósito</p>
                      <p className="text-[10px] text-slate-650 max-w-[150px] mx-auto mt-1 leading-normal">
                        Conclua transferências bancárias ou de moedas para que o seu histórico registre vias aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {payments.map((p) => {
                        const isApproved = p.status === "Aprovado";
                        const isPending = p.status === "Pendente";
                        const isRejected = p.status === "Rejeitado";

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedReceipt(p)}
                            className="p-3 bg-slate-900 border border-blue-900/20 hover:border-amber-400/20 rounded-xl cursor-pointer group transition-all text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white font-mono">
                                {parseFloat(p.amount).toLocaleString("pt-AO")} AOA
                              </span>
                              
                              <span
                                className={`text-[8px] font-extrabold font-mono px-2 py-0.5 rounded uppercase ${
                                  isApproved
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : isPending
                                    ? "bg-amber-400/10 text-amber-400 animate-pulse"
                                    : "bg-rose-500/10 text-rose-450"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-blue-900/15 mt-2 font-mono">
                              <span>{p.currency}</span>
                              <span className="group-hover:text-amber-400">&larr; Ver detalhes</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              </div>
            ) : (
              /* SAQUE / WITHDRAWALS TAB VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="saque-ledger-view">
                {/* Left Column withdrawal form and specs */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                  {/* Balance Display Board */}
                  <div className="bg-gradient-to-br from-[#0c183a] to-[#080f25] border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Carteira de Retirada Disponível</span>
                    <h4 className="text-2xl font-mono font-black text-white mt-1.5">
                      AOA {(miningBalance + wheelBonus + shareBonus).toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-2 font-sans leading-relaxed">
                      Este saldo engloba o rendimento acumulado de hashrates mineiros (AOA), os bónus de recomendação garantidos por partilhas (1.500 AOA cada!) e os prémios sorteados na roleta da sorte diária.
                    </p>
                  </div>

                  {/* Submission form panel */}
                  <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6">
                    <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-2">
                      <span className="h-5 w-1 rounded bg-amber-400 block" />
                      Solicitar Retirada / Levantamento de Saque
                    </h3>
                    <p className="text-xs text-slate-400 mb-6 font-sans">
                      Insira o montante que deseja retirar dos seus lucros e preencha a conta bancária ou carteira USDT para transferência.
                    </p>

                    {withdrawErrorMessage && (
                      <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 p-3 rounded-xl text-xs font-semibold mb-4">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-450" />
                        <span>{withdrawErrorMessage}</span>
                      </div>
                    )}

                    {withdrawSuccessMessage && (
                      <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold mb-4">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{withdrawSuccessMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Valor do Saque (AOA)</label>
                          <input
                            type="number"
                            required
                            placeholder="Mínimo 1.000 AOA"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Choice Currency Method */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Moeda de Pagamento</label>
                          <select
                            value={withdrawCurrency}
                            onChange={(e) => setWithdrawCurrency(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white outline-none focus:border-amber-400 focus:bg-slate-900"
                          >
                            <option value="AOA (IBAN)">Kwanza (IBAN de Angola)</option>
                            <option value="USDT (TRC20)">USDT (Rede Tron TRC-20)</option>
                          </select>
                        </div>
                      </div>

                      {/* Destination details Info */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          {withdrawCurrency === "AOA (IBAN)" ? "IBAN Bancário Recomendado" : "Endereço da Carteira USDT (Rede Tron TRC-20)"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={withdrawCurrency === "AOA (IBAN)" ? "Ex: AO06 0040 0000 ..." : "Ex: TMWdkLjJsN3e..."}
                          value={withdrawDestination}
                          onChange={(e) => setWithdrawDestination(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-blue-900/30 rounded-xl text-xs text-white placeholder-slate-550 outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={withdrawSubmitLoading}
                          className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {withdrawSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Clock className="h-4 w-4" />}
                          <span>Reivindicar Saque Diário Oficial</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Column past withdrawals list history */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-4">
                  <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-white font-display flex items-center gap-1.5 border-b border-blue-900/20 pb-3 mb-4">
                      <FileText className="h-4 w-4 text-amber-400" />
                      Histórico de Saques ({withdrawals.length})
                    </h3>

                    {withdrawals.length === 0 ? (
                      <div className="py-10 text-center bg-slate-900/40 rounded-xl border border-dashed border-blue-900/10">
                        <Clock className="h-7 w-7 text-slate-600 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-500">Nenhum registo de saque</p>
                        <p className="text-[10px] text-slate-550 max-w-[150px] mx-auto mt-1 leading-normal font-sans">
                          A sua carteira ainda não registou levantamentos. Submeta o formulário para registar vias aqui.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 font-mono">
                        {withdrawals.map((w) => {
                          const isApproved = w.status === "Aprovado";
                          const isPending = w.status === "Pendente";
                          const isRejected = w.status === "Rejeitado";

                          return (
                            <div
                              key={w.id}
                              className="p-3 bg-slate-900 border border-blue-900/20 rounded-xl text-left font-mono"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white font-mono">
                                  {parseFloat(w.amount).toLocaleString("pt-AO")} AOA
                                </span>
                                
                                <span
                                  className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                    isApproved
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : isPending
                                      ? "bg-amber-400/10 text-amber-400 animate-pulse"
                                      : "bg-rose-500/10 text-rose-450"
                                  }`}
                                >
                                  {w.status}
                                </span>
                              </div>

                              <div className="text-[9px] text-slate-400 pt-2 border-t border-blue-900/15 mt-2 space-y-1">
                                <div className="flex justify-between">
                                  <span>Canal:</span>
                                  <span className="text-slate-300">{w.currency}</span>
                                </div>
                                <div className="truncate">
                                  <span>Destino:</span>
                                  <span className="text-slate-300 block select-all truncate">{w.destination}</span>
                                </div>
                                {w.feedback && (
                                  <div className="bg-slate-950 p-1 rounded border border-blue-900/15 text-[8.5px] text-amber-400 font-sans mt-1">
                                    Nota Admin: {w.feedback}
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
            )}
          </div>
        )}

        {/* VIEW 6: PROFILES & SETTING LOGOUTS */}
        {activeSection === "meu" && (
          <div className="space-y-6 animate-fadeIn" id="profile-view-tab">
            <div className="bg-[#0b1329] border border-blue-900/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-blue-900/25 mb-4">
                <div className="h-12 w-12 rounded-full bg-amber-400/10 border border-amber-400/35 text-amber-400 flex items-center justify-center font-bold text-xl font-mono shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">{user.name}</h3>
                  <span className="text-[10px] font-mono uppercase bg-blue-950 px-2 py-0.5 rounded text-amber-400 font-bold border border-blue-900/30">
                    ID: #{user.id.substring(3).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-350 uppercase tracking-widest font-mono">Dados da Ficha Cadastrada</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#091024] p-3 rounded-xl border border-blue-900/15 text-xs">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Email do Cliente</span>
                    <span className="text-slate-300 font-medium block font-sans truncate">{user.email}</span>
                  </div>

                  <div className="bg-[#091024] p-3 rounded-xl border border-blue-900/15 text-xs">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Telemóvel / Telefone</span>
                    <span className="text-slate-300 font-medium block font-sans truncate">{user.phone || "Não configurado"}</span>
                  </div>

                  <div className="bg-[#091024] p-3 rounded-xl border border-blue-900/15 text-xs">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Volume Faturado</span>
                    <span className="text-slate-300 font-mono font-bold block">
                      {stats.totalVolume.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                    </span>
                  </div>

                  <div className="bg-[#091024] p-3 rounded-xl border border-blue-900/15 text-xs">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Ficha de Nível</span>
                    <span className="text-slate-350 font-medium block font-sans">Membro Principal de Angola</span>
                  </div>
                </div>

                {/* Simulated direct key wallet backup */}
                <div className="pt-4 border-t border-blue-900/20 bg-amber-400/5 p-4 rounded-xl border border-amber-400/15 mt-4 space-y-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Chave Eletrónica de Auditoria Segura
                  </span>
                  <p className="text-[10px] text-slate-450 leading-normal">
                    Seu endereço de IP e ID estão associados à seguinte credencial criptográfica SHA-256 para saques:
                  </p>
                  <code className="text-[10px] select-all font-mono font-bold text-slate-300 bg-slate-950 p-1.5 rounded block truncate mt-2 border border-blue-900/25">
                    AGELGA-SHA256-{user.id.toUpperCase()}-XMN9242HSH927A0B
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BOTTOM MENUS / DESKTOP RESPONSIVE FLOATING NAV (Screenshot Match Tab bar navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-45 bg-[#0b1329] border-t border-blue-900/40 py-2.5 px-3 block" id="bottom-bar-menu">
        <div className="mx-auto max-w-lg flex items-center justify-between font-medium">
          {/* Menu 1: Início */}
          <button
            onClick={() => setActiveSection("inicio")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "inicio" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">Início</span>
          </button>

          {/* Menu 2: Mineração */}
          <button
            onClick={() => setActiveSection("mineracao")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "mineracao" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">Mineração</span>
          </button>

          {/* Menu 3: Equipa */}
          <button
            onClick={() => setActiveSection("equipa")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "equipa" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">Equipa</span>
          </button>

          {/* Menu 4: Sorteios */}
          <button
            onClick={() => setActiveSection("sorteios")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "sorteios" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Ticket className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">Sorteios</span>
          </button>

          {/* Menu 5: Finanças (Depósitos) */}
          <button
            onClick={() => setActiveSection("financas")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "financas" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">Finanças</span>
          </button>

          {/* Menu 6: Perfil (Meu) */}
          <button
            onClick={() => setActiveSection("meu")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1.5 transition-colors cursor-pointer ${
              activeSection === "meu" ? "text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[9px] font-display font-medium block tracking-tight">UE</span>
          </button>
        </div>
      </div>

      {/* MODAL overlay: VIEW BILL COMPROVATIVO RECEIPT DRAWER */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedReceipt(null)}
          id="receipt-modal-enlarged"
        >
          <div
            className="relative bg-slate-900 border border-blue-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-blue-900/30 pb-3 mb-4">
              <div>
                <h4 className="font-display font-bold text-white text-sm">Visualização do Comprovativo</h4>
                <p className="text-[9px] text-slate-500 font-mono block mt-0.5">Hash do registo: {selectedReceipt.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-blue-955"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt Image in base64 */}
            <div className="bg-[#050914] rounded-xl overflow-hidden border border-blue-900/30 h-64 w-full flex items-center justify-center p-2 shadow-inner">
              <img
                src={selectedReceipt.imageUrl}
                alt="Receipt Proof Enlarged"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain cursor-zoom-in"
              />
            </div>

            {/* Receipt metadata details */}
            <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-950 p-4 rounded-xl border border-blue-900/15">
              <div>
                <span className="text-[8px] font-bold text-slate-500 block uppercase font-mono">Volume Declarado</span>
                <span className="text-xs font-bold text-white font-mono">
                  {parseFloat(selectedReceipt.amount).toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-500 block uppercase font-mono">Meio / Rede</span>
                <span className="text-xs font-bold text-white font-mono">{selectedReceipt.currency}</span>
              </div>
              <div className="col-span-2 border-t border-blue-900/10 pt-2">
                <span className="text-[8px] font-bold text-slate-500 block uppercase font-mono">Comentário do Envio</span>
                <p className="text-xs text-slate-300 block italic leading-relaxed font-sans">
                  {selectedReceipt.notes || "Nenhum histórico inserido pelo investidor."}
                </p>
              </div>
            </div>

            {/* Answer check indicators */}
            {selectedReceipt.processedAt && (
              <div className="mt-4 border-l-4 border-amber-400 bg-amber-450/5 p-3.5 rounded-lg border border-blue-900/15">
                <div className="flex items-center space-x-1.5 mb-1 text-xs">
                  {selectedReceipt.status === "Aprovado" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <span className="font-bold text-white">Parecer da Equipe Administrativa</span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-1 leading-normal">
                  <b>Comentário Oficial:</b> {selectedReceipt.adminNotes || "Fatura validada e homologada eletronicamente de forma bem-sucedida."}
                </p>
                <span className="text-[9px] text-slate-500 font-mono block mt-2 text-right">
                  Auditado em: {new Date(selectedReceipt.processedAt).toLocaleString("pt-PT")}
                </span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 0: DETALHES DO MINERADOR MODAL OVERLAY */}
      {showMinerModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowMinerModal(false)}
          id="miner-overlay-modal"
        >
          <div
            className="relative bg-slate-900 border border-blue-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-blue-900/30 pb-3 mb-4">
              <div>
                <h4 className="font-display font-bold text-white text-base">Unidades de Mineração Ativas</h4>
                <p className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase">Monitoramento de Hardware em Tempo Real</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMinerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-blue-955"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-slate-300 leading-relaxed text-xs">
              <p>
                As suas unidades de processamento de hashrate estão operando e ligadas ao pool nacional descentralizado Agelga.
              </p>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {/* Fixed Miner 1 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                      <Cpu className={`h-5 w-5 ${miningActive ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Cpu Principal Standard #01</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Consola Integrada Agelga</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${miningActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"}`}>
                      {miningActive ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">0.65 AOA / s</span>
                  </div>
                </div>

                {/* Purchased investments active */}
                {investments.map((inv) => (
                  <div key={inv.id} className="bg-slate-950 p-4 rounded-xl border border-blue-900/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center font-bold">
                        <Coins className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{inv.productName}</span>
                        <span className="text-[10px] text-slate-450 block font-mono font-medium">ID: #{inv.id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase bg-emerald-500/10 text-[#00cc66]">
                        {inv.status}
                      </span>
                      <span className="text-[10px] text-emerald-400 block mt-1 font-mono">
                        +{inv.dailyIncome.toFixed(0)} AOA/dia
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/10 mt-4 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold block uppercase font-mono">Rendimento Estimado Total</span>
                <div className="flex justify-between font-mono text-xs pt-1 text-slate-400">
                  <span>Rendimento em GPU (depósitos):</span>
                  <span className="text-white font-bold">AOA {((approvedVolume * 0.015)).toLocaleString("pt-AO", { maximumFractionDigits: 2 })}/dia</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-slate-400">
                  <span>Rendimento em Produtos:</span>
                  <span className="text-white font-bold">AOA {(investments.reduce((sum, i) => sum + i.dailyIncome, 0)).toLocaleString("pt-AO", { maximumFractionDigits: 2 })}/dia</span>
                </div>
                <div className="flex justify-between font-mono text-xs pt-1.5 border-t border-blue-900/15 text-white font-bold">
                  <span>Total Combinado por Dia:</span>
                  <span className="text-emerald-400 font-bold">AOA {((approvedVolume * 0.015) + investments.reduce((sum, i) => sum + i.dailyIncome, 0)).toLocaleString("pt-AO", { maximumFractionDigits: 2 })}/dia</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setShowMinerModal(false)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-705 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Voltar ao Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SOBRE NÓS MODAL OVERLAY */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAboutModal(false)}
          id="about-overlay-modal"
        >
          <div
            className="relative bg-slate-900 border border-blue-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-blue-900/30 pb-3 mb-4">
              <div>
                <h4 className="font-display font-bold text-white text-base">Quem Somos • Agelga Mining</h4>
                <p className="text-[9px] text-amber-400 font-mono tracking-wider uppercase">Auditado Eletronicamente</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-blue-955"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
              <p>
                A <b>Agelga</b> é uma concessionária tecnológica avançada em Angola especializada no empacotamento, distribuição e venda de infraestrutura de hashrate e processadores gráficos de última geração dedicados de forma descentralizada.
              </p>
              <p>
                Nossa matriz de auditoria garante depósitos, homologações, comissões de equipa transparentes e controle de hashrate. Unimos rentabilidade diária automatizada a um motor de sorteios transparentes semanais baseados em faturamento homologado.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/10 space-y-1 mt-4">
                <span className="text-[10px] text-amber-400 font-bold block uppercase font-mono">Nossas Garantias</span>
                <ul className="list-disc pl-4 text-slate-400 space-y-1 font-mono text-[10px]">
                  <li>Armazenamento seguro em Carteira Segura USDT</li>
                  <li>Sorteios automáticos transparentes</li>
                  <li>Taxas de saque de 0%</li>
                  <li>Suporte técnico dedicado via chat</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-5 rounded-xl text-xs cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: JOGO ONLINE LUCKY WHEEL SPINNER MODAL OVERLAY (Pure high-fidelity dynamic implementation) */}
      {showGameModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowGameModal(false)}
          id="game-overlay-modal"
        >
          <div
            className="relative bg-slate-900 border border-blue-900 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shimmer background layout */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

            <div className="flex items-start justify-between border-b border-blue-900/30 pb-3 mb-5 text-left">
              <div>
                <h4 className="font-display font-bold text-white text-base">Roleta da Sorte Agelga 🎟️</h4>
                <p className="text-[9px] text-slate-400 font-mono">Tente a Sorte e Gaste Bilhetes em Incentivos</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGameModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-blue-955"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Animated Wheel Spinner graphical display using vectors */}
            <div className="relative h-48 w-48 mx-auto mb-6 flex items-center justify-center bg-slate-950 rounded-full border-4 border-amber-400 shadow-xl shadow-amber-500/10">
              <div
                className={`absolute inset-1 rounded-full border border-blue-900/50 flex items-center justify-center transition-transform ${
                  gameIsSpinning ? "animate-spin duration-1000" : ""
                }`}
                style={{
                  backgroundImage: "conic-gradient(from 0deg, #10172a 0deg 60deg, #1e293b 60deg 120deg, #10172a 120deg 180deg, #1e293b 180deg 240deg, #10172a 240deg 300deg, #1e293b 300deg 360deg)",
                }}
              >
                {/* Decorative partition lines */}
                <span className="absolute h-full w-[1px] bg-amber-400/20 top-0 left-1/2 transform -translate-x-1/2" />
                <span className="absolute w-full h-[1px] bg-amber-400/20 left-0 top-1/2 transform -translate-y-1/2" />

                {/* Slices of percentages: +15% ⚙️, +30% 💎, +50% ⚡, +100% 🌟, +150% 🚀, +200% 👑 */}
                {[
                  { angle: 30, text: "+15% ⚙️", color: "text-blue-400" },
                  { angle: 90, text: "+30% 💎", color: "text-purple-400" },
                  { angle: 150, text: "+50% ⚡", color: "text-amber-400" },
                  { angle: 210, text: "+100% 🌟", color: "text-yellow-400" },
                  { angle: 270, text: "+150% 🚀", color: "text-pink-400" },
                  { angle: 330, text: "+200% 👑", color: "text-amber-300" },
                ].map((sec, idx) => (
                  <div
                    key={idx}
                    className={`absolute text-[8px] font-extrabold font-mono tracking-tighter ${sec.color}`}
                    style={{
                      transform: `rotate(${sec.angle}deg) translateY(-58px) rotate(${-sec.angle}deg)`,
                    }}
                  >
                    {sec.text}
                  </div>
                ))}
                
                <Trophy className="h-6 w-6 text-amber-400/40" />
              </div>
              {/* Spinner Needle indicator */}
              <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 h-4.5 w-4.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shadow border border-white z-10">
                ▼
              </div>

              {/* Central Pin */}
              <div className="absolute h-10 w-10 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-[7px] text-amber-400 font-bold font-mono shadow-inner z-10">
                SORTE
              </div>
            </div>

            {/* Results output overlay */}
            {gameResultTitle ? (
              <div className="p-4 bg-amber-400/15 border border-amber-400/30 rounded-2xl mb-5 space-y-1 text-center animate-bounce">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono">PARABÉNS!</span>
                <h5 className="font-extrabold text-white text-base leading-snug">{gameResultTitle}</h5>
                <p className="text-xs font-bold text-amber-400 font-mono">
                  + {gameValueWon.toLocaleString("pt-AO")} AOA creditados na Carteira!
                </p>
                <span className="text-[8px] text-slate-400 block font-sans">Giro diário concluído com sucesso.</span>
              </div>
            ) : (
              <div className="mb-5 text-sm p-3 text-slate-400 leading-normal">
                {gameIsSpinning ? (
                  <div className="flex flex-col items-center gap-1.5 font-mono text-amber-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>A ligar semente e a girar...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span>Gire a roleta de incentivos mineiros grátis. Apenas um prémio é permitido por dia!</span>
                    <div className="text-xs font-semibold">
                      {lastSpinDate === new Date().toISOString().split("T")[0] ? (
                        <span className="text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full inline-block mt-2 font-mono">
                          ⚠️ Giro de hoje Concluído! Volte amanhã!
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full inline-block mt-2 font-mono">
                          ✓ Giro Diário Disponível!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowGameModal(false)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Jogo
              </button>
              <button
                type="button"
                disabled={gameIsSpinning || lastSpinDate === new Date().toISOString().split("T")[0]}
                onClick={spinLuckyWheel}
                className="w-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {lastSpinDate === new Date().toISOString().split("T")[0] ? "Amanhã há mais!" : "Girar Roleta!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TELEGRAM COMMUNITY MODAL OVERLAY */}
      {showTelegramModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTelegramModal(false)}
          id="telegram-overlay-modal"
        >
          <div
            className="relative bg-slate-900 border border-blue-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-blue-900/30 pb-3 mb-4">
              <div>
                <h4 className="font-display font-bold text-white text-base">Suporte Oficial • Telegrama</h4>
                <p className="text-[9px] text-sky-450 font-mono tracking-wider uppercase">Atendimento ao Cliente 24/7</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTelegramModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-blue-955"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300 leading-normal">
              <p>
                Junte-se ao canal público nacional ou envie uma mensagem diretamente para a equipe administrativa via <b>Telegram Messenger</b>.
              </p>
              
              <div className="bg-[#050914] p-4 rounded-xl border border-blue-900/10 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold font-mono">
                    T
                  </div>
                  <div>
                    <span className="font-bold text-white block">Grupo Oficial de Investidores</span>
                    <span className="text-[10px] text-sky-400 block font-mono font-medium">@agelgamining_oficial</span>
                  </div>
                </div>
                <a
                  href="https://t.me" // Mock redirection conforming to user alert standard
                  target="_blank"
                  rel="noreferrer referrer"
                  className="bg-sky-500 hover:bg-sky-650 text-white font-bold py-1.5 px-3 rounded-lg text-[10px]"
                >
                  Entrar
                </a>
              </div>

              <p className="text-slate-400 text-[10px] italic">
                Atenção: A equipe administrativa da Agelga NUNCA solicita chaves eletrónicas por mensagens de chat ou transferências adicionais arbitrárias fora do painel de comprovativo.
              </p>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setShowTelegramModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Subtle Admin Gate at the bottom of the User Dashboard */}
      <footer className="w-full bg-slate-950/20 py-4 text-center text-[10px] text-slate-500 font-mono mt-8 border-t border-blue-900/10">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Agelga Gold Mining &copy; {new Date().getFullYear()}</span>
          <button
            onClick={() => setShowAdminGate(!showAdminGate)}
            type="button"
            className="text-slate-600 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer font-sans text-[10px]"
          >
            <Lock className="h-3 w-3" />
            <span>Verificação Administrativa</span>
          </button>
        </div>

        {showAdminGate && (
          <div className="mt-4 mx-auto max-w-xs p-4 bg-[#080f24] border border-blue-900/30 rounded-xl text-left space-y-2.5 animate-fadeIn">
            <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider font-mono">Entrada de Administrador</span>
            {adminError && (
              <p className="text-[9px] text-rose-450 bg-rose-500/10 p-1 px-2 rounded">{adminError}</p>
            )}
            <form onSubmit={handleAdminSubmit} className="space-y-1.5 font-sans font-medium">
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer font-sans"
              >
                {adminLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-950" /> : <Lock className="h-2.5 w-2.5" />}
                <span>Reconhecer Administrador</span>
              </button>
            </form>
          </div>
        )}
      </footer>

    </div>
  );
}

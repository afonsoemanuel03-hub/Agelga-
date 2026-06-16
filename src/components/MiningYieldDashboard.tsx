import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Zap,
  Cpu,
  TrendingUp,
  Sliders,
  Info,
  ArrowRight,
  Gauge,
  HelpCircle,
} from "lucide-react";

// Structure of a mining plan
interface Plan {
  id: string;
  name: string;
  badge: "Básico" | "Recomendado" | "Ultra";
  dailyYieldRate: number; // e.g. 0.0085 for 0.85%
  minInvestment: number;
  hashratePerKwanza: number; // Hashes per AOA
  color: string;
  colorHex: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgGradient: string;
}

const PLANS: Plan[] = [
  {
    id: "bronze",
    name: "Antigravity Hash Standard",
    badge: "Básico",
    dailyYieldRate: 0.0085, // 0.85% daily
    minInvestment: 150000,
    hashratePerKwanza: 0.00012, // 18 TH/s for 150,000 AOA
    color: "emerald",
    colorHex: "#10b981",
    gradientFrom: "rgba(16, 185, 129, 0.4)",
    gradientTo: "rgba(16, 185, 129, 0)",
    borderColor: "border-emerald-200 focus:border-emerald-500",
    bgGradient: "bg-emerald-500/5",
  },
  {
    id: "prata",
    name: "DeepMind Xeon Pro",
    badge: "Recomendado",
    dailyYieldRate: 0.0125, // 1.25% daily
    minInvestment: 800000,
    hashratePerKwanza: 0.00015, // 120 TH/s for 800,000 AOA
    color: "amber",
    colorHex: "#f59e0b",
    gradientFrom: "rgba(245, 158, 11, 0.4)",
    gradientTo: "rgba(245, 158, 11, 0)",
    borderColor: "border-amber-200 focus:border-amber-500",
    bgGradient: "bg-amber-500/5",
  },
  {
    id: "ouro",
    name: "Quantum Helix Enterprise",
    badge: "Ultra",
    dailyYieldRate: 0.0175, // 1.75% daily
    minInvestment: 3500000,
    hashratePerKwanza: 0.00018, // 630 TH/s for 3,500,000 AOA
    color: "indigo",
    colorHex: "#6366f1",
    gradientFrom: "rgba(99, 102, 241, 0.4)",
    gradientTo: "rgba(99, 102, 241, 0)",
    borderColor: "border-indigo-200 focus:border-indigo-500",
    bgGradient: "bg-indigo-500/5",
  },
];

interface MiningYieldDashboardProps {
  onSelectPlanAmount?: (amount: number, note: string) => void;
}

export default function MiningYieldDashboard({ onSelectPlanAmount }: MiningYieldDashboardProps) {
  // States for interactive simulations
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(["bronze", "prata"]);
  const [simulatedAmount, setSimulatedAmount] = useState<number>(1000000);
  const [durationDays, setDurationDays] = useState<number>(180);
  const [interestMode, setInterestMode] = useState<"simple" | "compound">("compound");
  const [showTooltipInfo, setShowTooltipInfo] = useState(false);

  // Quick select preset capital values
  const PRESET_AMOUNTS = [150000, 500000, 1000000, 3500000, 7500000];

  // Map plans for ease of access
  const plansMap = useMemo(() => {
    return PLANS.reduce((acc, plan) => {
      acc[plan.id] = plan;
      return acc;
    }, {} as Record<string, Plan>);
  }, []);

  // Sync amount with valid bounds if only one plan is selected
  const handleTogglePlan = (planId: string) => {
    setSelectedPlanIds((prev) => {
      let next: string[];
      if (prev.includes(planId)) {
        if (prev.length === 1) {
          // Keep at least one checked
          return prev;
        }
        next = prev.filter((id) => id !== planId);
      } else {
        next = [...prev, planId];
      }
      return next;
    });
  };

  // Generate Recharts data points
  const chartData = useMemo(() => {
    const data = [];
    const step = Math.max(1, Math.floor(durationDays / 12));

    for (let day = 0; day <= durationDays; day += step) {
      const point: any = {
        name: `Dia ${day}`,
        day,
      };

      PLANS.forEach((plan) => {
        // We simulate based on the user's input, but keep plan's minimum requirement in mind
        const investment = Math.max(simulatedAmount, plan.minInvestment);

        let finalValue = investment;
        if (interestMode === "compound") {
          // Reinvestment model: A = P * (1 + r)^t
          finalValue = investment * Math.pow(1 + plan.dailyYieldRate, day);
        } else {
          // Payout daily model (simple interest): A = P * (1 + r * t)
          finalValue = investment * (1 + plan.dailyYieldRate * day);
        }

        const profit = finalValue - investment;
        // Profit accumulated format
        point[plan.id] = parseFloat(profit.toFixed(2));
        point[`${plan.id}_total`] = parseFloat(finalValue.toFixed(2));
      });

      data.push(point);
    }

    // Always append the final day if not perfectly hit by the step
    const lastPoint = data[data.length - 1];
    if (lastPoint.day !== durationDays) {
      const finalPoint: any = {
        name: `Dia ${durationDays}`,
        day: durationDays,
      };

      PLANS.forEach((plan) => {
        const investment = Math.max(simulatedAmount, plan.minInvestment);
        let finalValue = investment;
        if (interestMode === "compound") {
          finalValue = investment * Math.pow(1 + plan.dailyYieldRate, durationDays);
        } else {
          finalValue = investment * (1 + plan.dailyYieldRate * durationDays);
        }
        const profit = finalValue - investment;
        finalPoint[plan.id] = parseFloat(profit.toFixed(2));
        finalPoint[`${plan.id}_total`] = parseFloat(finalValue.toFixed(2));
      });
      data.push(finalPoint);
    }

    return data;
  }, [simulatedAmount, durationDays, interestMode]);

  // Handle plan contract callback
  const handleContractPlan = (plan: Plan) => {
    if (onSelectPlanAmount) {
      // Auto fill target amount based on simulation or plan minimum
      const finalAmount = Math.max(simulatedAmount, plan.minInvestment);
      const note = `Adesão ao plano de mineração: ${plan.name} (${(plan.dailyYieldRate * 100).toFixed(2)}% ao dia, Hashrate estimado).`;
      onSelectPlanAmount(finalAmount, note);

      // Scroll smoothly to form
      const el = document.getElementById("section-submit-receipt");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-8"
      id="mining-yield-container"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
            <span className="p-1 px-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono font-bold animate-pulse">
              LIVE
            </span>
            ⚡ Crescimento e Projeção de Rendimentos de Mineração
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Selecione múltiplos pacotes para simular o crescimento do seu capital ativo ao longo do tempo.
          </p>
        </div>

        {/* Compound Interest toggle */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-150 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setInterestMode("simple")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              interestMode === "simple"
                ? "bg-white text-slate-700 shadow-xs"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Rendimento Simples
          </button>
          <button
            type="button"
            onClick={() => setInterestMode("compound")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              interestMode === "compound"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-500"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Juros Compostos
          </button>
          <div className="relative">
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-600"
              onClick={() => setShowTooltipInfo(!showTooltipInfo)}
            >
              <Info className="h-4 w-4" />
            </button>
            {showTooltipInfo && (
              <div className="absolute right-0 top-8 z-20 w-64 bg-slate-900 text-white text-[10.5px] p-3 rounded-lg shadow-xl leading-relaxed animate-fadeIn">
                <p className="font-bold mb-1 text-emerald-300">💡 Como funciona o rendimento?</p>
                <b className="block mt-1">Simples (Payout Diário):</b>
                Ganhos diários são pagos e acumulados separadamente do saldo investido inicial.
                <b className="block mt-2">Composto (Reinvestimento):</b>
                Os rendimentos gerados são automaticamente reinvestidos no balanço ativo de poder, gerando lucros sobre lucros adicionais exponenciais.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Plan Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="sim-plan-selector-grid">
        {PLANS.map((plan) => {
          const isSelected = selectedPlanIds.includes(plan.id);
          const simulatedCapital = Math.max(simulatedAmount, plan.minInvestment);
          // Calculate stats for plan card preview
          const percentGain =
            interestMode === "compound"
              ? Math.pow(1 + plan.dailyYieldRate, durationDays) - 1
              : plan.dailyYieldRate * durationDays;
          const totalProfit = simulatedCapital * percentGain;

          const badgeStyles = {
            Básico: "bg-slate-100 text-slate-600 border-slate-200",
            Recomendado: "bg-amber-100 text-amber-800 border-amber-200",
            Ultra: "bg-indigo-100 text-indigo-800 border-indigo-200",
          }[plan.badge];

          const checkStyles = {
            emerald: "bg-emerald-500 border-emerald-500 text-white",
            amber: "bg-amber-500 border-amber-500 text-white",
            indigo: "bg-indigo-500 border-indigo-500 text-white",
          }[plan.color];

          return (
            <div
              key={plan.id}
              onClick={() => handleTogglePlan(plan.id)}
              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all select-none relative flex flex-col justify-between ${
                isSelected
                  ? `${plan.borderColor} ${plan.bgGradient} shadow-md`
                  : "border-slate-100/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              {/* Checkbox trigger & Badge */}
              <div className="flex items-center justify-between mb-3 text-left">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                  {plan.badge}
                </span>

                <div
                  className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                    isSelected ? checkStyles : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-2.5 w-2.5 stroke-2 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Title and stats */}
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800 font-display line-clamp-1">
                  {plan.name}
                </h4>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-slate-900 font-display">
                    {(plan.dailyYieldRate * 100).toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">ao dia</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/50 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Poder Estimado</span>
                    <span className="font-bold text-slate-700 font-mono">
                      {(simulatedCapital * plan.hashratePerKwanza).toFixed(1)} TH/s
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Mínimo Plano</span>
                    <span className="font-bold text-slate-700 font-mono">
                      {plan.minInvestment.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project preview */}
              <div className="mt-4 pt-3 border-t border-slate-150 text-left bg-white/60 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>Projeção Lucro ({durationDays}d):</span>
                  <span className="font-bold text-emerald-600 text-[10px]">
                    +{percentGain * 100 >= 1000 ? (percentGain * 100).toFixed(0) : (percentGain * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-700 font-mono mt-0.5">
                  {totalProfit.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Inputs Sliders Control block */}
      <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-150 grid grid-cols-1 lg:grid-cols-12 gap-6" id="mining-calculator-controls">
        {/* Left simulation parameter input sliders */}
        <div className="lg:col-span-8 space-y-5 text-left">
          {/* Slider 1: Capital Amount invest */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                Capital da Simulação
              </label>
              <span className="font-mono font-extrabold text-emerald-600 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-3xs">
                {simulatedAmount.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
              </span>
            </div>

            <input
              type="range"
              min="150000"
              max="15000000"
              step="50000"
              value={simulatedAmount}
              onChange={(e) => setSimulatedAmount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Presets shortcut selection row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] text-slate-400 font-mono font-bold uppercase shrink-0 mr-1">Rígidos:</span>
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSimulatedAmount(amt)}
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                    simulatedAmount === amt
                      ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {amt.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}
                </button>
              ))}
            </div>
          </div>

          {/* Selector 2: Period range Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                Duração da Operação Contratual
              </label>
              <span className="font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                {durationDays} Dias
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[30, 90, 180, 365].map((d) => {
                const label = {
                  30: "1 Mês (30d)",
                  90: "3 Meses (90d)",
                  180: "6 Meses (180d)",
                  365: "1 Ano (365d)",
                }[d];

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      durationDays === d
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm text-center"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 text-center"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right educational tips block inside card */}
        <div className="lg:col-span-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider block uppercase font-mono mb-1.5 flex items-center gap-1">
              🚀 O Efeito Compounding
            </span>
            <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
              Com o <b>reinvestimento automático</b>, cada kwanza extra minerado ontem junta-se ao seu balanço principal hoje, obtendo taxas ainda maiores amanhã. Ao fim de 180 dias, o plano recomendado chega a superar o simples em mais de <b>80%</b> de faturamento extra líquido!
            </p>
          </div>
          <div className="text-[9px] text-emerald-800 font-mono font-bold mt-2 pt-2 border-t border-emerald-100 flex items-center gap-1.5">
            <span>ROI Médio Diário Combinado:</span>
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 px-1 rounded block">
              {(
                selectedPlanIds.reduce((acc, id) => {
                  const p = plansMap[id];
                  return acc + (p ? p.dailyYieldRate : 0);
                }, 0) / (selectedPlanIds.length || 1) * 100
              ).toFixed(2)}% / dia
            </span>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION PLOT AREA */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100" id="mining-recharts-graph">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="text-left font-sans">
            <span className="text-[9px] font-bold text-emerald-600 block uppercase tracking-wider font-mono">
              Gráfico de Lucros Acumulados
            </span>
            <h4 className="text-sm font-bold text-slate-800">Crescimento Dinâmico de Rendimentos</h4>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold font-mono text-slate-500 self-end sm:self-auto">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-3 bg-emerald-500 inline-block rounded"></span>
              <span>Bronze</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-3 bg-amber-500 inline-block rounded"></span>
              <span>Prata</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-3 bg-indigo-500 inline-block rounded"></span>
              <span>Ouro</span>
            </div>
          </div>
        </div>

        {/* Recharts wrapper */}
        <div className="h-72 w-full pr-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBronze" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrata" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOuro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k Kz`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-850 px-3.5 py-3 rounded-xl shadow-xl text-[11px] text-white space-y-2 text-left animate-fadeIn">
                        <div className="font-bold border-b border-white/10 pb-1 text-slate-300">
                          {label}
                        </div>
                        {payload.map((entry: any) => {
                          const plan = PLANS.find((p) => p.id === entry.name);
                          if (!plan || !selectedPlanIds.includes(plan.id)) return null;

                          const labelText = {
                            bronze: "Bronze Standard",
                            prata: "Prata Pro",
                            ouro: "Ouro Quantum",
                          }[plan.id];

                          const totalInvested = Math.max(simulatedAmount, plan.minInvestment);
                          const totalBalance = entry.value + totalInvested;

                          return (
                            <div key={entry.name} className="space-y-0.5">
                              <span
                                style={{ color: entry.color }}
                                className="font-bold block uppercase text-[9px] tracking-wider"
                              >
                                {labelText}
                              </span>
                              <div className="font-mono">
                                <span className="text-slate-400">Lucro: </span>
                                <span className="text-emerald-400 block sm:inline font-bold">
                                  +{entry.value.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                                </span>
                              </div>
                              <div className="font-mono text-[10px] text-slate-400">
                                Total: {totalBalance.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Define Areas for each plan, only display if selected in state */}
              {selectedPlanIds.includes("bronze") && (
                <Area
                  type="monotone"
                  dataKey="bronze"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBronze)"
                  name="bronze"
                />
              )}

              {selectedPlanIds.includes("prata") && (
                <Area
                  type="monotone"
                  dataKey="prata"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrata)"
                  name="prata"
                />
              )}

              {selectedPlanIds.includes("ouro") && (
                <Area
                  type="monotone"
                  dataKey="ouro"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOuro)"
                  name="ouro"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SELECTED PLANS DETAILED SUMMARY TABLE / STATS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase font-sans text-left flex items-center gap-1">
          📊 Ficha de Resultados para Planos Selecionados
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="sim-plan-actions-and-stats">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanIds.includes(plan.id);
            if (!isSelected) return null;

            const baseCapital = Math.max(simulatedAmount, plan.minInvestment);
            const percentProfit =
              interestMode === "compound"
                ? Math.pow(1 + plan.dailyYieldRate, durationDays) - 1
                : plan.dailyYieldRate * durationDays;
            const netProfit = baseCapital * percentProfit;
            const totalEst = baseCapital + netProfit;
            const totalHashrate = baseCapital * plan.hashratePerKwanza;

            // Highlight border depending on current plan color
            const borderAccent = {
              emerald: "border-l-emerald-500 bg-emerald-500/5",
              amber: "border-l-amber-500 bg-amber-500/5",
              indigo: "border-l-indigo-500 bg-indigo-500/5",
            }[plan.color];

            const btnAccent = {
              emerald: "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-950/20 text-white",
              amber: "bg-amber-600 hover:bg-amber-700 hover:shadow-amber-950/20 text-white",
              indigo: "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-950/20 text-white",
            }[plan.color];

            return (
              <div
                key={plan.id}
                className={`border-l-4 border bg-white rounded-2xl p-4 flex flex-col justify-between text-left space-y-4 shadow-sm ${borderAccent}`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-display text-xs text-slate-800">
                      {plan.name}
                    </span>
                    <span className="text-[9px] font-mono bg-slate-100 rounded px-1.5 py-0.5 text-slate-500 font-bold block">
                      {durationDays} Dias
                    </span>
                  </div>

                  {/* Summary variables list */}
                  <div className="mt-3.5 space-y-2 text-[10.5px]">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Investimento Simulado:</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {baseCapital.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                      </span>
                    </div>

                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Consumo de Hashrate:</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {totalHashrate.toFixed(1)} TH/s
                      </span>
                    </div>

                    <div className="flex justify-between font-medium">
                      <span className="text-slate-400">Total do Retorno (ROI %):</span>
                      <span className="text-emerald-600 font-mono font-bold">
                        +{(percentProfit * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex justify-between font-medium pt-1.5 pb-0.5 border-t border-slate-150">
                      <span className="text-slate-500 font-bold">Balanço Estimado Final:</span>
                      <span className="text-slate-900 font-mono font-extrabold text-xs">
                        {totalEst.toLocaleString("pt-AO", { style: "currency", currency: "AOA" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button directly leading to Deposit Receipt with this value pre-filled! */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleContractPlan(plan)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm shrink-0 cursor-pointer ${btnAccent}`}
                  >
                    <span>Aderir Plano por {baseCapital.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 })}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                  <span className="text-[8px] text-slate-400 block mt-1.5 text-center leading-normal">
                    *Gera coordenadas e preenche o form abaixo de comprovação para validação.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

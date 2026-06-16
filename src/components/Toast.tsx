import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string, dur?: number) => addToast(msg, "success", title || "Sucesso", dur), [addToast]);
  const error = useCallback((msg: string, title?: string, dur?: number) => addToast(msg, "error", title || "Erro", dur), [addToast]);
  const info = useCallback((msg: string, title?: string, dur?: number) => addToast(msg, "info", title || "Informação", dur), [addToast]);
  const warning = useCallback((msg: string, title?: string, dur?: number) => addToast(msg, "warning", title || "Aviso", dur), [addToast]);

  const value = {
    toast: addToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-3 max-w-sm w-full sm:w-[360px] pointer-events-none" id="toast-portal">
        <AnimatePresence>
          {toasts.map((t) => {
            const config = {
              success: {
                bg: "bg-[#0b1329]/95 border-emerald-500/30 shadow-emerald-500/5",
                iconBg: "bg-emerald-500/10 text-emerald-400",
                icon: <CheckCircle2 className="h-5 w-5" />,
                titleColor: "text-emerald-400",
                progressBar: "bg-emerald-500",
              },
              error: {
                bg: "bg-[#0b1329]/95 border-rose-500/30 shadow-rose-500/5",
                iconBg: "bg-rose-500/10 text-rose-400",
                icon: <XCircle className="h-5 w-5" />,
                titleColor: "text-rose-400",
                progressBar: "bg-rose-500",
              },
              warning: {
                bg: "bg-[#0b1329]/95 border-amber-500/30 shadow-amber-500/5",
                iconBg: "bg-amber-500/10 text-amber-400",
                icon: <AlertTriangle className="h-5 w-5" />,
                titleColor: "text-amber-400",
                progressBar: "bg-amber-500",
              },
              info: {
                bg: "bg-[#0b1329]/95 border-sky-500/30 shadow-sky-500/5",
                iconBg: "bg-sky-500/10 text-sky-400",
                icon: <Info className="h-5 w-5" />,
                titleColor: "text-sky-400",
                progressBar: "bg-sky-500",
              },
            }[t.type];

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={`pointer-events-auto overflow-hidden relative border rounded-2xl p-4 flex gap-3 shadow-xl backdrop-blur-md ${config.bg}`}
                role="alert"
                id={`toast-${t.type}-${t.id}`}
              >
                {/* Type icon indicator */}
                <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                  {config.icon}
                </div>

                {/* Message body */}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className={`text-xs font-bold leading-tight font-display ${config.titleColor}`}>
                    {t.title}
                  </h4>
                  <p className="text-[11px] font-sans font-medium text-slate-300 leading-normal mt-1">
                    {t.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 h-5 w-5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Close notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Decaying timeline progress bar */}
                {t.duration && t.duration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: t.duration / 1000, ease: "linear" }}
                      className={`h-full ${config.progressBar}`}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

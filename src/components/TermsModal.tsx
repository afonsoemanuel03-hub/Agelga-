import React from "react";
import { X, ShieldCheck, FileText, Scale } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      id="terms-lightbox-overlay"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl border border-slate-100 flex flex-col max-h-[80vh] shadow-2xl overflow-hidden animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
        id="terms-modal-container"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">
                Termos de Uso &amp; Privacidade
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ÚLTMA ATUALIZAÇÃO: JUNHO DE 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fechar Termos"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable content with pristine Swiss-modern styling */}
        <div className="overflow-y-auto p-6 space-y-6 font-sans text-xs text-slate-600 leading-relaxed max-h-[calc(80vh-12rem)]">
          
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3 text-slate-700">
            <Scale className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-extrabold text-[11px] uppercase tracking-wider font-mono mb-1">
                Aviso Importante
              </p>
              <p className="text-[11px] leading-normal font-medium">
                Por favor, leia atentamente as cláusulas e compromissos regulados abaixo antes de interagir com as projeções de mineração ou enviar quaisquer comprovativos fiduciários de pagamento.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Section 1 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">1</span>
                Aceitação dos Termos
              </h4>
              <p className="pl-7 text-slate-500">
                Ao aceder e utilizar este website, o utilizador concorda com os presentes Termos de Uso e Política de Privacidade. Caso não concorde com qualquer disposição, deverá interromper a utilização do site.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">2</span>
                Cadastro de Utilizadores
              </h4>
              <p className="pl-7 text-slate-500">
                Para utilizar determinadas funcionalidades, o utilizador poderá necessitar de criar uma conta, fornecendo informações verdadeiras, completas e atualizadas.
              </p>
              <p className="pl-7 text-slate-500">
                O utilizador é responsável pela confidencialidade dos seus dados de acesso e por todas as atividades realizadas na sua conta.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">3</span>
                Pagamentos
              </h4>
              <p className="pl-7 text-slate-500">
                Os pagamentos efetuados através dos métodos disponibilizados no site deverão ser realizados exclusivamente pelo titular da conta.
              </p>
              <p className="pl-7 text-slate-500">
                Após a realização do pagamento, o utilizador poderá enviar um comprovativo para análise e validação.
              </p>
              <p className="pl-7 text-slate-500">
                O envio do comprovativo não garante aprovação automática, estando sujeito à verificação pela administração do site.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">4</span>
                Verificação de Comprovativos
              </h4>
              <p className="pl-7 text-slate-500">
                A administração reserva-se o direito de solicitar informações adicionais para validar qualquer pagamento.
              </p>
              <p className="pl-7 text-slate-500">
                Comprovativos falsificados, alterados ou enviados com intenção fraudulenta poderão resultar na suspensão ou encerramento permanente da conta.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">5</span>
                Conduta do Utilizador
              </h4>
              <p className="pl-7 text-slate-500 mb-1">
                É proibido:
              </p>
              <ul className="pl-12 list-disc space-y-1 text-slate-500">
                <li>Utilizar o site para atividades ilegais;</li>
                <li>Fornecer informações falsas;</li>
                <li>Tentar obter acesso não autorizado aos sistemas do site;</li>
                <li>Praticar qualquer atividade que possa prejudicar o funcionamento da plataforma.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">6</span>
                Limitação de Responsabilidade
              </h4>
              <p className="pl-7 text-slate-500">
                O site é disponibilizado "como está", sem garantias expressas ou implícitas.
              </p>
              <p className="pl-7 text-slate-500">
                A administração não será responsável por perdas, danos, interrupções de serviço ou problemas causados por terceiros, falhas técnicas ou força maior.
              </p>
            </div>

            {/* Section 7 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">7</span>
                Privacidade e Proteção de Dados
              </h4>
              <p className="pl-7 text-slate-500 mb-1">
                Os dados fornecidos pelos utilizadores serão utilizados apenas para:
              </p>
              <ul className="pl-12 list-disc space-y-1 text-slate-500">
                <li>Gestão da conta;</li>
                <li>Verificação de pagamentos;</li>
                <li>Comunicação com o utilizador;</li>
                <li>Cumprimento de obrigações legais.</li>
              </ul>
              <p className="pl-7 text-slate-500 font-medium text-amber-500 mt-1">
                Não comercializamos informações pessoais dos utilizadores.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">8</span>
                Armazenamento de Informações
              </h4>
              <p className="pl-7 text-slate-500 mb-1">
                Poderemos armazenar:
              </p>
              <ul className="pl-12 list-disc space-y-1 text-slate-500">
                <li>Nome e informações de contacto;</li>
                <li>Dados da conta;</li>
                <li>Histórico de atividades;</li>
                <li>Comprovativos enviados;</li>
                <li>Endereço IP e informações técnicas de acesso.</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">9</span>
                Segurança
              </h4>
              <p className="pl-7 text-slate-500">
                São adotadas medidas razoáveis para proteger as informações dos utilizadores. No entanto, nenhum sistema de transmissão ou armazenamento eletrónico é totalmente seguro.
              </p>
            </div>

            {/* Section 10 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">10</span>
                Alterações dos Termos
              </h4>
              <p className="pl-7 text-slate-500">
                A administração poderá modificar estes Termos de Uso e Política de Privacidade a qualquer momento. As alterações entrarão em vigor após a sua publicação no website.
              </p>
            </div>

            {/* Section 11 */}
            <div className="space-y-1.5">
              <h4 className="font-display text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">11</span>
                Contacto
              </h4>
              <p className="pl-7 text-slate-500">
                Em caso de dúvidas relacionadas com estes Termos ou com a Política de Privacidade, o utilizador poderá contactar a administração através dos canais oficiais disponibilizados no site.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-sm cursor-pointer"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share2, X, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone / installed PWA mode, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={install}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Instalar Aplicativo no Celular</span>
        </button>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 text-emerald-400 font-semibold text-xs border border-slate-700 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Como instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Instalar no iPhone / iPad</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                    1
                  </span>
                  <p>
                    No Safari, toque no botão de <strong className="text-white">Compartilhar</strong> (ícone de quadrado com seta para cima).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                    2
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Role para baixo e selecione</span>
                    <strong className="text-white flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Adicionar à Tela de Início
                    </strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                    3
                  </span>
                  <p>
                    Toque em <strong className="text-white">Adicionar</strong> no canto superior direito para fixar o app.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

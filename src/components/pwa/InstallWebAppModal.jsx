import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  PlusSquare,
  Zap,
  BellRing,
  X,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';

export default function InstallWebAppModal() {
  const {
    isPromptOpen,
    platform,
    isMobile,
    browser,
    hasDeferredPrompt,
    isInstalled,
    install,
    dismissInstallPrompt,
    closeIOSInstructions,
  } = usePWAInstall();

  const modalRef = useRef(null);

  // Automatically categorize active tab: 'ios' for Apple devices, 'android' for Android/mobile
  const initialCategory = platform === 'ios' ? 'ios' : 'android';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [showAndroidManualSteps, setShowAndroidManualSteps] = useState(false);

  // Sync category whenever platform updates
  useEffect(() => {
    if (platform === 'ios') {
      setActiveCategory('ios');
    } else if (platform === 'android' || isMobile) {
      setActiveCategory('android');
    }
  }, [platform, isMobile]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPromptOpen) {
        dismissInstallPrompt(true);
      }
    };

    if (isPromptOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPromptOpen, dismissInstallPrompt]);

  // If already installed or prompt not open, render nothing
  if (isInstalled || !isPromptOpen) {
    return null;
  }

  const handleAndroidInstallClick = async () => {
    const res = await install();
    if (res?.outcome === 'manual_steps_needed' || (!hasDeferredPrompt && res?.outcome !== 'accepted')) {
      setShowAndroidManualSteps(true);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-modal-title"
        aria-describedby="pwa-modal-description"
        ref={modalRef}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismissInstallPrompt(true)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Card / Mobile Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-10 m-0 sm:m-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {/* Header Banner */}
          <div className="relative p-5 sm:p-6 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => dismissInstallPrompt(true)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-md shadow-red-500/20 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/pwa-192x192.png"
                  alt="iDonate App Icon"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              <div className="min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-primary text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" />
                    Official Web App
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                    {activeCategory === 'ios' ? ' Apple iOS' : '🤖 Android'}
                  </span>
                </div>
                <h2
                  id="pwa-modal-title"
                  className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate"
                >
                  {activeCategory === 'ios' ? 'Add to Home Screen' : 'Install iDonate App'}
                </h2>
                <p
                  id="pwa-modal-description"
                  className="text-xs text-slate-500 dark:text-zinc-400 truncate"
                >
                  {activeCategory === 'ios'
                    ? 'Instant emergency blood alerts on iPhone / iPad'
                    : '1-tap access, real-time alerts & offline ready'}
                </p>
              </div>
            </div>

            {/* Automatic Categorization Switcher Pills */}
            <div className="mt-4 flex items-center bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveCategory('android')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'android'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                }`}
              >
                <span>🤖 Android</span>
                {platform === 'android' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Detected device" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('ios')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'ios'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
                }`}
              >
                <span> iPhone / iPad</span>
                {platform === 'ios' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Detected device" />
                )}
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 pt-3 space-y-4">
            {activeCategory === 'ios' ? (
              /* ─── iOS Step-by-Step Instructions ─── */
              <div className="space-y-3.5">
                <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <span className="text-base">📲</span>
                  <span>Follow these 3 quick steps in <strong>Safari</strong> to install:</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 font-black text-xs">
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Tap the Share button <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        Located at the bottom of Safari on iPhone (or top bar on iPad).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-primary flex items-center justify-center shrink-0 font-black text-xs">
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-primary inline" />
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        Scroll down the share menu list until you see this option.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 font-black text-xs">
                      3
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Tap "Add" in top-right corner
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        The iDonate icon will appear instantly on your home screen!
                      </p>
                    </div>
                  </div>
                </div>

                {browser.isInApp && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      You are in an in-app browser. Tap the menu icon and choose <strong>"Open in Safari"</strong> to enable Add to Home Screen.
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeIOSInstructions}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Got It
                </button>
              </div>
            ) : (
              /* ─── Android Direct Install & Features ─── */
              <div className="space-y-4">
                {/* Benefits List */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-zinc-300">
                    <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/50 text-primary flex items-center justify-center shrink-0">
                      <BellRing className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold">Instant Emergency Blood Alerts</span>
                      <p className="text-slate-400 dark:text-zinc-500 text-[11px]">Real-time push notifications when nearby donors are urgently needed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-zinc-300">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold">Fast One-Tap Access</span>
                      <p className="text-slate-400 dark:text-zinc-500 text-[11px]">Launches directly from your Home Screen with no browser address bar</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-zinc-300">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold">0MB Phone Storage</span>
                      <p className="text-slate-400 dark:text-zinc-500 text-[11px]">Lightweight web app that works offline without taking phone storage</p>
                    </div>
                  </div>
                </div>

                {/* Manual Android steps if browser prompt was consumed or not supported */}
                {showAndroidManualSteps && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Info className="w-4 h-4 text-primary" />
                      <span>Install Manually in Chrome / Browser:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-zinc-300 pl-1 text-[11px] leading-relaxed">
                      <li>Tap the <strong>3 dots (⋮)</strong> menu in the top right corner.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>"Install"</strong> to confirm.</li>
                    </ol>
                  </motion.div>
                )}

                {/* In-app browser warning for Android */}
                {browser.isInApp && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      You are in an in-app browser. Tap the <strong>3 dots (⋮)</strong> and select <strong>"Open in Chrome"</strong> to install to Home Screen.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleAndroidInstallClick}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-red-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-600/25 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Web App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => dismissInstallPrompt(true)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-sm font-semibold rounded-2xl transition-colors cursor-pointer"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Smartphone, Apple, ArrowLeft, Check, AlertTriangle,
  Share2, PlusSquare, ShieldCheck, Settings,
  ExternalLink, HelpCircle, Compass, Globe, MoreHorizontal
} from 'lucide-react';
import pwaInstallManager from '../services/pwaInstallManager.js';

export default function NotificationGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('android');
  const [iosBrowser, setIosBrowser] = useState('safari');

  useEffect(() => {
    const plat = pwaInstallManager.platform || 'android';
    const browser = pwaInstallManager.detectBrowser();
    if (plat === 'ios') {
      setActiveTab('ios');
      if (browser.isChrome) {
        setIosBrowser('chrome');
      }
    } else {
      setActiveTab('android');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-24 font-sans">
      
      {/* ── Top Bar ── */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                നോട്ടിഫിക്കേഷൻ സഹായി <span className="text-xs font-semibold text-slate-400">/ Notification Guide</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                ഫോണിൽ അടിയന്തര രക്ത സന്ദേശങ്ങൾ ലഭിക്കാൻ / How alerts work on your phone
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">

        {/* ── Simple Tabs: Android vs iPhone ── */}
        <div className="flex p-1 bg-slate-200/80 dark:bg-zinc-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>ആൻഡ്രോയിഡ് (Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-900 dark:text-white" />
            <span>ഐഫോൺ (iPhone)</span>
          </button>
        </div>

        {/* ════════════════════ ANDROID TAB ════════════════════ */}
        {activeTab === 'android' && (
          <div className="space-y-3.5">
            
            {/* 🟢 What Works */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[3]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  ആൻഡ്രോയിഡിൽ ലഭിക്കുന്ന സൗകര്യങ്ങൾ <span className="font-normal text-[10px] text-slate-400">/ What Works</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">ഫോൺ ലോക്ക് ആണെങ്കിലും അറിയിപ്പ് എത്തും</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Alerts arrive even when phone is locked or app is closed.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">സ്ക്രീനിൽ തെളിഞ്ഞുനിൽക്കുന്ന മെസ്സേജും വൈബ്രേഷനും</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Heads-up pop-up alert with custom vibration.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">ഒറ്റ ക്ലിക്കിൽ രോഗിയുടെ വിവരങ്ങളും ഹോസ്പിറ്റലും കാണാം</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Tap notification directly opens the blood request details.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ⚠️ Important to Know (Limitations explained simply) */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  പ്രത്യേകം ശ്രദ്ധിക്കുക <span className="font-normal text-[10px] text-slate-400">/ Important Limitations</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1">
                  <strong className="text-slate-900 dark:text-white block">
                    സ്ക്രീൻ ഓഫായിരിക്കുമ്പോൾ വലിയ സൈറൺ തുടർച്ചയായി അടിക്കില്ല
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    സ്ക്രീൻ ഓഫായിരിക്കുമ്പോൾ സാധാരണ മെസ്സേജ് ടോണും വൈബ്രേഷനും മാത്രമേ അടിക്കൂ. നോട്ടിഫിക്കേഷനിൽ തൊട്ട് ആപ്പ് തുറക്കുമ്പോഴാണ് ഉച്ചത്തിലുള്ള സൈറൺ ശബ്ദം കേൾക്കുന്നത്. (ആൻഡ്രോയിഡ് സുരക്ഷാ നിയമം കാരണമാണിത്).
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Siren loops only when you open the app. When locked, phone plays standard ringtone & vibration.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1">
                  <strong className="text-slate-900 dark:text-white block">
                    ബാറ്ററി സേവർ (Battery Saver) നോട്ടിഫിക്കേഷൻ വൈകിപ്പിച്ചേക്കാം
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                    Samsung, Redmi, OnePlus ഫോണുകളിൽ ബാറ്ററി സേവർ കാരണം മെസ്സേജ് വരാൻ വൈകിയേക്കാം. ഇത് ഒഴിവാക്കാൻ താഴെ പറയുന്ന സ്റ്റെപ്പുകൾ ചെയ്യുക.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Simple Steps to Setup */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                ശരിയായ രീതിയിൽ ഓൺ ആക്കാൻ (3 ലളിതമായ വഴികൾ)
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">നോട്ടിഫിക്കേഷൻ "Allow" നൽകുക</strong>
                    <span className="text-[11px] text-slate-500">Tap "Allow" when Chrome prompts for notifications.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">ബാറ്ററി Unrestricted ആക്കുക (Battery Settings)</strong>
                    <span className="text-[11px] text-slate-500">Phone Settings &gt; Apps &gt; Chrome &gt; Battery &gt; Unrestricted തിരഞ്ഞെടുക്കുക.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block">ഹോം സ്ക്രീനിലേക്ക് ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക</strong>
                    <span className="text-[11px] text-slate-500">ക്രോമിലെ മൂന്ന് കുത്തുകളിൽ ക്ലിക്ക് ചെയ്ത് "Install App" നൽകുക.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════ IPHONE (APPLE) TAB ════════════════════ */}
        {activeTab === 'ios' && (
          <div className="space-y-3.5">

            {/* 🔴 MUST-DO FOR IPHONE (Clean Clear Alert) */}
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900/50 space-y-1.5">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ഐഫോൺ ഉപയോക്താക്കൾ നിർബന്ധമായും അറിയേണ്ട കാര്യം</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-zinc-200 font-bold leading-snug">
                ബ്രൗസറിനുള്ളിൽ (Safari / Chrome) വെബ്സൈറ്റ് തുറന്നിരുന്നാൽ മാത്രം ഐഫോണിൽ നോട്ടിഫിക്കേഷൻ വരില്ല!
              </p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                ആപ്പിളിന്റെ നിയമപ്രകാരം, iDonate ആപ്പ് നിങ്ങളുടെ <strong>ഐഫോൺ ഹോം സ്ക്രീനിലേക്ക് ആഡ് ചെയ്താൽ മാത്രമേ (Add to Home Screen)</strong> നോട്ടിഫിക്കേഷൻ ലഭിക്കൂ.
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                Apple requires adding the web app to your Home Screen to enable Web Push alerts.
              </p>
            </div>

            {/* Sub-browser selector for iPhone: Safari vs Chrome */}
            <div className="bg-slate-200/80 dark:bg-zinc-800/80 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setIosBrowser('safari')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  iosBrowser === 'safari'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>സഫാരി (Safari)</span>
              </button>

              <button
                type="button"
                onClick={() => setIosBrowser('chrome')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  iosBrowser === 'chrome'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ഗൂഗിൾ ക്രോം (Google Chrome)</span>
              </button>
            </div>

            {/* ─── SAFARI INSTRUCTIONS ─── */}
            {iosBrowser === 'safari' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>സഫാരി വഴി സെറ്റ് ചെയ്യാം (3 ഘട്ടങ്ങൾ)</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    Safari Recommended
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        സഫാരിയിൽ താഴെയുള്ള Share ബട്ടൺ അമർത്തുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Tap the Share icon <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> (box with arrow pointing up) at the bottom of Safari.
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        "Add to Home Screen" തിരഞ്ഞെടുക്കുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Scroll down the share sheet and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in top-right.
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        ഹോം സ്ക്രീനിലെ പുതിയ iDonate ആപ്പ് തുറന്ന് "Allow" നൽകുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Open the newly installed app from your home screen and tap "Allow" when asked for notifications.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── GOOGLE CHROME INSTRUCTIONS ─── */}
            {iosBrowser === 'chrome' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>ക്രോം ബ്രൗസർ വഴി സെറ്റ് ചെയ്യാം (Chrome on iOS)</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    iOS Chrome
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        ക്രോമിൽ Share ഐക്കൺ അല്ലെങ്കിൽ മെനു (3 കുത്തുകൾ) അമർത്തുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        In Chrome on iPhone, tap the Share icon <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" /> in the address bar, or tap the <MoreHorizontal className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" /> (3 dots menu) at the bottom right.
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        "Add to Home Screen" തിരഞ്ഞെടുക്കുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Scroll down the menu options and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-amber-600" /> <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong>.
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        ഹോം സ്ക്രീനിലെ iDonate ഐക്കൺ തുറന്ന് "Allow" നൽകുക
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Open the newly added app from your iPhone home screen and tap "Allow" to enable live push alerts.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important tip for Chrome users */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                  <strong className="block mb-0.5">ക്രോമിൽ "Add to Home Screen" കാണുന്നില്ലെങ്കിൽ:</strong>
                  <p className="m-0 leading-relaxed">
                    ചില ഐഫോൺ വേർഷനുകളിൽ ക്രോം മെനുവിൽ ഇത് ഉണ്ടാകില്ല. അങ്ങനെയാണെങ്കിൽ ക്രോമിലെ 3 കുത്തുകളിൽ (Menu) ക്ലിക്ക് ചെയ്ത് <strong>"Open in Safari"</strong> നൽകുക, തുടർന്ന് സഫാരി വഴി ഹോം സ്ക്രീനിലേക്ക് ആഡ് ചെയ്യാം.
                  </p>
                </div>
              </div>
            )}

            {/* What Works & Limitations on iPhone */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                ഐഫോൺ പ്രത്യേകതകൾ <span className="font-normal text-[10px] text-slate-400">/ iOS Features</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>ലോക്ക് സ്ക്രീനിലും നോട്ടിഫിക്കേഷൻ സെന്ററിലും അലർട്ടുകൾ വരും (Lock screen alerts supported on iOS 16.4+)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>ആപ്പ് ഐക്കണിൽ പുതിയ രക്ത അഭ്യർത്ഥനകളുടെ എണ്ണം (Red Badge) കാണിക്കും</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>ഐഫോൺ സൈലന്റ് മോഡിലോ "Focus / Do Not Disturb" മോഡിലോ ആണെങ്കിൽ ശബ്ദം കേൾക്കില്ല</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Direct Link to Notification Settings ── */}
        <div className="pt-2 text-center">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-bold text-primary hover:bg-red-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>നോട്ടിഫിക്കേഷൻ സെറ്റിംഗ്സിലേക്ക് പോകുക / Open Settings</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

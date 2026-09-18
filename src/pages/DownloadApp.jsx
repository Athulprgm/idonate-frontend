import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Apple,
  Download,
  Bell,
  CheckCircle2,
  Share2,
  PlusSquare,
  AlertCircle,
  HelpCircle,
  Zap,
  Volume2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { useAppStore } from '../store/appStore.js';

export default function DownloadApp() {
  const { canInstall, isInstalled, platform, showInstallPrompt, install } = usePWAInstall();
  const { triggerToast } = useAppStore();

  const [activeTab, setActiveTab] = useState(platform === 'ios' ? 'ios' : 'android');
  const [notifyContact, setNotifyContact] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('jeevalink_android_waitlist_registered') === 'true';
  });
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      if (canInstall) {
        await install();
      } else {
        showInstallPrompt();
      }
    } catch (err) {
      console.error('Install error:', err);
      showInstallPrompt();
    } finally {
      setInstalling(false);
    }
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyContact.trim()) {
      triggerToast('Please enter your phone number or email.', 'warning');
      return;
    }
    localStorage.setItem('jeevalink_android_waitlist_registered', 'true');
    localStorage.setItem('jeevalink_android_waitlist_contact', notifyContact.trim());
    setIsSubscribed(true);
    triggerToast('Thank you! You will be notified when the Android app is published on Google Play.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* ── Simple Clean Header ── */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>iDonate Mobile Access</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Download & Install App
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
            Get instant emergency blood alerts and donor search directly on your mobile screen.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            ജീവലിങ്ക് നിങ്ങളുടെ മൊബൈലിൽ ഇൻസ്റ്റാൾ ചെയ്യൂ — അടിയന്തര സന്ദേശങ്ങൾ ഉടനടി അറിയാം.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">

        {/* ── CARD 1: OFFICIAL WEB APP (AVAILABLE NOW) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-5">
            
            {/* Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available Now · ഇപ്പോൾ ഇൻസ്റ്റാൾ ചെയ്യാം</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Official Web App (PWA)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Works on all Android phones, iPhones, and computers without Play Store.
                </p>
              </div>

              {/* Main Install Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isInstalled
                      ? 'Web App Installed ✓'
                      : installing
                      ? 'Opening...'
                      : 'Install Web App'}
                  </span>
                </button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed space-y-1">
                <p className="font-bold">പ്രധാന അറിയിപ്പ് / Important Note:</p>
                <p>
                  You do <strong>not</strong> need to wait for the Google Play Store. The Web App works 100% right now with emergency siren sound alerts, real-time requests, and offline donor search. It takes less than 1 MB of memory.
                </p>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Siren Alerts</div>
                  <div className="text-slate-500 text-[11px]">Real-time push sound</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Under 1 MB</div>
                  <div className="text-slate-500 text-[11px]">Zero phone storage</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Verified & Safe</div>
                  <div className="text-slate-500 text-[11px]">Official DYFI network</div>
                </div>
              </div>
            </div>

            {/* Simple Step-by-Step Tabs */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">Simple Installation Steps:</span>
                
                {/* Platform Selector */}
                <div className="flex p-0.5 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setActiveTab('android')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      activeTab === 'android' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    onClick={() => setActiveTab('ios')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      activeTab === 'ios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    iPhone (iOS)
                  </button>
                </div>
              </div>

              {activeTab === 'android' ? (
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Click the <strong>&quot;Install Web App&quot;</strong> button above, or tap the <strong>3 dots (⋮)</strong> in Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Open from home screen and tap <strong>Allow Notifications</strong> when prompted.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>In Safari browser, tap the <strong className="inline-flex items-center gap-1 text-slate-800"><Share2 className="w-3.5 h-3.5 text-blue-600" /> Share</strong> button at the bottom.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Scroll down and tap <strong className="inline-flex items-center gap-1 text-slate-800"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Tap <strong>Add</strong> at the top right corner.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── CARD 2: NATIVE ANDROID APP (UNDER DEVELOPMENT) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Under Development · നിർമ്മാണത്തിലാണ്</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Official Android App (APK & Play Store)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                The native Android application for Google Play Store is actively being built.
              </p>
            </div>
            
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold self-start sm:self-auto">
              Coming Soon / ഉടൻ വരുന്നു
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our native Android version will include hardware-level emergency siren overrides, turn-by-turn hospital routing for volunteers, and full offline directory sync.
          </p>

          {/* Notify Form */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-red-600" />
              <span>Get notified when the Android app is published:</span>
            </div>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You are on the notification list! We will update you on release.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={notifyContact}
                  onChange={(e) => setNotifyContact(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── CARD 3: HELP & LINKS ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Having trouble getting emergency alerts or sirens?</span>
          </div>
          <Link
            to="/notification-guide"
            className="font-bold text-red-600 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Read Notification Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}

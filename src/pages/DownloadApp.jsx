import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  BellRing,
  Zap,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Info,
  Compass,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { useAppStore } from '../store/appStore.js';

export default function DownloadApp() {
  const { canInstall, isInstalled, platform, showInstallPrompt, install } = usePWAInstall();
  const { triggerToast } = useAppStore();

  const [activeTab, setActiveTab] = useState(platform === 'ios' ? 'ios' : 'android');
  const [iosBrowser, setIosBrowser] = useState(() => {
    if (typeof navigator !== 'undefined' && /crios/i.test(navigator.userAgent)) {
      return 'chrome';
    }
    return 'safari';
  });
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
    triggerToast('You are on the early access list. We will notify you when released.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 font-sans antialiased pb-24">

      {/* ── Apple / Google Minimalist Hero ── */}
      <section className="pt-16 pb-12 px-6 max-w-2xl mx-auto text-center">
        {/* App Squircle Icon */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-[22%] bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-3 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img
              src="/idonate.png"
              alt="iDonate App Icon"
              className="w-full h-full object-contain rounded-[16%]"
            />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
          iDonate for Mobile
        </h1>
        <p className="text-base text-slate-500 max-w-md mx-auto leading-relaxed">
          Kerala&apos;s verified voluntary blood donation network. Instant emergency notifications, donor search, and coordination on any device.
        </p>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          അടിയന്തര രക്തദാന സന്ദേശങ്ങൾ ഫോണിൽ തത്സമയം ലഭിക്കാൻ ആപ്പ് ഉപയോഗിക്കൂ.
        </p>
      </section>

      {/* ── Minimalist Content Container ── */}
      <main className="max-w-2xl mx-auto px-6 space-y-6">

        {/* ── CARD 1: PWA WEB APP (AVAILABLE NOW) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-7 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-1.5 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Available Now • Recommended</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                iDonate Web App
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant install on iPhone, Android & Desktop without App Store.
              </p>
            </div>

            {/* Apple-style Pill Action Button */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-xs tracking-wide shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isInstalled
                    ? 'Installed on this device ✓'
                    : installing
                      ? 'Opening...'
                      : 'Install Web App'}
                </span>
              </button>
            </div>
          </div>

          {/* Important Message (Minimalist Callout) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Important Message & Details</span>
            </div>
            <p>
              You do <strong>not</strong> need to wait for Google Play Store. The iDonate Web App works right now on all devices with 100% of emergency notifications, real-time blood requests, and donor directories. It uses less than 1 MB of storage and updates automatically.
            </p>
          </div>

          {/* Minimal Feature Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-semibold text-slate-900">Notification</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Instant push</div>
            </div>

            <div className="text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-semibold text-slate-900">&lt;1 MB Size</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero bloat</div>
            </div>

            <div className="text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80">
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-semibold text-slate-900">Safe & Free</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Official DYFI</div>
            </div>
          </div>

          {/* Minimalist Segmented Installation Guide */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Installation Guide</span>

              {/* iOS / Google style Pill Segmented Control */}
              <div className="inline-flex p-1 bg-slate-100 rounded-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${activeTab === 'android'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${activeTab === 'ios'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  iPhone
                </button>
              </div>
            </div>

            {activeTab === 'android' ? (
              <ol className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 list-decimal list-inside leading-relaxed">
                <li>Tap the <strong>&quot;Install Web App&quot;</strong> button above, or tap the three dots (⋮) in Chrome.</li>
                <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                <li>Open the app from your home screen and allow notifications to receive emergency notifications.</li>
              </ol>
            ) : (
              <div className="space-y-3">
                {/* iPhone Browser Switcher: Safari vs Chrome */}
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Browser
                  </span>
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setIosBrowser('safari')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${iosBrowser === 'safari'
                          ? 'bg-white text-blue-600 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Safari
                    </button>
                    <button
                      type="button"
                      onClick={() => setIosBrowser('chrome')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${iosBrowser === 'chrome'
                          ? 'bg-white text-amber-600 shadow-xs font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Chrome
                    </button>
                  </div>
                </div>

                {iosBrowser === 'safari' ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/50">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        Safari Guide
                      </span>
                      <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100/80">
                        Recommended
                      </span>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                      <li>In Safari browser, tap the <strong className="inline-flex items-center gap-1 font-semibold text-slate-800"><Share2 className="w-3 h-3 text-blue-600" /> Share</strong> button at the bottom.</li>
                      <li>Scroll down and tap <strong className="inline-flex items-center gap-1 font-semibold text-slate-800"><PlusSquare className="w-3 h-3" /> Add to Home Screen</strong>.</li>
                      <li>Tap <strong>Add</strong> at top right, then launch from your home screen.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/50">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-amber-600" />
                        Google Chrome on iPhone
                      </span>
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100/80">
                        iOS Chrome
                      </span>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                      <li>In Chrome on iPhone, tap the <strong className="inline-flex items-center gap-1 font-semibold text-slate-800"><Share2 className="w-3 h-3 text-amber-600" /> Share</strong> icon next to the address bar (or tap the <strong className="inline-flex items-center gap-1 font-semibold text-slate-800"><MoreHorizontal className="w-3 h-3 text-slate-700" /> 3 dots</strong> menu).</li>
                      <li>Scroll down the options and tap <strong className="inline-flex items-center gap-1 font-semibold text-slate-800"><PlusSquare className="w-3 h-3" /> Add to Home Screen</strong>.</li>
                      <li>Tap <strong>Add</strong> at top right to place the app on your home screen.</li>
                    </ol>
                    <div className="pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 leading-normal">
                      <span className="font-medium text-slate-700">Tip:</span> If you don&apos;t see &quot;Add to Home Screen&quot; in Chrome, tap the 3 dots menu &rarr; tap <strong>&quot;Open in Safari&quot;</strong> to install directly.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ── CARD 2: NATIVE ANDROID APP (UNDER DEVELOPMENT) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-7 sm:p-9 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-1.5">
                <span>Under Active Development</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                Official Android App
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Native APK & Google Play Store release coming soon.
              </p>
            </div>

            <span className="self-start sm:self-auto text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Coming Soon
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The native Android app is currently in QA testing with hardware volume-level notification sound overrides, turn-by-turn hospital route maps, and offline block committee phonebooks.
          </p>

          {/* Minimalist Notify Form */}
          <div className="pt-2">
            {isSubscribed ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-100 px-4 py-2.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>You&apos;re subscribed! We will email/message you upon release.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={notifyContact}
                  onChange={(e) => setNotifyContact(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── CARD 3: MINIMAL HELP & NOTIFICATION GUIDE LINK ── */}
        <div className="rounded-2xl border border-slate-200/60 p-4 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Need help enabling sound alerts or permissions?</span>
          <Link
            to="/notification-guide"
            className="font-medium text-slate-900 hover:text-red-600 inline-flex items-center gap-1 transition-colors"
          >
            <span>Notification Guide</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </main>
    </div>
  );
}

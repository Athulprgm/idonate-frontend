import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Apple,
  Download,
  Bell,
  Zap,
  CheckCircle2,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Share2,
  PlusSquare,
  Volume2,
  Compass,
  HeartHandshake,
  Check,
  Radio,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { useAppStore } from '../store/appStore.js';

export default function DownloadApp() {
  const { canInstall, isInstalled, platform, isMobile, showInstallPrompt, install } = usePWAInstall();
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
      console.error('PWA install click error:', err);
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
    triggerToast('Thank you! You will be the first to know when the Android app is published on Google Play.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* ── Top Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-600 via-red-700 to-slate-900 text-white pt-14 pb-20 px-4">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-red-100 mb-5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Official Jeevalink / iDonate Mobile Applications</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4"
          >
            Get Jeevalink on <span className="text-amber-300">Your Device</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-red-100/90 max-w-2xl mx-auto leading-relaxed"
          >
            Stay connected with Kerala&apos;s fastest voluntary blood donation network. Instant emergency alerts, donor radar, and life-saving coordination right from your home screen.
          </motion.p>
          <p className="text-xs sm:text-sm text-red-200/80 font-medium mt-2">
            ജീവലിങ്ക് നിങ്ങളുടെ മൊബൈലിൽ ഇൻസ്റ്റാൾ ചെയ്യൂ — അടിയന്തര ഘട്ടങ്ങളിൽ ഉടനടി സഹായമെത്തിക്കൂ.
          </p>

          {/* Quick Jump Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-red-600 hover:bg-red-50 font-black text-sm shadow-xl shadow-red-950/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-red-600" />
              <span>{isInstalled ? 'Web App Installed ✓' : 'Install Official Web App'}</span>
            </button>

            <a
              href="#android-native-section"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all"
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>Android APK / Play Store (Coming Soon)</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 space-y-10">

        {/* ════════════════════ CARD 1: OFFICIAL WEB APP (PWA) ════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-red-50 via-white to-rose-50/40 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Available Right Now · ഔദ്യോഗിക വെബ് ആപ്പ് റെഡിയാണ്</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Official Jeevalink Web App (PWA)
              </h2>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                You don&apos;t have to wait! Install Jeevalink directly onto your phone&apos;s home screen today without needing the Play Store. Instant access, zero storage footprint, and real-time emergency notifications.
              </p>
            </div>

            {/* Primary Interactive Install / Download Button */}
            <div className="shrink-0 flex flex-col sm:items-end gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm shadow-lg shadow-red-600/30 active:scale-98 transition-all cursor-pointer group"
              >
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                <span>
                  {isInstalled
                    ? 'Web App Installed ✓'
                    : installing
                    ? 'Launching Installer...'
                    : 'Download & Install Web App'}
                </span>
              </button>

              <span className="text-[11px] font-semibold text-slate-400 text-center sm:text-right">
                {isInstalled
                  ? 'Active on this device'
                  : 'Fast 1-tap installation · Less than 1 MB'}
              </span>
            </div>
          </div>

          {/* Important Message & Details Banner */}
          <div className="px-6 sm:px-8 py-5 bg-amber-50/70 border-b border-amber-200/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                പ്രധാന അറിയിപ്പ് / Important Notice for Donors & Volunteers
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Blood requests are strictly time-sensitive. By installing this Web App and allowing push notifications, your phone will sound alert sirens for critical category-1 requests in your district, helping save lives within minutes.
              </p>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instant Siren Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Emergency audio bursts and high-priority push notifications directly to your phone screen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Under 1 MB Size</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Takes no valuable phone storage. Installs immediately with no waiting or downloading 50MB files.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Works in Low Network</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Offline-capable local cache ensures emergency donor contacts remain accessible in hospital basements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Always Up to Date</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Updates automatically in the background. No manual app updates needed through stores.
              </p>
            </div>
          </div>

          {/* Visual Step-by-Step Installation Tabs */}
          <div className="px-6 sm:px-8 pb-8 pt-2">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    How to Install on Your Device
                  </h4>
                  <p className="text-xs text-slate-500">
                    ഫോണിൽ എളുപ്പത്തിൽ ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള വഴികൾ
                  </p>
                </div>

                {/* Device Selector Tabs */}
                <div className="flex p-1 bg-slate-200/80 rounded-xl">
                  <button
                    onClick={() => setActiveTab('android')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'android'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Android (Chrome)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ios')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'ios'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5 text-slate-900" />
                    <span>iPhone (Safari)</span>
                  </button>
                </div>
              </div>

              {/* Android Instructions */}
              {activeTab === 'android' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">1</span>
                    <h5 className="text-xs font-bold text-slate-900">Click Install Button</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tap the <strong className="text-slate-700">&quot;Download & Install Web App&quot;</strong> button above, or tap the <strong className="text-slate-700">3 dots (⋮)</strong> menu in Chrome.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">2</span>
                    <h5 className="text-xs font-bold text-slate-900">Tap &quot;Install App&quot;</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Select <strong className="text-slate-700">&quot;Install App&quot;</strong> or <strong className="text-slate-700">&quot;Add to Home Screen&quot;</strong> and confirm.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">3</span>
                    <h5 className="text-xs font-bold text-slate-900">Allow Notifications</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Open Jeevalink from your home screen and tap <strong className="text-emerald-700">&quot;Allow&quot;</strong> on the notification popup so sirens reach you.
                    </p>
                  </div>
                </div>
              )}

              {/* iOS Instructions */}
              {activeTab === 'ios' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">1</span>
                    <h5 className="text-xs font-bold text-slate-900">Tap the Share Icon</h5>
                    <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1.5 flex-wrap">
                      In Safari, tap the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-800"><Share2 className="w-3 h-3 text-blue-600" /> Share</span> icon at the bottom of the screen.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">2</span>
                    <h5 className="text-xs font-bold text-slate-900">Add to Home Screen</h5>
                    <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1.5 flex-wrap">
                      Scroll down and tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-800"><PlusSquare className="w-3 h-3 text-slate-700" /> Add to Home Screen</span>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">3</span>
                    <h5 className="text-xs font-bold text-slate-900">Tap &quot;Add&quot; & Open</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tap <strong className="text-slate-700">&quot;Add&quot;</strong> at top right. Launch the app from your home screen to activate push sirens (iOS 16.4+).
                    </p>
                  </div>
                </div>
              )}

              {/* Troubleshooting link */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Need help with sound alerts or browser permissions?</span>
                <Link
                  to="/notification-guide"
                  className="text-red-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  View Notification Guide <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════ CARD 2: NATIVE ANDROID APP (UNDER DEVELOPMENT) ════════════════════ */}
        <motion.div
          id="android-native-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                Under Active Development
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                Coming Soon to Google Play Store & Direct APK
              </span>
            </div>

            {/* Title & Malayalam summary */}
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                Official Android App <br className="hidden sm:inline" />
                <span className="text-emerald-400">ആൻഡ്രോയിഡ് ആപ്പ് ഉടൻ ലഭ്യമാകും</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Our dedicated native Android application (.apk & Google Play Store release) is currently undergoing development and QA testing. Built specifically for high-priority emergency rescue teams, volunteers, and registered blood donors.
              </p>
            </div>

            {/* Native App Upcoming Features */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  🚨
                </div>
                <h4 className="text-sm font-bold text-white">Full Screen SOS Alarm</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bypasses Do Not Disturb for category-1 immediate emergencies when donors are within 5 km.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  📍
                </div>
                <h4 className="text-sm font-bold text-white">Live Distance Radar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time hospital routing, live ambulance sync, and volunteer squad check-in points.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <h4 className="text-sm font-bold text-white">Offline Directory</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Complete offline database of Kerala Block Committees and verified blood bank contacts.
                </p>
              </div>
            </div>

            {/* Pre-Register / Notify Form */}
            <div className="mt-8 pt-8 border-t border-slate-800">
              <div className="max-w-xl">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-300" />
                  Get Notified on Launch / റിലീസ് ചെയ്യുമ്പോൾ അറിയിപ്പ് ലഭിക്കാൻ
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Enter your mobile number or email. We will send you the direct download link as soon as the APK and Play Store version go live.
                </p>

                {isSubscribed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>You&apos;re registered on the early access waitlist! We&apos;ll notify you on launch.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={notifyContact}
                      onChange={(e) => setNotifyContact(e.target.value)}
                      placeholder="Enter mobile number or email"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-md"
                    >
                      Notify Me
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════ CARD 3: FREQUENTLY ASKED QUESTIONS ════════════════════ */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Common Questions & Details</h3>
              <p className="text-xs text-slate-500">ആപ്പുകളെക്കുറിച്ചുള്ള പൊതുവായ സംശയങ്ങൾ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="text-xs font-bold text-slate-900">
                Is the Web App safe and official?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! The Jeevalink Web App is maintained directly by the official technical committee. It connects securely to our authenticated API and doesn&apos;t require accessing your contacts, gallery, or personal storage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="text-xs font-bold text-slate-900">
                Will emergency sirens sound when the app is closed?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes, on Android devices with Chrome or Samsung Internet, notifications arrive directly in the background. Make sure to keep notifications enabled in your browser settings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="text-xs font-bold text-slate-900">
                Can I install the Web App on iPhone?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! Open Jeevalink in Safari, tap the Share button, and select &quot;Add to Home Screen&quot;. On iOS 16.4 and higher, web push notifications are fully supported once added to your home screen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <h5 className="text-xs font-bold text-slate-900">
                How do I switch to the native Android app later?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                When the native Android APK and Google Play Store versions are released, you can install them alongside or simply log in with your existing account. All your donor history and passport data remain fully synced.
              </p>
            </div>
          </div>

          {/* Quick Action Footer in Card */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <HeartHandshake className="w-4 h-4 text-red-500" />
              <span>Ready to save a life today?</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/donor/search"
                className="text-xs font-bold text-slate-700 hover:text-red-600 transition-colors"
              >
                Find Blood Donors
              </Link>
              <span className="text-slate-300">·</span>
              <Link
                to="/emergency/request"
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Post Emergency Blood Request →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

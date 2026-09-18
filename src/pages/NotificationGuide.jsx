import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellRing, BellOff, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  Smartphone, Apple, Laptop, Volume2, VolumeX, Sparkles, ArrowLeft,
  ExternalLink, ChevronRight, RefreshCw, Info, HelpCircle, Download,
  Settings, Check, X, Layers, Radio, Activity, Flame, Share2, Compass
} from 'lucide-react';
import pwaInstallManager, { PWA_STATE } from '../services/pwaInstallManager.js';
import { isPushSupported, getPermissionStatus, hasActiveSubscription, initPushNotifications } from '../services/webPushService.js';
import { requestNotificationPermission } from '../services/firebaseMessaging.js';
import { playEmergencyAlertBurst, playNotificationChime, startEmergencySiren, stopEmergencySiren } from '../utils/sirenAudio.js';
import { useAppStore } from '../store/appStore.js';
import api from '../store/api.js';

export default function NotificationGuide() {
  const navigate = useNavigate();
  const { triggerToast } = useAppStore();

  // Active platform tab: 'android' | 'ios' | 'desktop' | 'matrix' | 'diagnostics'
  const [activeTab, setActiveTab] = useState('android');
  const [lang, setLang] = useState('en'); // 'en' | 'ml'

  // Diagnostic state
  const [swStatus, setSwStatus] = useState('checking');
  const [pushStatus, setPushStatus] = useState('checking');
  const [permStatus, setPermStatus] = useState(() => getPermissionStatus());
  const [isStandalone, setIsStandalone] = useState(false);
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'unknown',
    browser: 'unknown',
    isSafari: false,
    isChrome: false,
    isInApp: false,
  });

  // Audio test state
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [permRequestLoading, setPermRequestLoading] = useState(false);

  // Detect platform & service worker on mount
  useEffect(() => {
    const plat = pwaInstallManager.platform;
    const brw = pwaInstallManager.browser;
    const standalone = pwaInstallManager.isAppInstalled();

    setPlatformInfo({
      platform: plat,
      browser: brw.name,
      isSafari: brw.isSafari,
      isChrome: brw.isChrome,
      isInApp: brw.isInApp,
    });
    setIsStandalone(standalone);

    // Auto-select platform tab based on user's current device
    if (plat === 'ios') {
      setActiveTab('ios');
    } else if (plat === 'android') {
      setActiveTab('android');
    } else if (plat === 'desktop') {
      setActiveTab('desktop');
    }

    // Check SW & Push status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwStatus(reg ? 'active' : 'not_registered');
      }).catch(() => setSwStatus('error'));
    } else {
      setSwStatus('unsupported');
    }

    if (isPushSupported()) {
      hasActiveSubscription().then((sub) => {
        setPushStatus(sub ? 'subscribed' : 'unsubscribed');
      });
    } else {
      setPushStatus('unsupported');
    }

    setPermStatus(getPermissionStatus());
  }, []);

  // Audio Siren Test Toggle
  const toggleSirenTest = async () => {
    if (isPlayingSiren) {
      stopEmergencySiren();
      setIsPlayingSiren(false);
      triggerToast(lang === 'ml' ? 'സൈറൺ നിർത്തി' : 'Emergency siren stopped', 'info');
    } else {
      try {
        setIsPlayingSiren(true);
        triggerToast(
          lang === 'ml' 
            ? '🚨 എമർജൻസി സൈറൺ ടെസ്റ്റ് ചെയ്യുന്നു... (ശബ്ദം ശ്രദ്ധിക്കുക)' 
            : '🚨 Testing Emergency Siren Audio... (Check volume)',
          'info'
        );
        const ctrl = await startEmergencySiren(0.85);
        if (ctrl.blocked) {
          triggerToast(
            lang === 'ml'
              ? 'ശ്രദ്ധിക്കുക: ബ്രൗസർ ഓട്ടോപ്ലേ തടഞ്ഞു. വീണ്ടും ടാപ്പ് ചെയ്യുക.'
              : 'Browser audio autoplay blocked. Tap screen to allow audio.',
            'warning'
          );
        }
      } catch (err) {
        console.error(err);
        setIsPlayingSiren(false);
      }
    }
  };

  // Test Push notification
  const handleTestPush = async () => {
    if (testPushLoading) return;
    setTestPushLoading(true);
    try {
      if (permStatus !== 'granted') {
        triggerToast(
          lang === 'ml'
            ? 'ആദ്യം നോട്ടിഫിക്കേഷൻ പെർമിഷൻ Allow ചെയ്യണം'
            : 'Please allow notification permission first',
          'warning'
        );
        const result = await requestNotificationPermission();
        setPermStatus(getPermissionStatus());
        if (!result) {
          setTestPushLoading(false);
          return;
        }
      }

      await initPushNotifications();
      const res = await api.post('/notifications/test-web-push', { priority: 'immediate' });
      if (res.data?.success) {
        triggerToast(
          lang === 'ml'
            ? '🚨 നിങ്ങളുടെ ഫോണിലേക്ക് ടെസ്റ്റ് എമർജൻസി പുഷ് അയച്ചു!'
            : '🚨 Test Emergency Push notification sent to your device!',
          'success'
        );
      } else {
        triggerToast(res.data?.message || 'Could not dispatch test push.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast(
        err?.response?.data?.message || 
        (lang === 'ml' ? 'ടെസ്റ്റ് നോട്ടിഫിക്കേഷൻ അയക്കാൻ സാധിച്ചില്ല' : 'Failed to dispatch test notification.'),
        'error'
      );
    } finally {
      setTestPushLoading(false);
    }
  };

  // Request Permission
  const handleRequestPermission = async () => {
    setPermRequestLoading(true);
    try {
      const ok = await requestNotificationPermission();
      setPermStatus(getPermissionStatus());
      if (ok) {
        triggerToast(
          lang === 'ml' ? 'നോട്ടിഫിക്കേഷൻ വിജയകരമായി ഓൺ ആക്കി!' : 'Notification permission granted!',
          'success'
        );
        setPushStatus('subscribed');
      } else {
        triggerToast(
          lang === 'ml' ? 'പെർമിഷൻ നൽകിയില്ല അല്ലെങ്കിൽ ബ്ലോക്ക് ചെയ്തു' : 'Permission was denied or dismissed',
          'error'
        );
      }
    } finally {
      setPermRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-28">
      {/* ── Top Header Bar ── */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {lang === 'ml' ? 'നോട്ടിഫിക്കേഷൻ & ഡിവൈസ് ഗൈഡ്' : 'Notification & Device Compatibility Guide'}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-black rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 uppercase tracking-wider">
                  VAPID Push & Audio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
                {lang === 'ml' 
                  ? 'ആൻഡ്രോയിഡ്, ഐഫോൺ (iOS) ഫോണുകളിൽ നോട്ടിഫിക്കേഷൻ എങ്ങനെ പ്രവർത്തിക്കുന്നു'
                  : 'What works, what is restricted by OS, and step-by-step setup for Android & iOS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'ml' : 'en')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-[11px] font-black">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>
            <Link
              to="/settings"
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ── Banner: In-App Browser Warning if user opened inside WhatsApp/Instagram ── */}
        {platformInfo.isInApp && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-amber-800 dark:text-amber-300">
                {lang === 'ml' ? 'ഇൻ-ആപ്പ് ബ്രൗസർ മുന്നറിയിപ്പ് (In-App Browser)' : 'In-App Browser Detected!'}
              </p>
              <p>
                {lang === 'ml'
                  ? 'നിങ്ങൾ വാട്ട്‌സ്ആപ്പ്, ഇൻസ്റ്റാഗ്രാം അല്ലെങ്കിൽ ഫേസ്ബുക്ക് വഴിയാണ് ഈ ലിങ്ക് തുറന്നത്. ഇത്തരം ഇൻ-ആപ്പ് ബ്രൗസറുകൾ പുഷ് നോട്ടിഫിക്കേഷനുകളെയും ഹോം സ്ക്രീൻ ഇൻസ്റ്റാളേഷനെയും തടയുന്നു.'
                  : 'You opened JeevaLink inside WhatsApp, Instagram, or Facebook. These in-app web views completely block Web Push and PWA install.'}
              </p>
              <p className="font-semibold text-amber-700 dark:text-amber-300 underline pt-1">
                {lang === 'ml'
                  ? 'മുകളിലെ 3 ഡോട്ടുകളിൽ ടാപ്പ് ചെയ്ത് "Open in Chrome" അല്ലെങ്കിൽ "Open in Safari" തിരഞ്ഞെടുക്കുക.'
                  : 'Tap the 3 dots (...) in the top right and select "Open in Chrome" (Android) or "Open in Safari" (iPhone).'}
              </p>
            </div>
          </div>
        )}

        {/* ── Live Device Diagnostic Lab Card ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {lang === 'ml' ? 'നിങ്ങളുടെ ഡിവൈസ് നിലവിലെ അവസ്ഥ' : 'Your Device Status & Live Diagnostics'}
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {lang === 'ml' 
                    ? 'ഈ ഫോണിലെ നോട്ടിഫിക്കേഷൻ സൗകര്യങ്ങൾ തത്സമയം പരിശോധിക്കുക'
                    : 'Real-time capability check and interactive test panel for this device'}
                </p>
              </div>
            </div>

            {/* Quick Actions (Audio Test & Push Test) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Siren Audio Test Button */}
              <button
                onClick={toggleSirenTest}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                  isPlayingSiren
                    ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                {isPlayingSiren ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>{lang === 'ml' ? 'സൈറൺ ഓഫ് ചെയ്യുക' : 'Stop Siren Audio'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-red-600" />
                    <span>{lang === 'ml' ? 'സൈറൺ ശബ്ദം ടെസ്റ്റ് ചെയ്യുക' : 'Test Emergency Siren'}</span>
                  </>
                )}
              </button>

              {/* Send Test Push Button */}
              <button
                onClick={handleTestPush}
                disabled={testPushLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <BellRing className={`w-3.5 h-3.5 ${testPushLoading ? 'animate-spin' : ''}`} />
                <span>
                  {testPushLoading 
                    ? (lang === 'ml' ? 'അയക്കുന്നു...' : 'Sending...') 
                    : (lang === 'ml' ? 'ടെസ്റ്റ് പുഷ് അയക്കുക' : 'Send Test Push')}
                </span>
              </button>
            </div>
          </div>

          {/* Diagnostic Status Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            {/* Device OS */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'ഡിവൈസ്' : 'Device OS'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-slate-800 dark:text-zinc-100">
                {platformInfo.platform === 'ios' ? <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" /> :
                 platformInfo.platform === 'android' ? <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> :
                 <Laptop className="w-3.5 h-3.5 text-blue-600" />}
                <span className="capitalize">{platformInfo.platform}</span>
              </div>
            </div>

            {/* Browser */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'ബ്രൗസർ' : 'Browser'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-slate-800 dark:text-zinc-100">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span className="capitalize truncate">{platformInfo.browser}</span>
              </div>
            </div>

            {/* App Install State */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'മോഡ്' : 'PWA Mode'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {isStandalone ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Standalone App
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Browser Tab
                  </span>
                )}
              </div>
            </div>

            {/* Notification Permission */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'പെർമിഷൻ' : 'Permission'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {permStatus === 'granted' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                  </span>
                ) : permStatus === 'denied' ? (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Blocked
                  </span>
                ) : (
                  <button
                    onClick={handleRequestPermission}
                    disabled={permRequestLoading}
                    className="text-primary hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 animate-bounce" /> Tap to Allow
                  </button>
                )}
              </div>
            </div>

            {/* Service Worker */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'സർവീസ് വർക്കർ' : 'Service Worker'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {swStatus === 'active' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active (sw.js)
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> {swStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Web Push Subscription */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {lang === 'ml' ? 'പുഷ് നില' : 'Push Relay'}
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {pushStatus === 'subscribed' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {pushStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs: Android vs iOS vs Desktop vs Matrix ── */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-zinc-850 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Android (Chrome / Edge)</span>
            {platformInfo.platform === 'android' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Your Device
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800 dark:text-white" />
            <span>Apple iOS (iPhone & iPad)</span>
            {platformInfo.platform === 'ios' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                Your Device
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>Desktop (PC / Mac)</span>
            {platformInfo.platform === 'desktop' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Your Device
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>{lang === 'ml' ? 'താരതമ്യ പട്ടിക' : 'Feature Comparison Matrix'}</span>
          </button>
        </div>

        {/* ── TAB CONTENT ── */}

        {/* ════════════════════ ANDROID TAB ════════════════════ */}
        {activeTab === 'android' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Hero */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'ആൻഡ്രോയിഡ് (Android) നോട്ടിഫിക്കേഷൻ രീതി' : 'Android Web Push & Emergency System'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {lang === 'ml'
                      ? 'ആൻഡ്രോയിഡിൽ ഗൂഗിൾ ക്രോം (Chrome), സാംസങ് ഇന്റർനെറ്റ്, എഡ്ജ് (Edge) എന്നിവ വഴി മികച്ച രീതിയിൽ ബാക്ക്ഗ്രൗണ്ട് പുഷ് നോട്ടിഫിക്കേഷൻ ലഭിക്കും. ആപ്പ് തുറക്കാതെ ഫോൺ ലോക്ക് ആയിരിക്കുമ്പോഴും അറിയിപ്പുകൾ വരും.'
                      : 'Android has first-class native support for Standards-based Web Push (VAPID). Notifications arrive in the background even when Chrome is closed and the phone screen is turned off.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-Side: What Works vs What Does NOT Work */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 🟢 What Did / What Works on Android */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {lang === 'ml' ? 'പ്രവർത്തിക്കുന്നവ (What Works)' : 'What Works & Is Supported'}
                    </h4>
                    <p className="text-[11px] text-emerald-600/80">Full Android Capabilities</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ബാക്ക്ഗ്രൗണ്ട് പുഷ് നോട്ടിഫിക്കേഷൻ' : 'Background Web Push Delivery'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ഫോൺ ലോക്ക് ആയിരിക്കുമ്പോഴും ആപ്പ് പൂർണ്ണമായി ക്ലോസ് ചെയ്തിരിക്കുമ്പോഴും ബാക്ക്ഗ്രൗണ്ടിൽ അടിയന്തര രക്ത ആവശ്യങ്ങൾ കൃത്യമായി എത്തും.'
                          : 'Arrives instantly when screen is locked or browser is closed via Google Cloud Messaging / VAPID.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഹെഡ്സ്-അപ്പ് ബാനറും വൈബ്രേഷനും' : 'Heads-up Banners & Custom Vibration'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'എമർജൻസി റിക്വസ്റ്റുകൾക്ക് പ്രത്യേക വൈബ്രേഷൻ പാറ്റേണും പോപ്പ്-അപ്പ് ബാനറും ലഭിക്കും.'
                          : 'High-priority emergency alerts trigger distinctive hardware vibration patterns ([500ms, 200ms, 1000ms]).'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഡയറക്ട് എമർജൻസി SOS ലിങ്ക്' : 'Direct 1-Tap SOS Response'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'നോട്ടിഫിക്കേഷനിൽ ഒറ്റ ടാപ്പ് ചെയ്താൽ നേരിട്ട് ഹോസ്പിറ്റലും രക്തഗ്രൂപ്പും കാണിക്കുന്ന SOS പേജ് തുറക്കും.'
                          : 'Tapping the notification opens immediately into the active emergency blood request page.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഫോർഗ്രൗണ്ട് എമർജൻസി സൈറൺ' : 'Foreground Continuous Siren Loop'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ആപ്പ് തുറന്നിരിക്കുമ്പോഴോ നോട്ടിഫിക്കേഷൻ വഴി പ്രവേശിക്കുമ്പോഴോ ഉച്ചത്തിലുള്ള സൈറൺ ശബ്ദം കേൾക്കാം.'
                          : 'High-frequency acoustic audio siren loops automatically once the user opens or enters the app.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'നേറ്റീവ് 1-ടാപ്പ് ഇൻസ്റ്റാൾ' : '1-Tap Web App Installation'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ക്രോമിലെ ഇൻസ്റ്റാൾ ബട്ടൺ വഴി ഹോം സ്ക്രീനിലേക്ക് നേരിട്ട് ആപ്പ് ആയി ഇൻസ്റ്റാൾ ചെയ്യാം.'
                          : 'Chrome natively displays an "Install App" banner for full standalone home screen usage.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 🔴 What Not Did / Android Caveats & Restrictions */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {lang === 'ml' ? 'പരിമിതികൾ & നിയന്ത്രണങ്ങൾ (What Not Did)' : 'OS Limitations & Restrictions'}
                    </h4>
                    <p className="text-[11px] text-rose-600/80">Android OS Safeguards & How to Fix</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'സ്ക്രീൻ ഓഫായിരിക്കുമ്പോൾ സൈറൺ തുടർച്ചയായി കേൾക്കില്ല' : 'No Continuous Siren While Phone is Locked'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ആൻഡ്രോയിഡ് സുരക്ഷാ നിയമം കാരണം, സ്ക്രീൻ ഓഫായിരിക്കുമ്പോൾ വെബ് ആപ്പുകൾക്ക് തുടർച്ചയായി സൈറൺ പാട്ട് വെക്കാൻ അനുവാദമില്ല. പകരം ഫോണിന്റെ സിസ്റ്റം ബെല്ലും വൈബ്രേഷനും അടിക്കും. നോട്ടിഫിക്കേഷനിൽ തൊടുമ്പോൾ സൈറൺ ഓട്ടോമാറ്റിക്കായി പ്ലേ ആകും.'
                          : 'Android policy blocks web pages from looping custom background audio when screen is locked. Android will ring the default notification chime + vibration; the emergency siren plays the moment you tap open.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ബാറ്ററി ഒപ്റ്റിമൈസേഷൻ ആപ്പ് കില്ലിംഗ്' : 'Aggressive OEM Battery Killers'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'Xiaomi (MIUI), Samsung, OnePlus, Oppo, Vivo ഫോണുകൾ ബാറ്ററി ലാഭിക്കാൻ ക്രോം ബ്രൗസറിനെ സ്ലീപ്പ് മോഡിൽ ആക്കാറുണ്ട്. ഇത് നോട്ടിഫിക്കേഷൻ വൈകാൻ കാരണമാകും.'
                          : 'MIUI/HyperOS, Samsung OneUI, and OxygenOS kill background tasks. Chrome battery setting MUST be set to "Unrestricted" for instant alerts.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഇൻകോഗ്നിറ്റോ (Incognito) മോഡിൽ ലഭിക്കില്ല' : 'Incognito / Private Mode Disabled'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ക്രോമിന്റെ പ്രൈവറ്റ്/ഇൻകോഗ്നിറ്റോ ടാബിൽ സർവീസ് വർക്കറും പുഷ് നോട്ടിഫിക്കേഷനും പ്രവർത്തിക്കില്ല.'
                          : 'Chrome disables Service Workers and PushManager inside Private / Incognito browsing.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഒരിക്കൽ ബ്ലോക്ക് ചെയ്താൽ സ്വയം റീസെറ്റ് ആകില്ല' : 'Blocked Permission Cannot Be Script-Reset'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'നിങ്ങൾ അറിയാതെ "Block" ക്ലിക്ക് ചെയ്തിട്ടുണ്ടെങ്കിൽ, ക്രോം സൈറ്റ് സെറ്റിങ്സിൽ പോയി മാനുവലായി Allow ചെയ്യണം.'
                          : 'If you clicked "Block", browsers do not allow websites to re-prompt. You must manually clear in Chrome Settings.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Step-by-Step Android Optimization Checklist */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                {lang === 'ml' ? 'ആൻഡ്രോയിഡിൽ 100% നോട്ടിഫിക്കേഷൻ ഉറപ്പാക്കാനുള്ള 3 ഘട്ടങ്ങൾ' : '3-Step Setup for 100% Android Emergency Delivery'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'ബ്രൗസർ പെർമിഷൻ Allow ചെയ്യുക' : 'Allow Chrome Notifications'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'മുകളിലെ ഡയഗ്നോസ്റ്റിക്സിൽ "Tap to Allow" ക്ലിക്ക് ചെയ്ത് പെർമിഷൻ അനുവദിക്കുക.'
                      : 'Tap "Allow" when Chrome prompts for notifications. Or tap the lock icon in the address bar.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'ബാറ്ററി സേവർ അൺറെസ്ട്രിക്റ്റഡ് ആക്കുക' : 'Set Battery to Unrestricted'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'ഫോൺ Settings > Apps > Chrome > Battery > "Unrestricted / Don\'t optimize" നൽകുക.'
                      : 'Go to Settings > Apps > Chrome > Battery > choose "Unrestricted" so Chrome stays awake for SOS alerts.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'ലോക്ക് സ്ക്രീൻ ബാനർ ഓൺ ചെയ്യുക' : 'Enable Pop On Screen'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'Settings > Notifications > Chrome > "Pop on screen / Heads-up" ഓൺ ആക്കുക.'
                      : 'Ensure "Pop on screen" and "Lock screen notifications" are toggled ON in Chrome notification channel.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ APPLE iOS TAB ════════════════════ */}
        {activeTab === 'ios' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Hero */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                  <Apple className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'ഐഫോൺ / ഐപാഡ് (Apple iOS) നോട്ടിഫിക്കേഷൻ രീതി' : 'Apple iOS (iPhone & iPad) Web Push'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {lang === 'ml'
                      ? 'ആപ്പിൾ iOS 16.4 മുതൽ പുഷ് നോട്ടിഫിക്കേഷൻ പിന്തുണക്കുന്നുണ്ട്. എന്നാൽ ആപ്പിളിന്റെ കണിശമായ നിയമപ്രകാരം, JeevaLink ആപ്പ് "Add to Home Screen" ചെയ്താൽ മാത്രമേ ഐഫോണിൽ നോട്ടിഫിക്കേഷൻ ലഭിക്കൂ!'
                      : 'Apple introduced Web Push support in iOS 16.4. However, Apple strictly enforces one critical requirement: JeevaLink MUST be installed to the Home Screen to receive push notifications.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CRITICAL WARNING BANNER FOR IOS */}
            <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 space-y-3">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <h4 className="font-black text-sm uppercase tracking-wide">
                  {lang === 'ml' ? 'ഏറ്റവും പ്രധാനപ്പെട്ട ആപ്പിൾ നിബന്ധന' : 'CRITICAL Apple Rule: Safari Tabs Cannot Receive Push'}
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                {lang === 'ml'
                  ? 'നിങ്ങൾ സഫാരി ബ്രൗസറിനുള്ളിൽ വെച്ച് മാത്രം ജീവലിങ്ക് ഉപയോഗിച്ചാൽ നോട്ടിഫിക്കേഷൻ വരില്ല. കാരണം ആപ്പിൾ സഫാരി ബ്രൗസർ ടാബിൽ പുഷ് നോട്ടിഫിക്കേഷൻ പൂർണ്ണമായി ബ്ലോക്ക് ചെയ്തിരിക്കുകയാണ്. താഴെ കാണുന്ന രീതിയിൽ ഹോം സ്ക്രീനിലേക്ക് ആഡ് ചെയ്താൽ മാത്രമേ 100% പ്രവർത്തിക്കൂ.'
                  : 'PushManager is strictly disabled inside regular Safari browser tabs. You cannot receive push notifications inside the Safari window. Apple demands you tap Share > "Add to Home Screen" and open the installed JeevaLink app from your Home Screen.'}
              </p>
            </div>

            {/* Side-by-Side: What Works vs What Does NOT Work on iOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 🟢 What Did / What Works on iOS */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-blue-200 dark:border-blue-900/40 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-blue-700 dark:text-blue-400">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {lang === 'ml' ? 'ഐഫോണിൽ പ്രവർത്തിക്കുന്നവ' : 'What Works (Installed PWA)'}
                    </h4>
                    <p className="text-[11px] text-blue-600/80">iOS 16.4+ Supported Features</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ലോക്ക് സ്ക്രീൻ പുഷ് ബാനറുകൾ' : 'Lock Screen & Notification Center Push'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ഹോം സ്ക്രീനിൽ ആഡ് ചെയ്ത് കഴിഞ്ഞാൽ, ഫോൺ ലോക്ക് ആയിരിക്കുമ്പോഴും ഐഫോൺ നോട്ടിഫിക്കേഷൻ സെന്ററിലേക്ക് അലർട്ടുകൾ വരും.'
                          : 'Arrives in iOS Notification Center and Lock Screen when app is added to Home Screen.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'റെഡ് ബാഡ്ജ് നമ്പറുകൾ (App Icon Badge)' : 'Home Screen App Icon Badges'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'പുതിയ രക്ത അഭ്യർത്ഥനകൾ വരുമ്പോൾ ഹോം സ്ക്രീനിലെ ജീവലിങ്ക് ഐക്കണിൽ ചുവന്ന എണ്ണം (Badge) കാണിക്കും.'
                          : 'Unread emergency blood alerts update the red numeric counter on your iPhone home screen icon.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഫോർഗ്രൗണ്ട് സൈറൺ ശബ്ദം' : 'Foreground Siren & Sound Chimes'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ജീവലിങ്ക് ഓപ്പൺ ചെയ്തു കഴിഞ്ഞാൽ എമർജൻസി അലർട്ട് സൗണ്ട് കൃത്യമായി കേൾക്കാം.'
                          : 'High-intensity siren and notification chime play cleanly when app is active on screen.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഓഫ്‌ലൈൻ ഷെൽ കാഷിങ്' : 'Offline PWA Cache'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'നെറ്റ്‌വർക്ക് വേഗത കുറവാണെങ്കിലും ഹോം സ്ക്രീനിൽ നിന്ന് ആപ്പ് അതിവേഗം ലോഡ് ആകും.'
                          : 'Service worker caches shell assets for instant native-like launching.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 🔴 What Not Did / iOS Limitations */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {lang === 'ml' ? 'ഐഫോണിലെ കടുത്ത നിയന്ത്രണങ്ങൾ' : 'Strict Apple Limitations'}
                    </h4>
                    <p className="text-[11px] text-rose-600/80">Hardware & Apple WebKit Restrictions</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഹോം സ്ക്രീനിൽ ആഡ് ചെയ്യാതെ പുഷ് വരില്ല' : 'Zero Push in Safari Browser Tabs'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'സഫാരി ടാബുകൾക്കുള്ളിൽ വെബ് പുഷ് പ്രവർത്തിക്കില്ലെന്ന് ആപ്പിൾ നിയമം മൂലം നിശ്ചയിച്ചിട്ടുണ്ട്.'
                          : 'PushManager is strictly disabled by Apple in Safari window tabs. PWA install is mandatory.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'പഴയ iOS പതിപ്പുകൾ (iOS 16.3 താഴെ) സപ്പോർട്ട് ഇല്ല' : 'iOS 16.3 and Older Unsupported'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'നിങ്ങളുടെ ഐഫോൺ iOS 16.4 അല്ലെങ്കിൽ iOS 17, 18 ലേക്ക് അപ്ഡേറ്റ് ചെയ്തിരിക്കണം.'
                          : 'iPhones on iOS 15 or 16.0-16.3 do not support Web Push API under any circumstances.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'കസ്റ്റം വൈബ്രേഷൻ (Vibrate API) ലഭ്യമല്ല' : 'navigator.vibrate() is Unsupported on iOS'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ആപ്പിൾ വെബ്സൈറ്റുകൾക്ക് ഐഫോണിന്റെ വൈബ്രേഷൻ മോട്ടോർ നേരിട്ട് നിയന്ത്രിക്കാൻ അനുവാദം നൽകുന്നില്ല. ആപ്പിളിന്റെ സിസ്റ്റം ബെൽ ടോൺ മാത്രമേ അടിക്കൂ.'
                          : 'Apple WebKit completely ignores navigator.vibrate(). Haptics rely solely on standard iOS notification alert tones.'}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ml' ? 'ഫോക്കസ് / DND മോഡ് അലർട്ടുകൾ തടയും' : 'iOS Focus / Do Not Disturb Blocks Alerts'}
                      </span>
                      <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        {lang === 'ml'
                          ? 'ഐഫോണിൽ "Do Not Disturb" അല്ലെങ്കിൽ "Sleep Focus" ഓൺ ആണെങ്കിൽ ജീവലിങ്ക് നോട്ടിഫിക്കേഷൻ ശബ്ദമുണ്ടാക്കില്ല.'
                          : 'If Focus mode is active, iOS will silence alerts unless JeevaLink PWA is added to Settings > Focus > Allowed Apps.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

            {/* Visual Step-by-Step Guide to Install on iPhone */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-900 dark:text-white" />
                {lang === 'ml' ? 'ഐഫോണിൽ ജീവലിങ്ക് ആഡ് ചെയ്യാനുള്ള ലളിതമായ 4 ഘട്ടങ്ങൾ' : 'How to Setup Web Push on iPhone (4 Easy Steps)'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'ml' ? 'സഫാരിയിൽ തുറക്കുക' : 'Open in Apple Safari'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'ജീവലിങ്ക് വെബ്‌സൈറ്റ് ആപ്പിൾ സഫാരി (Safari) ബ്രൗസറിൽ തുറക്കുക.'
                      : 'Ensure you are browsing in native Apple Safari (not inside WhatsApp or Instagram).'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'ml' ? 'ഷെയർ ബട്ടൺ ടാപ്പ് ചെയ്യുക' : 'Tap the Share Icon'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'സഫാരിയുടെ താഴെയുള്ള ഷെയർ ബട്ടൺ (മുകളിലേക്ക് അമ്പടയാളമുള്ള ചതുരം) ക്ലിക്ക് ചെയ്യുക.'
                      : 'Tap the Share button (square with arrow pointing up) at bottom of your iPhone screen.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    3
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'ml' ? '"Add to Home Screen"' : 'Add to Home Screen'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'താഴേക്ക് സ്ക്രോൾ ചെയ്ത് "Add to Home Screen" തിരഞ്ഞെടുത്ത് മുകളിൽ "Add" അമർത്തുക.'
                      : 'Scroll down the share sheet and tap "Add to Home Screen", then tap "Add" in top-right.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    4
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'ml' ? 'ആപ്പ് തുറന്ന് Allow നൽകുക' : 'Launch & Tap Allow'}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ml'
                      ? 'ഹോം സ്ക്രീനിലെ ജീവലിങ്ക് ആപ്പ് തുറന്ന് "Allow Notifications" പോപ്പ്-അപ്പിൽ Allow നൽകുക.'
                      : 'Open the new JeevaLink icon on your home screen and tap "Allow" when iOS asks.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ DESKTOP TAB ════════════════════ */}
        {activeTab === 'desktop' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                  <Laptop className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'ml' ? 'കമ്പ്യൂട്ടർ / ലാപ്‌ടോപ്പ് (Windows & Mac) നോട്ടിഫിക്കേഷൻ' : 'Desktop (Windows, macOS, Linux) Push'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {lang === 'ml'
                      ? 'Chrome, Edge, Brave, Firefox എന്നിവ വഴി കമ്പ്യൂട്ടറുകളിൽ വിൻഡോസ് ആക്ഷൻ സെന്ററിലും മാക് നോട്ടിഫിക്കേഷൻ സെന്ററിലും അലർട്ടുകൾ ലഭിക്കും.'
                      : 'Desktop browsers deliver native system notifications via Windows Action Center and macOS Notification Center with high reliability.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Works */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-blue-200 dark:border-blue-900/40 p-6 shadow-sm space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide text-blue-600">
                  {lang === 'ml' ? 'പ്രവർത്തിക്കുന്നവ (What Works)' : 'Supported Desktop Features'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Windows Action Center & macOS banners with sound chime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Tapping notification automatically focuses existing JeevaLink tab or launches a new one</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Works in regular browser tabs without installing PWA</span>
                  </li>
                </ul>
              </div>

              {/* Restrictions */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 shadow-sm space-y-4">
                <h4 className="font-black text-sm uppercase tracking-wide text-rose-600">
                  {lang === 'ml' ? 'പരിമിതികൾ (Limitations)' : 'Desktop Caveats'}
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>If browser is fully terminated (Quit) without "Continue running background apps" turned on, push stops until re-opened</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Windows "Focus Assist" or macOS "Do Not Disturb" hides banners in the background</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ COMPARISON MATRIX TAB ════════════════════ */}
        {activeTab === 'matrix' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm overflow-hidden">
              <div className="mb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {lang === 'ml' ? 'പ്ലാറ്റ്ഫോം താരതമ്യ പട്ടിക (Platform Comparison Matrix)' : 'Platform Capability Comparison Matrix'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {lang === 'ml'
                    ? 'ഓരോ പ്ലാറ്റ്‌ഫോമിലും ലഭിക്കുന്ന ഫീച്ചറുകൾ ഒരൊറ്റ നോട്ടത്തിൽ'
                    : 'Clear side-by-side breakdown of what is supported across Android, iOS, and Desktop'}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
                      <th className="py-3 px-4 font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        Capability / Feature
                      </th>
                      <th className="py-3 px-3 font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] text-center">
                        Android Chrome
                      </th>
                      <th className="py-3 px-3 font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider text-[11px] text-center">
                        iOS PWA (Home Screen)
                      </th>
                      <th className="py-3 px-3 font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px] text-center">
                        iOS Safari Tab
                      </th>
                      <th className="py-3 px-3 font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] text-center">
                        Desktop Web
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Background Push (Screen Locked / App Closed)
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <Check className="w-4 h-4" /> Yes (Native)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <Check className="w-4 h-4" /> Yes (iOS 16.4+)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          <X className="w-4 h-4" /> No (Blocked)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Requires "Add to Home Screen"
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        Optional (Works in Tab)
                      </td>
                      <td className="py-3 px-3 text-center font-black text-amber-600">
                        ⚠️ Mandatory by Apple
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">
                        N/A
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        Optional
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Lock Screen Banner & Heads-up Pop
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-emerald-600 font-bold">✓ Full Pop-up</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-emerald-600 font-bold">✓ Lock Screen</span>
                      </td>
                      <td className="py-3 px-3 text-center text-red-500 font-bold">✕ No</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Action Center</td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Hardware Vibration Motor Pattern
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-emerald-600 font-bold">✓ Custom Pattern</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-amber-600 font-medium">Apple Default Only</span>
                      </td>
                      <td className="py-3 px-3 text-center text-red-500">✕ No</td>
                      <td className="py-3 px-3 text-center text-slate-400">N/A</td>
                    </tr>

                    {/* Row 5 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Continuous Siren Loop (When App Opened)
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>

                    {/* Row 6 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Continuous Siren Loop (When Screen is Locked)
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-rose-600 font-semibold">✕ Blocked by OS (Chime Only)</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-rose-600 font-semibold">✕ Blocked by Apple (Chime Only)</span>
                      </td>
                      <td className="py-3 px-3 text-center text-rose-600 font-semibold">✕ No</td>
                      <td className="py-3 px-3 text-center text-slate-400">N/A</td>
                    </tr>

                    {/* Row 7 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        1-Tap Deep Link into Emergency SOS
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                      <td className="py-3 px-3 text-center text-red-500">✕ No</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes</td>
                    </tr>

                    {/* Row 8 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        App Icon Red Numeric Badge
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes (PWA)</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">✓ Yes (Home Screen)</td>
                      <td className="py-3 px-3 text-center text-red-500">✕ No</td>
                      <td className="py-3 px-3 text-center text-slate-500">Tab Title Count</td>
                    </tr>

                    {/* Row 9 */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                        Vulnerable to Aggressive Battery Killers
                      </td>
                      <td className="py-3 px-3 text-center text-amber-600 font-black">
                        ⚠️ High (Requires Setting)
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-bold">
                        Low (APNs Handled)
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">N/A</td>
                      <td className="py-3 px-3 text-center text-slate-400">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Troubleshooting FAQ Accordion ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {lang === 'ml' ? 'പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ (FAQ)' : 'Frequently Asked Questions & Quick Fixes'}
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {/* Q1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                {lang === 'ml' 
                  ? 'ഫോൺ ലോക്ക് ആയിരിക്കുമ്പോൾ എന്തുകൊണ്ട് സൈറൺ തുടർച്ചയായി കേൾക്കുന്നില്ല?'
                  : 'Why does the emergency siren not loop continuously while my phone is locked?'}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lang === 'ml'
                  ? 'ആൻഡ്രോയിഡ്, ആപ്പിൾ ഓപ്പറേറ്റിംഗ് സിസ്റ്റങ്ങൾ ഫോൺ ലോക്ക് ആയിരിക്കുമ്പോൾ വെബ് ആപ്പുകളെ തുടർച്ചയായി ഓഡിയോ പ്ലേ ചെയ്യാൻ അനുവദിക്കില്ല (ബാറ്ററി സംരക്ഷണവും സുരക്ഷയും മുൻനിർത്തി). എന്നാൽ സിസ്റ്റം നോട്ടിഫിക്കേഷൻ സൗണ്ടും ശക്തമായ വൈബ്രേഷനും ലഭിക്കും. നോട്ടിഫിക്കേഷനിൽ തൊട്ടയുടൻ തന്നെ പൂർണ്ണ എമർജൻസി സൈറൺ മുഴങ്ങും!'
                  : 'Modern mobile operating systems (Android & iOS) forbid web applications from running an infinite audio synthesizer in the background while the screen is turned off. Instead, the phone rings with the high-priority system tone + vibration. The full acoustic siren triggers automatically the second you tap the notification.'}
              </p>
            </div>

            {/* Q2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
                {lang === 'ml'
                  ? 'ഐഫോണിൽ എന്തിനാണ് "Add to Home Screen" നിർബന്ധമാക്കിയിരിക്കുന്നത്?'
                  : 'Why is "Add to Home Screen" mandatory on Apple iPhone?'}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lang === 'ml'
                  ? 'ആപ്പിളിന്റെ സുരക്ഷാ നയമനുസരിച്ച് സാധാരണ സഫാരി ടാബുകളിൽ പുഷ് നോട്ടിഫിക്കേഷൻ ബ്ലോക്ക് ചെയ്തിരിക്കുകയാണ്. ഉപയോക്താവ് ഹോം സ്ക്രീനിലേക്ക് ഇൻസ്റ്റാൾ ചെയ്താൽ മാത്രമേ ആപ്പിൾ അതിന് ഒരു നേറ്റീവ് ആപ്പിന്റെ തുല്യമായ പുഷ് അനുമതി നൽകുകയുള്ളൂ.'
                  : 'Apple deliberately disabled the PushManager API inside regular Safari tabs to prevent spam web alerts. Apple exclusively grants push notification privileges to Web Apps installed to the iOS Home Screen (iOS 16.4+).'}
              </p>
            </div>

            {/* Q3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <BellOff className="w-3.5 h-3.5 text-amber-500" />
                {lang === 'ml'
                  ? 'നോട്ടിഫിക്കേഷൻ "Blocked" എന്ന് കാണിക്കുന്നു. എങ്ങനെ ശരിയാക്കാം?'
                  : 'My Notification Permission is stuck on "Blocked". How do I reset it?'}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lang === 'ml'
                  ? 'ബ്രൗസറിന്റെ അഡ്രസ് ബാറിലെ "ലോക്ക് (Lock)" അല്ലെങ്കിൽ "സെറ്റിംഗ്സ്" ഐക്കണിൽ ക്ലിക്ക് ചെയ്ത് Notifications എന്നത് "Allow" ആക്കുക. തുടർന്ന് പേജ് റീഫ്രഷ് ചെയ്യുക.'
                  : 'Web browsers do not allow websites to re-prompt once Blocked. Tap the Padlock icon on the left of your browser address bar > tap "Site Settings" (or Permissions) > set Notifications to "Allow" and reload the page.'}
              </p>
            </div>

            {/* Q4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'ml'
                  ? 'കുറച്ചു ദിവസങ്ങൾക്ക് ശേഷം ആൻഡ്രോയിഡിൽ നോട്ടിഫിക്കേഷൻ വൈകുന്നത് എന്തുകൊണ്ട്?'
                  : 'Why do notifications get delayed after a few days on Android?'}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {lang === 'ml'
                  ? 'സാംസങ്, ഷവോമി (MIUI), വൺപ്ലസ് ഫോണുകളിലെ അഗ്രസീവ് ബാറ്ററി മാനേജർ ക്രോമിനെ "Deep Sleep" ആക്കുന്നത് കൊണ്ടാണ്. ഫോൺ സെറ്റിംഗ്സിൽ പോയി ക്രോമിന്റെ ബാറ്ററി "Unrestricted" എന്ന് മാറ്റിയാൽ ഈ പ്രശ്നം പരിഹരിക്കപ്പെടും.'
                  : 'OEM battery managers put unused apps into deep sleep. To ensure critical emergency alerts never get delayed, set Chrome / Edge Battery mode to "Unrestricted" in your phone\'s Settings > Apps.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer CTA Bar ── */}
        <div className="p-6 rounded-3xl bg-slate-900 dark:bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-sm sm:text-base">
              {lang === 'ml' ? 'എല്ലാം തയ്യാറാണോ? നോട്ടിഫിക്കേഷൻ ഓൺ ആക്കൂ' : 'Ready to Receive Emergency Blood Alerts?'}
            </h4>
            <p className="text-xs text-slate-400">
              {lang === 'ml' 
                ? 'നിങ്ങളുടെ ചെറിയൊരു സഹായം ഒരു ജീവൻ രക്ഷിച്ചേക്കാം.' 
                : 'Your timely response to a nearby emergency request can save a life.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/settings"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
            >
              {lang === 'ml' ? 'സെറ്റിംഗ്സ് തുറക്കുക' : 'Open Settings'}
            </Link>
            <button
              onClick={handleTestPush}
              disabled={testPushLoading}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <BellRing className="w-3.5 h-3.5" />
              {lang === 'ml' ? 'ഇപ്പോൾ ടെസ്റ്റ് ചെയ്യുക' : 'Test Delivery Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

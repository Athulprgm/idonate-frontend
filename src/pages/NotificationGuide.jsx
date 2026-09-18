import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, BellRing, Smartphone, Apple, Laptop, Volume2, VolumeX,
  ArrowLeft, Check, X, ShieldAlert, Sparkles, Share2, Download,
  CheckCircle2, AlertCircle, Settings
} from 'lucide-react';
import pwaInstallManager from '../services/pwaInstallManager.js';
import { isPushSupported, getPermissionStatus, hasActiveSubscription, initPushNotifications } from '../services/webPushService.js';
import { requestNotificationPermission } from '../services/firebaseMessaging.js';
import { startEmergencySiren, stopEmergencySiren } from '../utils/sirenAudio.js';
import { useAppStore } from '../store/appStore.js';
import api from '../store/api.js';

export default function NotificationGuide() {
  const navigate = useNavigate();
  const { triggerToast } = useAppStore();

  const [activeTab, setActiveTab] = useState('android');
  const [lang, setLang] = useState('en');

  // Diagnostics
  const [permStatus, setPermStatus] = useState(() => getPermissionStatus());
  const [devicePlatform, setDevicePlatform] = useState('unknown');
  const [browserName, setBrowserName] = useState('browser');
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  // Test states
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);

  useEffect(() => {
    const plat = pwaInstallManager.platform || 'unknown';
    const brw = pwaInstallManager.browser || {};
    const installed = pwaInstallManager.isAppInstalled();

    setDevicePlatform(plat);
    setBrowserName(brw.name || 'browser');
    setIsStandalone(installed);
    setIsInAppBrowser(Boolean(brw.isInApp));
    setPermStatus(getPermissionStatus());

    if (plat === 'ios') setActiveTab('ios');
    else if (plat === 'android') setActiveTab('android');
    else if (plat === 'desktop') setActiveTab('desktop');
  }, []);

  const toggleSirenTest = async () => {
    if (isPlayingSiren) {
      stopEmergencySiren();
      setIsPlayingSiren(false);
      triggerToast(lang === 'ml' ? 'ശബ്ദം നിർത്തി' : 'Siren stopped', 'info');
    } else {
      try {
        setIsPlayingSiren(true);
        triggerToast(
          lang === 'ml' ? '🚨 എമർജൻസി സൈറൺ ടെസ്റ്റ് ചെയ്യുന്നു...' : '🚨 Testing Emergency Siren Audio...',
          'info'
        );
        const ctrl = await startEmergencySiren(0.8);
        if (ctrl.blocked) {
          triggerToast(
            lang === 'ml' ? 'ഓട്ടോപ്ലേ തടഞ്ഞു. സ്ക്രീനിൽ ടാപ്പ് ചെയ്യുക.' : 'Audio autoplay blocked. Tap screen to play.',
            'warning'
          );
        }
      } catch (e) {
        setIsPlayingSiren(false);
      }
    }
  };

  const handleTestPush = async () => {
    if (testPushLoading) return;
    setTestPushLoading(true);
    try {
      if (permStatus !== 'granted') {
        const ok = await requestNotificationPermission();
        setPermStatus(getPermissionStatus());
        if (!ok) {
          setTestPushLoading(false);
          triggerToast(
            lang === 'ml' ? 'ആദ്യം നോട്ടിഫിക്കേഷൻ Allow ചെയ്യുക' : 'Please allow notifications first',
            'warning'
          );
          return;
        }
      }

      await initPushNotifications();
      const res = await api.post('/notifications/test-web-push', { priority: 'immediate' });
      if (res.data?.success) {
        triggerToast(
          lang === 'ml' ? '🚨 ടെസ്റ്റ് നോട്ടിഫിക്കേഷൻ അയച്ചു!' : '🚨 Test notification sent to your device!',
          'success'
        );
      } else {
        triggerToast(res.data?.message || 'Could not send test push', 'error');
      }
    } catch (err) {
      triggerToast(
        err?.response?.data?.message || (lang === 'ml' ? 'നോട്ടിഫിക്കേഷൻ അയക്കാൻ കഴിഞ്ഞില്ല' : 'Failed to send test push'),
        'error'
      );
    } finally {
      setTestPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-20">
      {/* ── Minimal Header ── */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {lang === 'ml' ? 'നോട്ടിഫിക്കേഷൻ ഗൈഡ്' : 'Notification Guide'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {lang === 'ml' ? 'ആൻഡ്രോയിഡ്, ഐഫോൺ ഫീച്ചറുകളും പരിമിതികളും' : 'Android vs iOS support, siren alerts & setup'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setLang(l => l === 'en' ? 'ml' : 'en')}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'മലയാളം' : 'English'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 space-y-5">

        {/* ── Warning if opened inside WhatsApp / Instagram ── */}
        {isInAppBrowser && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {lang === 'ml'
                ? 'വാട്ട്‌സ്ആപ്പ്/ഇൻസ്റ്റാഗ്രാം ഇൻ-ആപ്പ് ബ്രൗസറിൽ പുഷ് നോട്ടിഫിക്കേഷൻ പ്രവർത്തിക്കില്ല. മുകളിലെ മൂന്ന് കുത്തുകളിൽ ക്ലിക്ക് ചെയ്ത് "Open in Chrome" അല്ലെങ്കിൽ "Open in Safari" തിരഞ്ഞെടുക്കുക.'
                : 'In-app browsers (WhatsApp / Instagram) block push notifications. Tap the top-right menu (⋮) and select "Open in Chrome" or "Open in Safari".'}
            </p>
          </div>
        )}

        {/* ── Compact Device Status Bar ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span className="capitalize">{devicePlatform}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="capitalize text-slate-600 dark:text-zinc-400">{browserName}</span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className={permStatus === 'granted' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {permStatus === 'granted' ? 'Alerts Active' : 'Not Enabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {isStandalone ? 'Installed as App' : 'Running in browser tab'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={toggleSirenTest}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isPlayingSiren
                  ? 'bg-red-600 border-red-600 text-white animate-pulse'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              {isPlayingSiren ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
              <span>{isPlayingSiren ? (lang === 'ml' ? 'നിർത്തുക' : 'Stop') : (lang === 'ml' ? 'സൈറൺ' : 'Test Sound')}</span>
            </button>

            <button
              onClick={handleTestPush}
              disabled={testPushLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <BellRing className={`w-3.5 h-3.5 ${testPushLoading ? 'animate-spin' : ''}`} />
              <span>{testPushLoading ? '...' : (lang === 'ml' ? 'ടെസ്റ്റ് പുഷ്' : 'Test Push')}</span>
            </button>
          </div>
        </div>

        {/* ── Segmented Platform Tabs ── */}
        <div className="flex p-1 bg-slate-200/80 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span>iPhone (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-blue-600" />
            <span>Desktop</span>
          </button>
        </div>

        {/* ── TAB CONTENT: ANDROID ── */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            {/* What Works & What Doesn't Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Works */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'ml' ? 'പ്രവർത്തിക്കുന്നവ' : 'What Works'}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Background Push:</strong> Arrives even when screen is locked or browser is closed.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Heads-up & Vibration:</strong> Banners pop over screen with custom emergency vibration.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Direct SOS:</strong> Tapping alert directly opens the emergency donor page.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Foreground Siren:</strong> Loud emergency siren plays when viewing the app.
                    </span>
                  </li>
                </ul>
              </div>

              {/* What Doesn't */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <X className="w-4 h-4 stroke-[3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'ml' ? 'പരിമിതികൾ (Restrictions)' : 'Limitations & Fixes'}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Locked Screen Siren:</strong> Android blocks continuous audio loops when locked. Standard chime rings; siren starts when tapped.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Battery Saver Mode:</strong> Samsung, MIUI & OnePlus can sleep Chrome. Set Chrome battery to <em>Unrestricted</em>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Incognito Tabs:</strong> Push notifications are disabled in private tabs.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Simple Step-by-step Setup */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {lang === 'ml' ? 'ആൻഡ്രോയിഡ് സെറ്റപ്പ് (3 ഘട്ടങ്ങൾ)' : 'Android Setup Checklist'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Allow Notifications</span>
                  <span>Tap "Allow" when Chrome prompts or from lock icon in URL bar.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Battery Unrestricted</span>
                  <span>Settings &gt; Apps &gt; Chrome &gt; Battery &gt; Unrestricted so alerts aren't delayed.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Pop on Screen</span>
                  <span>Enable "Pop on screen" in Chrome notifications for emergency banners.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: APPLE IOS (IPHONE) ── */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            {/* Essential iOS Rule Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Apple className="w-3.5 h-3.5" />
                {lang === 'ml' ? 'നിർബന്ധമായ കാര്യം: "Add to Home Screen"' : 'Required: "Add to Home Screen"'}
              </p>
              <p className="leading-relaxed">
                {lang === 'ml'
                  ? 'ആപ്പിൾ സഫാരി ബ്രൗസർ ടാബിൽ പുഷ് നോട്ടിഫിക്കേഷൻ തടഞ്ഞിരിക്കുന്നു. ഫോൺ സ്ക്രീനിൽ ആപ്പ് ആയി ആഡ് ചെയ്താൽ മാത്രമേ ഐഫോണിൽ നോട്ടിഫിക്കേഷൻ ലഭിക്കൂ.'
                  : 'Apple strictly disables PushManager inside regular Safari browser tabs. You MUST add iDonate to your iPhone Home Screen to receive blood request alerts.'}
              </p>
            </div>

            {/* What Works & What Doesn't on iOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Works */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'ml' ? 'ഹോം സ്ക്രീനിൽ പ്രവർത്തിക്കുന്നവ' : 'What Works (PWA)'}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Lock Screen Alerts:</strong> Standard iOS lock screen & notification center delivery (iOS 16.4+).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">App Badges:</strong> Red unread badge numbers update on the home screen icon.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">1-Tap SOS Open:</strong> Tapping banner opens directly to the emergency blood request.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Foreground Siren:</strong> High-intensity audio siren sounds when app is opened.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Limitations */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <X className="w-4 h-4 stroke-[3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    {lang === 'ml' ? 'ഐഫോൺ പരിമിതികൾ' : 'Apple Restrictions'}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Zero Push in Safari Tab:</strong> Only works after adding to Home Screen.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Older iOS:</strong> iOS 16.3 and below do not support web push.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">No Custom Vibration:</strong> Apple ignores Web Vibration API (uses iOS system tone).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">Focus / DND Mode:</strong> Silences alerts unless iDonate is whitelisted in Focus settings.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Easy 3-Step Setup for iPhone */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {lang === 'ml' ? 'ഐഫോൺ സെറ്റപ്പ് (3 ഘട്ടങ്ങൾ)' : 'iPhone Setup Steps'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Open in Safari</span>
                  <span>Ensure you are in Safari (not inside Instagram or Chrome on iOS).</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Add to Home Screen</span>
                  <span>Tap Share icon (box with arrow up) &gt; scroll and tap "Add to Home Screen".</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Open App & Allow</span>
                  <span>Launch iDonate from Home Screen and tap "Allow" for notifications.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: DESKTOP ── */}
        {activeTab === 'desktop' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {lang === 'ml' ? 'ഡെസ്ക്ടോപ്പ് (Windows & Mac)' : 'Desktop (Windows & macOS)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 text-slate-600 dark:text-zinc-300">
                <p className="font-bold text-slate-900 dark:text-white">Supported Features:</p>
                <p>• Native Windows Action Center & Mac Notification Center banners.</p>
                <p>• Clicking alert focuses current tab or opens emergency page.</p>
                <p>• Works directly in Chrome, Edge, and Firefox tabs.</p>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-zinc-300">
                <p className="font-bold text-slate-900 dark:text-white">Limitations:</p>
                <p>• If browser is completely Quit (Command+Q on Mac), push stops until re-opened.</p>
                <p>• Windows "Focus Assist" or macOS "Do Not Disturb" hides banners.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Minimal Comparison Table ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {lang === 'ml' ? 'താരതമ്യം (Quick Comparison)' : 'Feature Comparison'}
          </h4>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400">
                  <th className="py-2 pr-3 font-semibold">Feature</th>
                  <th className="py-2 px-2 font-semibold text-center">Android</th>
                  <th className="py-2 px-2 font-semibold text-center">iOS (Home Screen)</th>
                  <th className="py-2 pl-2 font-semibold text-center">iOS (Safari Tab)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                <tr>
                  <td className="py-2 pr-3 font-medium">Background Push</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes (16.4+)</td>
                  <td className="py-2 pl-2 text-center text-rose-500 font-bold">✕ No</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Requires Home Screen Install</td>
                  <td className="py-2 px-2 text-center text-slate-400">Optional</td>
                  <td className="py-2 px-2 text-center text-amber-600 font-bold">Mandatory</td>
                  <td className="py-2 pl-2 text-center text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Lock Screen Banners</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 pl-2 text-center text-rose-500 font-bold">✕ No</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Custom Vibration Motor</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 px-2 text-center text-slate-400">Default Tone</td>
                  <td className="py-2 pl-2 text-center text-rose-500 font-bold">✕ No</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Siren Sound on Open</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                  <td className="py-2 pl-2 text-center text-emerald-600 font-bold">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Minimal FAQ ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {lang === 'ml' ? 'പതിവ് സംശയങ്ങൾ (FAQ)' : 'Common Questions'}
          </h4>
          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {lang === 'ml' ? 'ലോക്ക് ആയിരിക്കുമ്പോൾ സൈറൺ തുടർച്ചയായി കേൾക്കാത്തത് എന്തുകൊണ്ട്?' : 'Why doesn\'t the siren loop while screen is locked?'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Both Android & iOS forbid background continuous audio synthesis when screen is off to preserve battery. The phone rings with notification tone + vibration, and the siren begins immediately when you tap the alert.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <p className="font-bold text-slate-900 dark:text-white">
                {lang === 'ml' ? 'പെർമിഷൻ "Blocked" ആയാൽ എങ്ങനെ ശരിയാക്കാം?' : 'How do I unblock notifications?'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Tap the padlock (🔒) icon next to the URL in your browser bar &gt; tap "Site Settings" (or Permissions) &gt; set Notifications to "Allow" and refresh the page.
              </p>
            </div>
          </div>
        </div>

        {/* ── Settings Action ── */}
        <div className="text-center pt-2">
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'ml' ? 'നോട്ടിഫിക്കേഷൻ സെറ്റിംഗ്സിലേക്ക് പോകുക' : 'Go to Notification Settings'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ShieldCheck,
  Search,
  Share2,
  CheckCircle2,
  Phone,
  ChevronRight,
  Droplet,
  Check,
  Printer,
  BadgeCheck,
  Volume2,
  Radio
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { playEmergencyAlertBurst, playNotificationChime } from '../utils/sirenAudio.js';

export default function UserManual() {
  const { triggerToast } = useAppStore();

  // Navigation & View Filters (Primarily Donors & Meghala Committee)
  const [role, setRole] = useState('donor'); // 'donor' | 'meghala'
  const [lang, setLang] = useState('both'); // 'en' | 'ml' | 'both'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Interactive Live Demos
  const [simAvailable, setSimAvailable] = useState(true);
  const [isPlayingAlert, setIsPlayingAlert] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Native Web Share or Clipboard
  const handleShareGuide = async () => {
    const url = window.location.origin + '/user-manual';
    const text = 'JeevaLink User Manual & Tutorial / ജീവലിങ്ക് ഉപയോക്തൃ സഹായി: ';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'JeevaLink User Manual', text, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(`${text}\n${url}`);
    setCopiedText(true);
    triggerToast('Guide link copied to clipboard!', 'success');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTestSound = async (type) => {
    if (isPlayingAlert) return;
    setIsPlayingAlert(true);
    if (type === 'burst') {
      triggerToast('🚨 Playing Emergency Siren (3.5s)...', 'info');
      await playEmergencyAlertBurst();
    } else {
      triggerToast('🔔 Playing Notification Chime...', 'info');
      playNotificationChime();
    }
    setTimeout(() => setIsPlayingAlert(false), 3800);
  };

  // Search Match Helper
  const matchesSearch = (textEn, textMl) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (textEn && textEn.toLowerCase().includes(q)) ||
      (textMl && textMl.toLowerCase().includes(q))
    );
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 font-sans antialiased selection:bg-red-500 selection:text-white pb-24">

      {/* ── MINIMAL TOP BAR ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 leading-none">User Manual</span>
              <span className="text-[10px] text-slate-500 block leading-none mt-0.5">സഹായി & നിർദ്ദേശങ്ങൾ</span>
            </div>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-2">
            {/* Language Pills */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLang('ml')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  lang === 'ml' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                മലയാളം
              </button>
              <button
                onClick={() => setLang('both')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  lang === 'both' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ദ്വിഭാഷ
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  lang === 'en' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={handleShareGuide}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Share"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">{copiedText ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* ── MINIMAL HERO ── */}
      <section className="pt-12 pb-8 px-5 max-w-2xl mx-auto text-center space-y-3">
        {/* App Squircle Icon */}
        <div className="inline-flex items-center justify-center mb-1">
          <div className="w-16 h-16 rounded-[22%] bg-white border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-2.5 flex items-center justify-center">
            <img
              src="/idonate.png"
              alt="JeevaLink Icon"
              className="w-full h-full object-contain rounded-[16%]"
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          How to Use JeevaLink
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {lang !== 'ml' && (
            <span>Step-by-step visual tutorial for Donors and Meghala Committee Volunteers.</span>
          )}
          {lang === 'both' && <span className="block my-0.5 text-slate-300"></span>}
          {lang !== 'en' && (
            <span className="block text-slate-600 font-medium">
              രക്തദാതാക്കൾക്കും മേഖല സമിതി വോളണ്ടിയർമാർക്കുമുള്ള ഔദ്യോഗിക ചിത്രസഹിത സഹായി.
            </span>
          )}
        </p>

        {/* Minimal Search Bar */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'ml' ? 'സഹായ വിഷയങ്ങൾ തിരയുക... (ലഭ്യത, പോസ്റ്റർ, പരിശോധന)' : 'Search topics... (availability, poster, verification)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── TWO CORE ROLES SEGMENTED CONTROL (DONORS & MEGHALA COMMITTEE) ── */}
      <section className="max-w-3xl mx-auto px-5 mb-8">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200/60">
          
          <button
            onClick={() => setRole('donor')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'donor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplet className="w-4 h-4 text-red-600 fill-current" />
            <div className="text-left">
              <span className="block text-xs font-bold leading-none">For Donors</span>
              <span className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">രക്തദാതാക്കൾക്ക്</span>
            </div>
          </button>

          <button
            onClick={() => setRole('meghala')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'meghala'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <div className="text-left">
              <span className="block text-xs font-bold leading-none">Meghala Committee</span>
              <span className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">മേഖലാ സമിതി (വോളണ്ടിയർമാർ)</span>
            </div>
          </button>

        </div>
      </section>

      {/* ── CONTENT CONTAINER ── */}
      <main className="max-w-3xl mx-auto px-5 space-y-6">

        {/* ============================================================ */}
        {/* TAB 1: DONOR GUIDE                                           */}
        {/* ============================================================ */}
        {role === 'donor' && (
          <div className="space-y-6">

            {/* Quick Flow Header */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Donor Lifecycle</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">രക്തദാതാവിന്റെ ദൗത്യക്രമം</h2>
                <p className="text-xs text-slate-500 mt-0.5">ലളിതമായ 4 ഘട്ടങ്ങളിലൂടെ ജീവൻ രക്ഷിക്കാം</p>
              </div>
              <Link
                to="/donor/dashboard"
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              >
                Open Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* STEP 1: Registration */}
            {matchesSearch('register profile blood group weight', 'രജിസ്ട്രേഷൻ പ്രൊഫൈൽ തൂക്കം') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">01</span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">Registration & Eligibility</h3>
                      <p className="text-[11px] text-slate-500">രജിസ്ട്രേഷനും ആരോഗ്യ മാനദണ്ഡങ്ങളും</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Verified</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Sign in using your mobile number and select your accurate <strong>Blood Group</strong>, <strong>District</strong>, <strong>Meghala</strong>, and <strong>Unit Squad</strong>.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്ത് രക്തഗ്രൂപ്പും പ്രദേശവും രേഖപ്പെടുത്തുക.</span>
                  )}
                </p>

                {/* Minimalist Visual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Min Weight</div>
                    <div className="text-xs font-bold text-slate-800">50 kg +</div>
                    <div className="text-[10px] text-slate-500">കുറഞ്ഞത് 50 കിലോ തൂക്കം</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Age Bracket</div>
                    <div className="text-xs font-bold text-slate-800">18 – 60 Years</div>
                    <div className="text-[10px] text-slate-500">18 മുതൽ 60 വയസ്സ് വരെ</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Safe Interval</div>
                    <div className="text-xs font-bold text-slate-800">90 – 120 Days</div>
                    <div className="text-[10px] text-slate-500">3 മുതൽ 4 മാസം ഇടവേള</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Real-time Availability Switch */}
            {matchesSearch('availability status toggle online switch', 'ലഭ്യത തയ്യാറാണ് ലഭ്യമാണ് സ്വിച്ച്') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">02</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Real-time Availability Switch</h3>
                    <p className="text-[11px] text-slate-500">ദാന ലഭ്യത ഓൺ / ഓഫ് ചെയ്യാം</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>On your <strong>Donor Dashboard</strong>, set your status to <strong>Available</strong> when ready to donate. If unwell, traveling, or on medication, toggle it to <strong>Unavailable</strong> to temporarily pause calls.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">രക്തം നൽകാൻ സാധിക്കുന്ന വേളകളിൽ <strong>Available</strong> ആക്കുക. യാത്രകളിലോ അസുഖ വേളകളിലോ <strong>Unavailable</strong> ആക്കി മാറ്റാം.</span>
                  )}
                </p>

                {/* Live Interactive Switch Demonstration */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${simAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {simAvailable ? 'Status: Available for Donation' : 'Status: Unavailable (Paused)'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {simAvailable ? 'ദാതാവായി തിരയലിൽ ലഭ്യമാണ്' : 'അടിയന്തര കോളുകൾ താൽക്കാലികമായി നിർത്തി'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSimAvailable(!simAvailable);
                      triggerToast(simAvailable ? 'Toggled: Unavailable' : 'Toggled: Available', 'info');
                    }}
                    className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      simAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <motion.div
                      className="bg-white w-5 h-5 rounded-full shadow-sm"
                      layout
                      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                      style={{ marginLeft: simAvailable ? 'auto' : '0' }}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Emergency Push Alerts & Audio */}
            {matchesSearch('emergency siren alert sound notification', 'അടിയന്തര സൈറൺ ശബ്ദം നോട്ടിഫിക്കേഷൻ') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">03</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Emergency Alerts & Siren</h3>
                    <p className="text-[11px] text-slate-500">അടിയന്തര സൈറൺ സന്ദേശങ്ങൾ</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>When an urgent blood request is verified in your area, an emergency notification and siren chime play so you never miss a life-saving moment.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">നിങ്ങളുടെ രക്തഗ്രൂപ്പ് ആവശ്യമുള്ള അടിയന്തരഘട്ടങ്ങളിൽ ഫോണിൽ പ്രത്യേക സൈറൺ സന്ദേശം ലഭിക്കും.</span>
                  )}
                </p>

                {/* Minimalist Phone Notification Mockup */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-red-600" />
                      <span>🚨 JEEVALINK EMERGENCY SOS</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Just now</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    B+ve Required (2 Units) • Medical College Hospital
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-700 font-medium">Verified by Meghala Committee</span>
                    <button
                      onClick={() => handleTestSound('burst')}
                      disabled={isPlayingAlert}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlayingAlert ? 'Playing...' : 'Test Sound'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Digital Donor Card */}
            {matchesSearch('card points certificate reward badge', 'ഡിജിറ്റൽ കാർഡ് സർട്ടിഫിക്കറ്റ് ബാഡ്ജ് പോയിന്റ്') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">04</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Digital Donor Card & Points</h3>
                    <p className="text-[11px] text-slate-500">ഡിജിറ്റൽ ഡോണർ കാർഡും അംഗീകാരവും</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Every completed donation is recorded in your profile, awarding <strong>Hero Points</strong> and a downloadable digital blood donor certificate.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">ഓരോ രക്തദാനവും പൂർത്തിയാകുമ്പോൾ പോയിന്റുകളും ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റും ലഭിക്കുന്നു.</span>
                  )}
                </p>

                {/* Minimal Donor Badge Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      O+
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Verified Blood Donor</div>
                      <div className="text-[11px] text-slate-500">Next eligible in: Ready Now</div>
                    </div>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MEGHALA COMMITTEE GUIDE                               */}
        {/* ============================================================ */}
        {role === 'meghala' && (
          <div className="space-y-6">

            {/* Quick Flow Header */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Committee Operations</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">മേഖലാ സമിതിയുടെ പ്രവർത്തനക്രമം</h2>
                <p className="text-xs text-slate-500 mt-0.5">അടിയന്തര ഘട്ടങ്ങളിൽ കൃത്യതയോടെ പ്രവർത്തിക്കാം</p>
              </div>
              <Link
                to="/volunteer/dashboard"
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              >
                Volunteer Desk <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* STEP 1: Request Verification */}
            {matchesSearch('verify request hospital fake bystander check', 'പരിശോധന വ്യാജം ആശുപത്രി അപേക്ഷ') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">01</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Request Verification</h3>
                    <p className="text-[11px] text-slate-500">അപേക്ഷകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തൽ</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Check newly submitted requests in the <strong>Pending Verification</strong> queue. Call the bystander or hospital to verify IP/OP number, unit count, and requirement time before broadcasting.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">പുതിയ അപേക്ഷകൾ പരിശോധിക്കാൻ ബൈസ്റ്റാൻഡറെ വിളിച്ച് ആശുപത്രി ഐപി നമ്പറും സമയവും ഉറപ്പുവരുത്തുക.</span>
                  )}
                </p>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>REQ #390 • Suresh Kumar</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">Pending</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">General Hospital, Ernakulam • Needed: 2 Units O-ve</div>
                  <div className="pt-1 flex gap-2">
                    <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">Approve & Broadcast</div>
                    <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">Reject</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Top 5 Smart Donor Matching */}
            {matchesSearch('top 5 donors match radius find algorithm', 'ടോപ്പ് 5 ദാതാക്കൾ കണ്ടെത്തൽ മാച്ച്') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">02</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Top 5 Smart Donor Matching</h3>
                    <p className="text-[11px] text-slate-500">ഏറ്റവും അടുത്ത 5 ദാതാക്കളെ കണ്ടെത്തൽ</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Click the <strong>"Top 5 Donors"</strong> button to immediately filter the nearest available compatible donors. Call or WhatsApp them with a single click.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium"><strong>"Top 5 Donors"</strong> ബട്ടൺ വഴി ഏറ്റവും അടുത്ത് ലഭ്യമായ 5 സന്നദ്ധ ദാതാക്കളെ ഉടൻ കണ്ടെത്താം.</span>
                  )}
                </p>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800">1. Vishnu Mohan (A+)</div>
                      <div className="text-[10px] text-slate-400">Available • 2.4 km away</div>
                    </div>
                    <div className="flex gap-1">
                      <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><Phone className="w-3.5 h-3.5" /></div>
                      <div className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">WA</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Auto WhatsApp Emergency Poster */}
            {matchesSearch('poster whatsapp template share image', 'പോസ്റ്റർ വാട്സാപ്പ് ഷെയർ ചിത്രം') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">03</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Instant WhatsApp Emergency Poster</h3>
                    <p className="text-[11px] text-slate-500">വാട്സാപ്പ് എമർജൻസി പോസ്റ്റർ നിർമ്മാണം</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Tap <strong>"Poster"</strong> on any request to generate a formatted emergency visual image with patient info and coordinator contact numbers for WhatsApp groups.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">ഓരോ അപേക്ഷയിലുമുള്ള <strong>"Poster"</strong> ബട്ടൺ അമർത്തി വാട്സാപ്പ് പോസ്റ്റർ നിമിഷങ്ങൾക്കുള്ളിൽ പങ്കുവെക്കാം.</span>
                  )}
                </p>

                <div className="p-3 bg-red-50 border border-red-200/60 rounded-2xl flex items-center justify-between text-xs text-red-900">
                  <div className="space-y-0.5">
                    <div className="font-bold">🚨 Urgent Blood Requirement Notice</div>
                    <div className="text-[11px] text-red-700">Patient • Hospital • Units • Committee Phone</div>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-red-600 px-2.5 py-1 rounded-lg shadow-2xs">Auto-Generated</span>
                </div>
              </div>
            )}

            {/* STEP 4: Mark Fulfilled */}
            {matchesSearch('fulfilled finish complete donation reward credit', 'പൂർത്തിയായി വിജയകരം അവസാനിപ്പിക്കുക ക്രെഡിറ്റ്') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">04</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Verify Donation & Mark Fulfilled</h3>
                    <p className="text-[11px] text-slate-500">ദാനം സ്ഥിരീകരിച്ച് അവസാനിപ്പിക്കൽ</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang !== 'ml' && (
                    <span>Once the donation is completed at the hospital blood bank, click <strong>"Mark Fulfilled"</strong>. This credits hero points to the donor and safely closes the public broadcast.</span>
                  )}
                  {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                  {lang !== 'en' && (
                    <span className="block text-slate-700 font-medium">ആശുപത്രിയിൽ രക്തദാനം പൂർത്തിയായ ശേഷം <strong>"Mark Fulfilled"</strong> അമർത്തുക. ഇത് അടിയന്തര സന്ദേശം അവസാനിപ്പിക്കുകയും ദാതാവിന് അംഗീകാരം നൽകുകയും ചെയ്യും.</span>
                  )}
                </p>

                <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Request closed safely & donor credited with verification badge.</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* MINIMAL FAQ ACCORDION                                        */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="text-[11px] text-slate-500">സാധാരണയായി ഉയരുന്ന സംശയങ്ങളും ഉത്തരങ്ങളും</p>
          </div>

          <div className="space-y-2">
            
            {/* FAQ 1 */}
            <div className="border border-slate-200/70 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <span>Why didn't I receive sound alerts on my phone? / ശബ്ദം കേൾക്കാത്തത് എന്തുകൊണ്ട്?</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openFaq === 1 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>
                    Please ensure you granted <strong>Notification Permission</strong> and added JeevaLink to your Home Screen. Check the <Link to="/notification-guide" className="text-red-600 font-bold underline">Notification Guide</Link> to turn off battery optimization restrictions on Samsung, Xiaomi, or iPhone devices.
                  </p>
                  <p className="text-slate-700 font-medium">
                    ആൻഡ്രോയിഡ് / ഐഫോൺ ബാറ്ററി സേവർ നോട്ടിഫിക്കേഷൻ തടസ്സപ്പെടുത്താതിരിക്കാൻ നോട്ടിഫിക്കേഷൻ അനുമതി ഉറപ്പാക്കുക.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-slate-200/70 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <span>How to join as a Meghala Volunteer? / മേഖല സമിതിയിൽ എങ്ങനെ ചേരാം?</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openFaq === 2 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>
                    Register as a member first, then connect with your District Admin or Block Committee. Upon verification, your role will be upgraded to <strong>Meghala Volunteer</strong> with full dashboard coordination access.
                  </p>
                  <p className="text-slate-700 font-medium">
                    അക്കൗണ്ട് എടുത്ത ശേഷം ജില്ലാ അഡ്മിനെയോ ബ്ലോക്ക് സമിതിയെയോ ബന്ധപ്പെടുക. പരിശോധനയ്ക്ക് ശേഷം മേഖല വോളണ്ടിയർ റോൾ ലഭിക്കും.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-slate-200/70 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <span>Is my phone number publicly visible? / ഫോൺ നമ്പർ പരസ്യമാണോ?</span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openFaq === 3 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p>
                    No. JeevaLink protects donor privacy. Only verified Meghala Committee volunteers can access donor contact numbers during verified active emergencies.
                  </p>
                  <p className="text-slate-700 font-medium">
                    അല്ല. അംഗീകൃത മേഖലാ സമിതി വോളണ്ടിയർമാർക്ക് മാത്രമേ അടിയന്തര ഘട്ടങ്ങളിൽ ദാതാക്കളെ നേരിട്ട് ബന്ധപ്പെടാൻ അനുമതിയുള്ളൂ.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}

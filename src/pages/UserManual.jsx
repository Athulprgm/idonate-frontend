import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Heart,
  ShieldCheck,
  Smartphone,
  Users,
  Search,
  Share2,
  CheckCircle2,
  Bell,
  Phone,
  ArrowRight,
  ChevronRight,
  Download,
  AlertTriangle,
  Sparkles,
  Droplet,
  Compass,
  HelpCircle,
  Activity,
  FileText,
  Check,
  Copy,
  Printer,
  Clock,
  Award,
  Zap,
  Building2,
  Calendar,
  BadgeCheck,
  Layers,
  Send,
  MessageSquare,
  Volume2,
  Radio,
  ExternalLink,
  Info,
  CheckCircle,
  Globe2,
  Sliders,
  Play
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { playEmergencyAlertBurst, playNotificationChime } from '../utils/sirenAudio.js';

// Blood Compatibility Matrix for interactive lookup
const BLOOD_COMPATIBILITY = {
  'O-': { canGive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceive: ['O-'], labelEn: 'Universal Red Cell Donor', labelMl: 'സാർവ്വത്രിക ദാതാവ്' },
  'O+': { canGive: ['O+', 'A+', 'B+', 'AB+'], canReceive: ['O+', 'O-'], labelEn: 'Most Needed in Emergencies', labelMl: 'അടിയന്തര ഘട്ടങ്ങളിൽ അത്യാവശ്യം' },
  'A-': { canGive: ['A-', 'A+', 'AB-', 'AB+'], canReceive: ['A-', 'O-'], labelEn: 'Rare Negative Group', labelMl: 'അപൂർവ്വ നെഗറ്റീവ് ഗ്രൂപ്പ്' },
  'A+': { canGive: ['A+', 'AB+'], canReceive: ['A+', 'A-', 'O+', 'O-'], labelEn: 'Common Compatible Group', labelMl: 'സാധാരണ രക്തഗ്രൂപ്പ്' },
  'B-': { canGive: ['B-', 'B+', 'AB-', 'AB+'], canReceive: ['B-', 'O-'], labelEn: 'Rare Negative Group', labelMl: 'അപൂർവ്വ നെഗറ്റീവ് ഗ്രൂപ്പ്' },
  'B+': { canGive: ['B+', 'AB+'], canReceive: ['B+', 'B-', 'O+', 'O-'], labelEn: 'High Demand in Kerala', labelMl: 'കേരളത്തിൽ ഉയർന്ന ആവശ്യം' },
  'AB-': { canGive: ['AB-', 'AB+'], canReceive: ['AB-', 'A-', 'B-', 'O-'], labelEn: 'Very Rare Group', labelMl: 'അതി അപൂർവ്വ ഗ്രൂപ്പ്' },
  'AB+': { canGive: ['AB+'], canReceive: ['All Groups / Universal Recipient'], labelEn: 'Universal Recipient', labelMl: 'സാർവ്വത്രിക സ്വീകർത്താവ്' },
};

export default function UserManual() {
  const { triggerToast } = useAppStore();

  // Primary States
  const [role, setRole] = useState('donor'); // 'donor' | 'meghala' | 'public' | 'simulator'
  const [lang, setLang] = useState('both'); // 'en' | 'ml' | 'both'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Interactive Simulator States
  const [simAvailable, setSimAvailable] = useState(true);
  const [simBlood, setSimBlood] = useState('O+');
  const [isPlayingAlert, setIsPlayingAlert] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Share Guide Handler
  const handleShareGuide = async () => {
    const url = window.location.origin + '/user-manual';
    const text = 'JeevaLink Official User Manual & Interactive Guide / ജീവലിങ്ക് ഉപയോക്തൃ സഹായി: ';
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
    triggerToast('Guide link copied to clipboard! ലിങ്ക് കോപ്പി ചെയ്തു.', 'success');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Print Guide
  const handlePrint = () => {
    window.print();
  };

  // Play Siren Simulator
  const handleTestSound = async (type) => {
    if (isPlayingAlert) return;
    setIsPlayingAlert(true);
    if (type === 'burst') {
      triggerToast('🚨 Playing Emergency SOS Alert Burst (3.5s)...', 'info');
      await playEmergencyAlertBurst();
    } else {
      triggerToast('🔔 Playing Notification Chime...', 'info');
      playNotificationChime();
    }
    setTimeout(() => setIsPlayingAlert(false), 3800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-red-500 selection:text-white pb-32">

      {/* ── TOP NAV BAR & CONTROLS (APPLE / GOOGLE INSPIRED) ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-sm shadow-red-500/20 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">JeevaLink Guide</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/60 rounded-full">v2.0</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                ഉപയോക്തൃ സഹായി & മാർഗ്ഗനിർദ്ദേശങ്ങൾ
              </p>
            </div>
          </div>

          {/* Quick Language Toggle & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Language Switcher Pill */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-xs font-semibold">
              <button
                onClick={() => setLang('ml')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  lang === 'ml' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="മലയാളത്തിൽ മാത്രം"
              >
                മലയാളം
              </button>
              <button
                onClick={() => setLang('both')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  lang === 'both' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="മലയാളവും ഇംഗ്ലീഷും (Bilingual)"
              >
                ദ്വിഭാഷ (Both)
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  lang === 'en' ? 'bg-white text-red-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English Only"
              >
                English
              </button>
            </div>

            {/* Quick Share & Print */}
            <button
              onClick={handleShareGuide}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Share Guide / പങ്കുവെക്കാം"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden md:inline">{copiedText ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Print Manual"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER: APPLE / SAMSUNG ONE UI STYLE ── */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4 sm:px-6">
        {/* Glow gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-red-500/10 to-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Smart Step-by-Step Platform Manual</span>
            <span className="text-slate-300">•</span>
            <span className="text-red-600 font-extrabold">JeevaLink iDonate</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How to Use JeevaLink
            <span className="block text-2xl sm:text-4xl mt-1 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700 font-extrabold">
              പോർട്ടൽ ഉപയോഗിക്കേണ്ട വിധം
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {lang !== 'ml' && (
              <span className="block">
                Comprehensive illustrated manual designed for Donors, Meghala Committees, and emergency blood seekers across Kerala.
              </span>
            )}
            {lang !== 'en' && (
              <span className="block mt-1 font-medium text-slate-700">
                രക്തദാതാക്കൾക്കും മേഖല സമിതി വോളണ്ടിയർമാർക്കും വേണ്ടിയുള്ള സമ്പൂർണ്ണ ചിത്രസഹിത ഗൈഡ്.
              </span>
            )}
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={lang === 'ml' ? 'സഹായ വിഷയങ്ങൾ തിരയുക... (ഉദാ: ലഭ്യത, പോസ്റ്റർ, SOS, പരിശോധന)' : 'Search topics... (e.g. availability, poster, emergency siren, top 5)'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLE SELECTOR: APPLE SEGMENTED CONTROL ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1 shadow-inner">
          
          <button
            onClick={() => setRole('donor')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'donor'
                ? 'bg-white text-red-600 shadow-sm shadow-slate-400/20 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Droplet className="w-4 h-4 fill-current text-red-600" />
            <div className="text-left">
              <span className="block leading-none">For Donors</span>
              <span className="text-[10px] font-medium opacity-80">രക്തദാതാക്കൾക്ക്</span>
            </div>
          </button>

          <button
            onClick={() => setRole('meghala')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'meghala'
                ? 'bg-white text-blue-700 shadow-sm shadow-slate-400/20 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <div className="text-left">
              <span className="block leading-none">Meghala Committee</span>
              <span className="text-[10px] font-medium opacity-80">മേഖലാ സമിതി</span>
            </div>
          </button>

          <button
            onClick={() => setRole('public')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'public'
                ? 'bg-white text-emerald-700 shadow-sm shadow-slate-400/20 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <span className="block leading-none">Emergency Blood</span>
              <span className="text-[10px] font-medium opacity-80">രോഗികൾക്ക് / SOS</span>
            </div>
          </button>

          <button
            onClick={() => setRole('simulator')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'simulator'
                ? 'bg-white text-purple-700 shadow-sm shadow-slate-400/20 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <div className="text-left">
              <span className="block leading-none">Live Simulator</span>
              <span className="text-[10px] font-medium opacity-80">പരിശീലനം</span>
            </div>
          </button>

        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">

        {/* ============================================================ */}
        {/* TAB 1: FOR DONORS (രക്തദാതാക്കൾക്ക്)                           */}
        {/* ============================================================ */}
        {role === 'donor' && (
          <div className="space-y-10">

            {/* Quick Flowchart Summary */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-950/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest font-extrabold text-red-200">The Donor Journey</span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1">രക്തദാതാവിന്റെ ദൗത്യക്രമം</h2>
                </div>
                <Link
                  to="/donor/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl text-xs font-bold shadow hover:bg-red-50 transition-colors"
                >
                  Go to Donor Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Graphical Process Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">1</div>
                  <h4 className="font-bold text-sm">Register & Verify</h4>
                  <p className="text-[11px] text-red-100 mt-1 font-medium">രക്തഗ്രൂപ്പും മേഖലയും ചേർക്കുക</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">2</div>
                  <h4 className="font-bold text-sm">Set Availability</h4>
                  <p className="text-[11px] text-red-100 mt-1 font-medium">ദാനത്തിന് സദാ സന്നദ്ധമാവുക</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">3</div>
                  <h4 className="font-bold text-sm">Receive SOS Alert</h4>
                  <p className="text-[11px] text-red-100 mt-1 font-medium">അടിയന്തര സൈറൺ സന്ദേശം</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">4</div>
                  <h4 className="font-bold text-sm">Donate & Earn Badge</h4>
                  <p className="text-[11px] text-red-100 mt-1 font-medium">ജീവൻ രക്ഷിച്ച് പോയിന്റുകൾ</p>
                </div>
              </div>
            </div>

            {/* STEP 1: Registration & Profile Verification */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-black">
                  01
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 1: Registration & Profile Setup
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">രജിസ്ട്രേഷനും പ്രൊഫൈൽ ക്രമീകരണവും</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        Join the JeevaLink network using your mobile number. Enter accurate details including your <strong>Blood Group</strong>, <strong>District</strong>, <strong>Meghala</strong>, and <strong>Unit Squad</strong>.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകി ജീവലിങ്കിൽ ലോഗിൻ ചെയ്യുക. കൃത്യമായ രക്തഗ്രൂപ്പ്, ജില്ല, മേഖല, യൂണിറ്റ് സമിതി എന്നിവ തിരഞ്ഞെടുക്കുക.
                      </span>
                    )}
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Weight Criteria:</strong> Must be at least 50 kg (50 കിലോഗ്രാമിൽ കൂടുതൽ തൂക്കം വേണം).</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Age Limit:</strong> 18 to 60 years of age (18 മുതൽ 60 വയസ്സ് വരെ).</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Donation Interval:</strong> 90 days for men, 120 days for women (പുരുഷന്മാർ 3 മാസവും സ്ത്രീകൾ 4 മാസവും ഇടവേള നൽകണം).</span>
                    </div>
                  </div>
                </div>

                {/* Pictorial UI Card: Profile Mockup */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-inner space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                          O+
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">Donor Profile</div>
                          <div className="text-[10px] text-slate-400">ID: JL-98421</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Verified</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase">Meghala</span>
                        <span className="font-semibold text-slate-800">Thrissur Town</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase">Last Donated</span>
                        <span className="font-semibold text-slate-800">4 Months ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: The Availability Switch (Crucial Feature) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                  02
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 2: Real-time Availability Switch
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">രക്തദാന ലഭ്യത ഓൺ / ഓഫ് ചെയ്യാം</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        On your <strong>Donor Dashboard</strong>, you have a 1-tap availability toggle. When set to <strong>Available</strong>, Meghala volunteers can see you in emergency searches. If you are unwell, traveling, or recently donated, turn it to <strong>Unavailable</strong> to stop emergency calls.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        നിങ്ങൾക്ക് രക്തം നൽകാൻ സാധിക്കുന്ന സമയങ്ങളിൽ ഇത് <strong>Available (ലഭ്യമാണ്)</strong> ആക്കി വെയ്ക്കുക. അസുഖമോ യാത്രയോ മറ്റ് കാരണങ്ങളോ ഉണ്ടെങ്കിൽ <strong>Unavailable (ലഭ്യമല്ല)</strong> ആക്കി മാറ്റാം.
                      </span>
                    )}
                  </p>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Why this matters:</strong> Keeping your status accurate ensures hospitals and families do not call busy or ineligible donors during golden-hour medical emergencies.
                    </div>
                  </div>
                </div>

                {/* Pictorial UI Card: Interactive Toggle Simulation */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Live UI Component Preview</div>
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${simAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          {simAvailable ? 'Available for Donation' : 'Currently Unavailable'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {simAvailable ? 'ദാനത്തിന് തയ്യാറാണ്' : 'ഇപ്പോൾ ലഭ്യമല്ല'}
                        </div>
                      </div>

                      {/* Animated Switch Button */}
                      <button
                        onClick={() => {
                          setSimAvailable(!simAvailable);
                          triggerToast(`Simulated status: ${!simAvailable ? 'Available' : 'Unavailable'}`, 'info');
                        }}
                        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                          simAvailable ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                        title="Click to toggle test"
                      >
                        <motion.div
                          className="bg-white w-6 h-6 rounded-full shadow-md"
                          layout
                          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                          style={{ marginLeft: simAvailable ? 'auto' : '0' }}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">☝️ Tap the switch above to try how it changes on your screen.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Emergency Siren & Push Alerts */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-black">
                  03
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 3: Emergency Alerts & Siren Notification
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">അടിയന്തര രക്ത സന്ദേശങ്ങളും സൈറണും</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        When a patient in your area needs your blood type immediately, your device triggers an emergency alert chime or siren with full patient details, required hospital, and units needed.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        നിങ്ങളുടെ രക്തഗ്രൂപ്പിന് അനുയോജ്യമായ അടിയന്തര ആവശ്യം നിങ്ങളുടെ പ്രദേശത്ത് റിപ്പോർട്ട് ചെയ്യപ്പെടുമ്പോൾ ഫോണിൽ പ്രത്യേക സൈറൺ ശബ്ദത്തോടെ നോട്ടിഫിക്കേഷൻ ലഭിക്കും.
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleTestSound('burst')}
                      disabled={isPlayingAlert}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPlayingAlert ? 'Playing Sound...' : 'Test Emergency Siren (ശബ്ദം കേൾക്കൂ)'}</span>
                    </button>
                    <button
                      onClick={() => handleTestSound('chime')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Test Chime</span>
                    </button>
                  </div>
                </div>

                {/* Pictorial UI Card: Smartphone Lockscreen Push Alert */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl relative">
                    <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
                    
                    {/* Simulated Notification Card */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-md border border-red-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-extrabold text-red-600">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          <span>🚨 URGENT BLOOD ALERT</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Just now</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        O+ve Required (2 Units)
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Medical College Hospital, Thrissur</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified by Meghala</span>
                        <span className="font-bold text-red-600">Tap to respond →</span>
                      </div>
                    </div>

                    <div className="mt-2 text-center text-[10px] text-slate-500">
                      Lockscreen Notification Banner
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Digital Donor Card & Recognition */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black">
                  04
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 4: Digital Donor Card & Hero Points
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">ഡിജിറ്റൽ ഡോണർ കാർഡും അംഗീകാരവും</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        Every completed blood donation verified by the Meghala committee awards you <strong>Hero Points</strong>, updates your lifetime donation counter, and automatically issues a downloadable digital donor certificate.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        ഓരോ രക്തദാനവും പൂർത്തിയാകുമ്പോൾ നിങ്ങളുടെ പ്രൊഫൈലിൽ പോയിന്റുകൾ ലഭിക്കുകയും ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റ് ലഭിക്കുകയും ചെയ്യും.
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Digital certificates can be presented for academic or social recognition.</span>
                  </div>
                </div>

                {/* Pictorial UI Card: Digital Donor Badge */}
                <div className="lg:col-span-5">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-lg border border-slate-700 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Kerala Blood Hero</div>
                        <div className="text-lg font-black mt-0.5">Rahul Vijayan</div>
                        <div className="text-xs text-slate-300">Aluva Meghala</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-black shadow-md shadow-red-950/30">
                        B+
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Donations</span>
                        <span className="font-black text-amber-400">8 Times (Saved 24 Lives)</span>
                      </div>
                      <BadgeCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: FOR MEGHALA COMMITTEE (മേഖലാ സമിതി വോളണ്ടിയർമാർക്ക്)  */}
        {/* ============================================================ */}
        {role === 'meghala' && (
          <div className="space-y-10">

            {/* Quick Flowchart Summary for Volunteers */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest font-extrabold text-blue-300">Meghala Volunteer Protocol</span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1">മേഖലാ സമിതിയുടെ പ്രവർത്തനക്രമം</h2>
                </div>
                <Link
                  to="/volunteer/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-900 rounded-xl text-xs font-bold shadow hover:bg-blue-50 transition-colors"
                >
                  Go to Volunteer Desk <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 4 Committee Action Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">1</div>
                  <h4 className="font-bold text-sm">Verify Request</h4>
                  <p className="text-[11px] text-blue-200 mt-1 font-medium">ആശുപത്രിയും രേഖകളും ഉറപ്പാക്കുക</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">2</div>
                  <h4 className="font-bold text-sm">Top 5 Donor Match</h4>
                  <p className="text-[11px] text-blue-200 mt-1 font-medium">ഏറ്റവും അടുത്ത 5 ദാതാക്കളെ എടുക്കുക</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">3</div>
                  <h4 className="font-bold text-sm">Generate Poster</h4>
                  <p className="text-[11px] text-blue-200 mt-1 font-medium">വാട്സാപ്പ് പോസ്റ്റർ പങ്കുവെക്കുക</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-2">4</div>
                  <h4 className="font-bold text-sm">Mark Fulfilled</h4>
                  <p className="text-[11px] text-blue-200 mt-1 font-medium">ദാനം സ്ഥിരീകരിച്ച് അവസാനിപ്പിക്കുക</p>
                </div>
              </div>
            </div>

            {/* STEP 1: Verification Check */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black">
                  01
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 1: Emergency Blood Request Verification
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">വ്യാജ അഭ്യർത്ഥനകൾ തടയാൻ കർശന പരിശോധന</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        When a blood request is submitted, it appears in the <strong>Pending Verification</strong> tab. As a Meghala committee member, you must call the bystander or hospital to verify:
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        ഒരു പുതിയ രക്ത ആവശ്യം വരുമ്പോൾ അത് <strong>Pending Verification</strong> ടാബിൽ കാണാം. മേഖല കമ്മിറ്റി അംഗം ബൈസ്റ്റാൻഡറെയോ ആശുപത്രിയെയോ വിളിച്ച് താഴെ പറയുന്നവ ഉറപ്പുവരുത്തണം:
                      </span>
                    )}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>Hospital IP / OP Number:</strong> Confirm the patient is truly admitted.</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>Required Units & Time:</strong> Ensure required quantity and emergency deadline.</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>One-Click Approval:</strong> Click "Approve & Broadcast" to trigger emergency sirens to registered donors.</span>
                    </div>
                  </div>
                </div>

                {/* Pictorial UI Card: Volunteer Verification UI */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Pending Request #REQ-402</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Needs Review</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="font-bold text-red-600">Patient: Suresh Babu (IP: 99312)</div>
                      <div className="text-slate-600">Hospital: Aster Medcity, Kochi</div>
                      <div className="text-slate-500 text-[11px]">Needed: 2 Units • O-ve (Urgent Surgery)</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center">
                        ✓ Verify & Broadcast
                      </div>
                      <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold text-center">
                        Reject
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Top 5 Smart Donor Matching */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black">
                  02
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 2: Smart Top 5 Donor Matcher
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">ഏറ്റവും അനുയോജ്യരായ 5 ദാതാക്കളെ ഓട്ടോമാറ്റിക്കായി കണ്ടെത്തൽ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        Clicking the <strong>"Top 5 Donors"</strong> button on any request executes JeevaLink's intelligent matching algorithm. It filters for donors in the patient's Meghala/District who have the compatible blood type and have their availability toggled to <strong>Available</strong>.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        ഓരോ അപേക്ഷയ്ക്കും താഴെയുള്ള <strong>"Top 5 Donors"</strong> ബട്ടൺ അമർത്തുമ്പോൾ, ആ പ്രദേശത്തെ ഏറ്റവും വേഗത്തിൽ എത്താൻ കഴിയുന്ന 5 സന്നദ്ധ ദാതാക്കളെ കാണാൻ സാധിക്കും.
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Volunteers can immediately click <strong>Call</strong> or <strong>WhatsApp</strong> from this dialog to coordinate their arrival at the blood bank.
                  </p>
                </div>

                {/* Pictorial UI Card: Top 5 Matching Dialog */}
                <div className="lg:col-span-5">
                  <div className="bg-white border-2 border-indigo-100 rounded-2xl p-4 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                      <span>🎯 Top Matched Donors</span>
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Unit Matched</span>
                    </div>

                    {/* Donor 1 */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-slate-800">1. Amal Krishna (O-)</div>
                        <div className="text-[10px] text-slate-500">Distance: 3.2 km • Ready now</div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                          WA
                        </div>
                      </div>
                    </div>

                    {/* Donor 2 */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-slate-800">2. Praveen K (O-)</div>
                        <div className="text-[10px] text-slate-500">Distance: 5.8 km • Ready now</div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                          WA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Instant Emergency WhatsApp Poster */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                  03
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 3: Instant WhatsApp Emergency Poster Generator
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">തത്സമയ വാട്സാപ്പ് എമർജൻസി പോസ്റ്റർ നിർമ്മാണം</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        No need to create posters in editing apps. Simply tap <strong>"Poster"</strong> on any verified emergency request. JeevaLink generates a high-definition, formatted emergency notice with patient name, hospital, blood group, required units, and committee contact numbers.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        പോസ്റ്ററുകൾ ഡിസൈൻ ചെയ്യാൻ സമയം കളയേണ്ടതില്ല. ഓരോ അപേക്ഷയിലുമുള്ള <strong>"Poster"</strong> ബട്ടൺ അമർത്തുമ്പോൾ ജീവലിങ്ക് കൃത്യമായ വാട്സാപ്പ് പോസ്റ്റർ ഓട്ടോമാറ്റിക്കായി നിർമ്മിച്ച് തരും.
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200/60">
                    <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One-tap button to directly download the poster image or share the emergency text to WhatsApp groups.</span>
                  </div>
                </div>

                {/* Pictorial UI Card: Poster Preview Mockup */}
                <div className="lg:col-span-5">
                  <div className="bg-gradient-to-b from-red-700 to-red-900 text-white p-4 rounded-2xl shadow-xl border-2 border-red-500/50 space-y-2 text-center">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest bg-black/30 py-0.5 rounded">
                      🚨 URGENT BLOOD REQUIREMENT / അടിയന്തരം
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white text-red-700 mx-auto flex items-center justify-center font-black text-2xl shadow-md">
                      B+
                    </div>
                    <div className="font-bold text-sm">Patient: Baby of Anjana</div>
                    <div className="text-xs text-red-100">Lakeshore Hospital, Ernakulam</div>
                    <div className="text-[11px] bg-red-800/80 p-1.5 rounded-lg border border-red-400/30">
                      Coordinated by: Aluva Meghala Committee
                      <div className="font-bold text-amber-300 mt-0.5">📞 9846000000 / 9447000000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: Fulfill & Close Request */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-black">
                  04
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Step 4: Verify Donation & Mark as Fulfilled
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">രക്തദാനം പൂർത്തിയാക്കി രേഖപ്പെടുത്തൽ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {lang !== 'ml' && (
                      <span>
                        Once the donor donates blood at the hospital, click <strong>"Mark Fulfilled"</strong> on your volunteer desk. Select the donor who gave blood so they receive their recognition badge, and the emergency broadcast is safely closed across all platforms.
                      </span>
                    )}
                    {lang === 'both' && <span className="block my-1 text-slate-300">───</span>}
                    {lang !== 'en' && (
                      <span className="block text-slate-700 font-medium">
                        ആശുപത്രിയിൽ രക്തദാനം വിജയകരമായി പൂർത്തിയായ ശേഷം <strong>"Mark Fulfilled"</strong> അമർത്തുക. രക്തം നൽകിയ ദാതാവിനെ തിരഞ്ഞെടുക്കുക. ഇതോടെ അടിയന്തര സന്ദേശം സ്വമേധയാ അവസാനിക്കുകയും ദാതാവിന് സർട്ടിഫിക്കറ്റ് ലഭിക്കുകയും ചെയ്യും.
                      </span>
                    )}
                  </p>
                </div>

                {/* Pictorial UI Card: Fulfilled Badge */}
                <div className="lg:col-span-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div className="text-xs font-black text-emerald-900">Request Successfully Fulfilled</div>
                    <div className="text-[11px] text-emerald-700">Donor credited with +50 Hero Points</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EMERGENCY BLOOD SEEKER / PUBLIC GUIDE                  */}
        {/* ============================================================ */}
        {role === 'public' && (
          <div className="space-y-10">

            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200">For Patients & Bystanders</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">രോഗികൾക്കും കൂട്ടിരിപ്പുകാർക്കുമുള്ള മാർഗ്ഗരേഖ</h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
                ആശുപത്രിയിൽ അടിയന്തരമായി രക്തം ആവശ്യമുള്ള ഘട്ടങ്ങളിൽ എങ്ങനെ സൗജന്യമായി സേവനം ലഭ്യമാക്കാം എന്ന് മനസ്സിലാക്കൂ.
              </p>
            </div>

            {/* Quick Request Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900">Submit Emergency Request</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Go to <Link to="/emergency-request" className="text-red-600 font-bold underline">Emergency Request</Link>. Enter Patient Name, Blood Group, Required Units, Hospital, and Bystander Phone number.
                </p>
                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  രോഗിയുടെ പേരും ആശുപത്രിയും രക്തഗ്രൂപ്പും നൽകി അപേക്ഷ സമർപ്പിക്കുക.
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900">Meghala Verification Call</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The local Meghala volunteer committee will call your number within minutes to confirm details and verify hospital admission.
                </p>
                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  മേഖലാ സമിതി വോളണ്ടിയർ നിങ്ങളെ വിളിച്ച് ആവശ്യങ്ങൾ ഉറപ്പുവരുത്തും.
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900">Donor Hospital Arrival</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verified donors from the nearest unit will be connected directly to your bystander and arrive at the hospital blood bank.
                </p>
                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  അടുത്തുള്ള രക്തദാതാവ് ആശുപത്രിയിലെത്തി രക്തം നൽകും.
                </div>
              </div>

            </div>

            {/* Direct Contact Meghala Directory Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Need Immediate Help Right Now?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access the direct contact phone numbers of all verified Meghala Committee coordinators across Kerala districts.
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  കേരളത്തിലെ മുഴുവൻ മേഖല സമിതി കോർഡിനേറ്റർമാരുടെയും ഫോൺ നമ്പറുകൾ കാണാം.
                </p>
              </div>
              <Link
                to="/volunteer-directory"
                className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide uppercase flex items-center gap-2 shadow-lg shadow-red-600/30 shrink-0 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Open Volunteer Directory</span>
              </Link>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: INTERACTIVE SIMULATOR & TOOLS                         */}
        {/* ============================================================ */}
        {role === 'simulator' && (
          <div className="space-y-10">

            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <span className="text-xs uppercase tracking-widest font-extrabold text-purple-300">Live Interactive Lab</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">തത്സമയ പരിശീലന കേന്ദ്രം (Interactive Simulator)</h2>
              <p className="text-xs sm:text-sm text-purple-200 mt-2 max-w-2xl leading-relaxed">
                Test and experience real JeevaLink features before using them live. Check blood compatibility, test alert audio, and generate sample WhatsApp emergency text.
              </p>
            </div>

            {/* TOOL 1: Blood Compatibility Explorer */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Blood Compatibility Explorer</h3>
                  <p className="text-xs text-slate-500 font-medium">രക്തഗ്രൂപ്പ് പൊരുത്തം തത്സമയം പരിശോധിക്കാം</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(BLOOD_COMPATIBILITY).map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setSimBlood(grp)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        simBlood === grp
                          ? 'bg-red-600 text-white shadow-xs scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compatibility Result Box */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                      {simBlood}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {BLOOD_COMPATIBILITY[simBlood].labelEn}
                      </div>
                      <div className="text-xs text-red-600 font-semibold">
                        {BLOOD_COMPATIBILITY[simBlood].labelMl}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Can Give Blood To (ആർക്കൊക്കെ നൽകാം)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {BLOOD_COMPATIBILITY[simBlood].canGive.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Can Receive Blood From (ആരിൽ നിന്നൊക്കെ സ്വീകരിക്കാം)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {BLOOD_COMPATIBILITY[simBlood].canReceive.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOOL 2: Emergency Alert Sound Simulator */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Emergency Alert Tone Simulator</h3>
                <p className="text-xs text-slate-500 font-medium">സൈറണും ശബ്ദ സന്ദേശങ്ങളും മുൻകൂട്ടി കേട്ടു മനസ്സിലാക്കൂ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Immediate SOS Siren</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Plays continuous audible tone for emergency life-or-death requests so donors never miss it even if phone is on desk.
                  </p>
                  <button
                    onClick={() => handleTestSound('burst')}
                    disabled={isPlayingAlert}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isPlayingAlert ? 'Playing Siren...' : 'Play SOS Siren (3.5s)'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <Bell className="w-4 h-4" />
                    <span>Standard Chime</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Soft modern audio chime for routine updates, reward credits, and fulfilled donor notifications.
                  </p>
                  <button
                    onClick={() => handleTestSound('chime')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Gentle Chime</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TOOL 3: Sample WhatsApp Emergency Message Generator */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">WhatsApp Emergency Message Template</h3>
                <p className="text-xs text-slate-500 font-medium">വാട്സാപ്പ് ഗ്രൂപ്പുകളിൽ പങ്കുവെക്കാൻ തയ്യാറാക്കിയ മാതൃക</p>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed space-y-2 relative">
                <button
                  onClick={() => {
                    const text = `🚨 *JEEVALINK EMERGENCY BLOOD ALERT* 🚨\n\n🩸 *Blood Group:* ${simBlood} Required\n🏥 *Hospital:* Medical College Hospital\n👤 *Patient:* Urgent Surgery\n📍 *Meghala:* Verified by Local Committee\n\n📲 *Please contact immediately on JeevaLink or call coordinator.*`;
                    navigator.clipboard.writeText(text);
                    triggerToast('Sample message copied!', 'success');
                  }}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <p>🚨 *JEEVALINK EMERGENCY BLOOD ALERT* 🚨</p>
                <p>🩸 *Blood Group:* {simBlood} Required</p>
                <p>🏥 *Hospital:* Medical College Hospital</p>
                <p>👤 *Patient:* Urgent Surgery</p>
                <p>📍 *Meghala:* Verified by Local Committee</p>
                <p>📲 *Please contact immediately on JeevaLink or call coordinator.*</p>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* FREQUENTLY ASKED QUESTIONS (BILINGUAL ACCORDION)              */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              സാധാരണയായി ഉയരുന്ന സംശയങ്ങളും ഉത്തരങ്ങളും
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            
            {/* FAQ 1 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition-colors">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-800"
              >
                <span>Why didn't I receive sound alerts on my phone? / സൈറൺ ശബ്ദം കേൾക്കാത്തത് എന്തുകൊണ്ട്?</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === 1 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    On mobile browsers and PWA, phone manufacturers like Samsung, Xiaomi, and Apple enforce strict battery savers. Please ensure you tap <strong>"Install App"</strong> and grant <strong>Notification Permission</strong>. Also check <Link to="/notification-guide" className="text-red-600 font-bold underline">Notification Guide</Link> for OEM-specific battery optimization steps.
                  </p>
                  <p className="text-slate-700 font-medium">
                    ആൻഡ്രോയിഡ് / ഐഫോൺ ഫോണുകളിൽ ബാറ്ററി സേവർ നോട്ടിഫിക്കേഷൻ തടസ്സപ്പെടുത്താൻ സാധ്യതയുണ്ട്. ദയവായി നോട്ടിഫിക്കേഷൻ അനുമതി നൽകുകയും ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുകയും ചെയ്യുക.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition-colors">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-800"
              >
                <span>How can I join as a Meghala Committee Volunteer? / മേഖല സമിതിയിൽ എങ്ങനെ ചേരാം?</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === 2 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    Register as a standard user first, then contact your District Admin or Block Committee. Once verified by the district leadership, your role will be upgraded to <strong>Meghala Volunteer</strong> with full dashboard coordination access.
                  </p>
                  <p className="text-slate-700 font-medium">
                    സാധാരണ അക്കൗണ്ട് എടുത്ത ശേഷം നിങ്ങളുടെ ജില്ലാ അഡ്മിനെയോ ബ്ലോക്ക് സമിതിയെയോ ബന്ധപ്പെടുക. പരിശോധനയ്ക്ക് ശേഷം മേഖല വോളണ്ടിയർ റോൾ നൽകുന്നതാണ്.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden transition-colors">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-800"
              >
                <span>Is my phone number publicly visible to anyone? / എന്റെ ഫോൺ നമ്പർ പരസ്യമാണോ?</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === 3 ? 'rotate-90 text-red-600' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    No. JeevaLink enforces privacy protections. Only verified Meghala Committee volunteers can access donor contact numbers during active medical emergencies. Unverified anonymous visitors cannot view your contact number.
                  </p>
                  <p className="text-slate-700 font-medium">
                    അല്ല. അംഗീകൃത മേഖലാ സമിതി വോളണ്ടിയർമാർക്ക് മാത്രമേ അടിയന്തര ഘട്ടങ്ങളിൽ ദാതാക്കളെ നേരിട്ട് ബന്ധപ്പെടാൻ അനുമതിയുള്ളൂ.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── FOOTER CALLOUT BANNER ── */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-center text-white space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">Ready to Save Lives in Kerala?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Install the web app on your phone today for instant emergency siren alerts and quick donor coordination.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/download-app"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide uppercase transition-colors"
            >
              Get the App
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide uppercase transition-colors"
            >
              Login / Register
            </Link>
          </div>
        </div>

      </main>

    </div>
  );
}

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
  Radio,
  UserPlus,
  MapPin,
  KeyRound,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Mail,
  Compass,
  Upload,
  Lock,
  Menu,
  X,
  Plus,
  CheckCheck,
  Shield,
  Eye,
  Smartphone
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { playEmergencyAlertBurst, playNotificationChime } from '../utils/sirenAudio.js';

const donorAddSteps = [
  {
    step: 1,
    tagEn: 'Secure Login',
    tagMl: 'സുരക്ഷിത ലോഗിൻ',
    titleEn: '1. Sign In to Meghala Portal',
    titleMl: '1. മേഖല പോർട്ടൽ ലോഗിൻ',
    descEn: 'Log in with your verified Meghala Volunteer email and password. Only authorized committee accounts have scope permissions to register and onboard donors.',
    descMl: 'അംഗീകൃത മേഖലാ സമിതി വോളണ്ടിയർ ഇമെയിലും പാസ്‌വേർഡും നൽകി ലോഗിൻ ചെയ്യുക. ഇതിലൂടെ മാത്രമേ പുതിയ ദാതാക്കളെ ചേർക്കാനുള്ള അനുമതി ലഭിക്കൂ.',
    keyActionEn: 'Enter volunteer email & password, then tap "SIGN IN →"',
    keyActionMl: 'ഇമെയിലും പാസ്‌വേർഡും നൽകി "SIGN IN →" ബട്ടൺ അമർത്തുക',
    tipEn: 'Committee accounts have automatic geographic scoping locked to their assigned Meghala/District.',
    tipMl: 'മേഖലാ വോളണ്ടിയർ അക്കൗണ്ടുകൾക്ക് സ്വന്തം പ്രദേശത്തെ ദാതാക്കളെ ചേർക്കാനുള്ള സ്കോപ്പ് സ്വമേധയാ ലഭിക്കും.',
    doodleBadge: '👉 Step 1: Open Portal',
    mockupCallout: 'Enter volunteer credentials'
  },
  {
    step: 2,
    tagEn: 'Drawer Menu',
    tagMl: 'സൈഡ്‌ബാർ മെനു',
    titleEn: '2. Open "Manage Users & Donors"',
    titleMl: '2. "Manage Users & Donors" തിരഞ്ഞെടുക്കുക',
    descEn: 'Tap the top-left menu icon (☰) to open the mobile drawer. Tap on the highlighted "Manage Users & Donors" tab with the users icon.',
    descMl: 'മുകളിലെ ☰ മെനു ഐക്കൺ അമർത്തി തുറക്കുന്ന സൈഡ്‌ബാറിൽ നിന്ന് ചുവപ്പ് അടയാളമുള്ള "Manage Users & Donors" തിരഞ്ഞെടുക്കുക.',
    keyActionEn: 'Tap "Manage Users & Donors" tab in the slide-out navigation',
    keyActionMl: 'സൈഡ്‌ബാർ ഡ്രോയറിൽ നിന്ന് "Manage Users & Donors" ക്ലിക്ക് ചെയ്യുക',
    tipEn: 'This portal is restricted to Meghala volunteers to prevent unverified donor directory modifications.',
    tipMl: 'വ്യാജ വിവരങ്ങൾ തടയാൻ അംഗീകൃത വോളണ്ടിയർമാർക്ക് മാത്രമേ ഈ മെനു ലഭ്യമാകൂ.',
    doodleBadge: '📍 Step 2: Open Menu',
    mockupCallout: '👈 Tap "Manage Users & Donors"'
  },
  {
    step: 3,
    tagEn: 'Meghala Scope',
    tagMl: 'മേഖലാ പരിധി',
    titleEn: '3. Tap "+ Add Donor / Member"',
    titleMl: '3. "+ Add Donor / Member" ബട്ടൺ അമർത്തുക',
    descEn: 'In "USER MANAGEMENT (MEGHALA SCOPE)", view your active registered member totals and tap the prominent red "+ Add Donor / Member" button.',
    descMl: '"USER MANAGEMENT (MEGHALA SCOPE)" ഡാഷ്‌ബോർഡിൽ എത്തിയ ശേഷം ചുവന്ന "+ Add Donor / Member" ബട്ടൺ അമർത്തുക.',
    keyActionEn: 'Tap the primary red button "+ Add Donor / Member"',
    keyActionMl: 'പ്രധാന ചുവപ്പ് ബട്ടണായ "+ Add Donor / Member" അമർത്തുക',
    tipEn: 'The button opens the secure popup modal equipped with mandatory photo crop, 18+ age validation, and OTP verification.',
    tipMl: 'ഈ ബട്ടൺ അമർത്തുമ്പോൾ ഫോട്ടോ, രക്തഗ്രൂപ്പ്, OTP എന്നിവ രേഖപ്പെടുത്താനുള്ള ഫോം തുറന്നുവരും.',
    doodleBadge: '✨ Step 3: Tap + Add Donor',
    mockupCallout: '👆 Tap "+ Add Donor / Member"'
  },
  {
    step: 4,
    tagEn: 'Details & OTP',
    tagMl: 'വിവരങ്ങളും OTP യും',
    titleEn: '4. Profile, Blood Group & OTP Verification',
    titleMl: '4. വിവരങ്ങൾ, രക്തഗ്രൂപ്പ് & ഇമെയിൽ OTP',
    descEn: 'Upload & crop donor photo, choose Blood Group (A+, B+, O+, AB+, etc.), Gender, DOB (must be 18+), Name, and 10-digit mobile. Enter donor email and tap "Send OTP" to authenticate real credentials.',
    descMl: 'ദാതാവിന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക, രക്തഗ്രൂപ്പ്, ലിംഗം, ജനനത്തീയതി (18 വയസ്സ് നിർബന്ധം), മൊബൈൽ നമ്പർ നൽകുക. ഇമെയിൽ നൽകി "Send OTP" അമർത്തി പരിശോധിക്കുക.',
    keyActionEn: 'Fill details, tap "Send OTP" and enter the 6-digit verification code',
    keyActionMl: 'വിവരങ്ങൾ പൂരിപ്പിച്ച് "Send OTP" അമർത്തി ഒ.ടി.പി സ്ഥിരീകരിക്കുക',
    tipEn: 'OTP verification is mandatory. It ensures every registered donor has a verified direct line of contact during blood emergencies.',
    tipMl: 'അടിയന്തര ഘട്ടങ്ങളിൽ യഥാർത്ഥ ദാതാക്കളെ മാത്രം ബന്ധപ്പെടാനാണ് നിർബന്ധിത OTP ഏർപ്പെടുത്തിയിട്ടുള്ളത്.',
    doodleBadge: '🔒 Step 4: OTP Verification',
    mockupCallout: '🔑 Send OTP & verify email'
  },
  {
    step: 5,
    tagEn: 'GPS & Submit',
    tagMl: 'GPS & സ്ഥിരീകരണം',
    titleEn: '5. GPS Geolocation & Account Activation',
    titleMl: '5. GPS ലൊക്കേഷൻ അടയാളപ്പെടുത്തലും സ്ഥിരീകരണവും',
    descEn: 'Tap "Use My GPS" or "Pick on Map" to save exact geographic coordinates. District is auto-locked to your Meghala scope (e.g. Kasaragod). Tap "Verify Email OTP to Create" to instantly activate the donor.',
    descMl: '"Use My GPS" അല്ലെങ്കിൽ "Pick on Map" വഴി സ്ഥലം രേഖപ്പെടുത്തുക. ജില്ല സ്വമേധയാ തിരഞ്ഞെടുക്കപ്പെടും. തുടർന്ന് "Verify Email OTP to Create" അമർത്തി പൂർത്തിയാക്കുക.',
    keyActionEn: 'Tap "Use My GPS", enter Place & PIN Code, then tap "Verify Email OTP to Create"',
    keyActionMl: '"Use My GPS" അമർത്തി സ്ഥലവും പിൻകോഡും നൽകി അക്കൗണ്ട് ആക്റ്റീവ് ആക്കുക',
    tipEn: 'Accurate GPS geolocation allows emergency algorithms to alert donors within a 5 km to 15 km radius during critical hospital emergencies.',
    tipMl: 'കൃത്യമായ GPS ലൊക്കേഷൻ ആശുപത്രിക്ക് അടുത്തുള്ള ദാതാക്കളിലേക്ക് വേഗത്തിൽ അലർട്ടുകൾ എത്തിക്കുന്നു.',
    doodleBadge: '🚀 Step 5: Geotag & Submit',
    mockupCallout: '🎯 1-Tap GPS Geolocation'
  }
];

export default function UserManual() {
  const { triggerToast } = useAppStore();

  // Navigation & View Filters (Primarily Donors & Meghala Committee)
  const [role, setRole] = useState('donor'); // 'donor' | 'meghala'
  const [lang, setLang] = useState('both'); // 'en' | 'ml' | 'both'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [donorAddStep, setDonorAddStep] = useState(1);

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

  const currentStepData = donorAddSteps.find((s) => s.step === donorAddStep) || donorAddSteps[0];

  const renderDonorAddMockup = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="relative bg-white h-full min-h-[470px] flex flex-col justify-between text-slate-800">
            {/* Top red stats banner with status bar */}
            <div className="bg-gradient-to-b from-red-600 to-red-700 pt-1 pb-10 px-5 text-white rounded-b-[2rem] shadow-sm relative text-center">
              {/* iOS Status Bar */}
              <div className="flex items-center justify-between text-[9px] font-semibold text-white/90 pt-1 pb-3 px-1 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold">5G</span>
                  <div className="w-3.5 h-2 rounded-[2px] border border-white/80 p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-[1px]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-around pt-1">
                <div>
                  <div className="text-2xl font-extrabold leading-tight">64</div>
                  <div className="text-[8px] font-semibold tracking-wider uppercase text-red-100">ACTIVE MEGHALAS</div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <div className="text-2xl font-extrabold leading-tight">-</div>
                  <div className="text-[8px] font-semibold tracking-wider uppercase text-red-100">BLOOD REQUESTS</div>
                </div>
              </div>
            </div>

            {/* Login card bottom sheet */}
            <div className="-mt-6 bg-white rounded-t-[1.8rem] px-5 pt-3 pb-4 shadow-xl border-t border-slate-100/80 space-y-3 flex-1 flex flex-col justify-between">
              <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto" />
              <div className="text-center space-y-0.5">
                <h4 className="text-base font-bold text-slate-900 tracking-tight">Welcome Back</h4>
                <p className="text-[10px] text-slate-500">Please securely log in to your portal.</p>
              </div>

              <div className="space-y-2 text-left">
                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 tracking-wider">EMAIL ADDRESS</label>
                  <div className="flex items-center gap-2 mt-0.5 px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px] text-slate-600">you@idonate.org</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[8px] font-bold uppercase text-slate-400">
                    <span>PASSWORD</span>
                    <span className="text-slate-400 lowercase font-medium">Forgot?</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="tracking-widest font-mono text-xs text-slate-700">••••••••</span>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 pt-0.5">
                  <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
                  <span>Keep me signed in</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full py-2.5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-red-200">
                  <span>SIGN IN</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="flex items-center justify-center gap-1 text-[8px] text-slate-400 font-semibold uppercase">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>SECURED BY IDONATE ENTERPRISE</span>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto shrink-0 opacity-60" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="relative bg-slate-900/40 backdrop-blur-xs h-full min-h-[470px] flex flex-col text-slate-800 overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between text-[9px] font-semibold text-white pt-2 pb-1 px-4 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold">5G</span>
                <div className="w-3.5 h-2 rounded-[2px] border border-white/80 p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Slide-out White Drawer */}
            <div className="w-[88%] bg-white h-full p-3.5 flex flex-col justify-between shadow-2xl border-r border-slate-100 text-left rounded-r-2xl">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <img src="/idonate.png" alt="logo" className="w-5 h-5 object-contain rounded" />
                    <span className="text-xs font-black text-slate-900"><span className="text-red-600">i</span>Donate</span>
                  </div>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Items */}
                <div className="space-y-0.5 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <div className="w-4 h-4 rounded border border-slate-200 flex items-center justify-center text-[8px]">⊞</div>
                    <span>Meghala Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <Droplet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Accepted Donors</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <Radio className="w-3.5 h-3.5 text-slate-400" />
                    <span>Campaign Hub</span>
                  </div>

                  {/* ACTIVE HIGHLIGHTED TAB */}
                  <div className="my-1">
                    <div className="flex items-center justify-between px-2.5 py-2 bg-red-50/80 text-red-600 rounded-xl border border-red-200/70 font-semibold shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-slate-900 font-bold text-[11px]">Manage Users & Donors</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Unit Squad Committee</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <Droplet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Blood Requests</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 text-slate-500 rounded-xl">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Find Donors</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 px-1">
                <div className="text-[10px] font-bold text-red-600 flex items-center gap-1.5">
                  <span>Sign Out</span>
                </div>
                <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-2 shrink-0 opacity-60" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="relative bg-[#fbfbfd] h-full min-h-[470px] p-3 flex flex-col justify-between text-left">
            <div className="space-y-2.5">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[9px] font-semibold text-slate-900 pt-1 pb-1 px-1 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <span className="text-[8px] font-bold">5G</span>
                  <div className="w-3.5 h-2 rounded-[2px] border border-slate-700 p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-800 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* App Navbar */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-black text-slate-900"><span className="text-red-600">i</span>Donate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[9px]">🔔</div>
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">a</div>
                </div>
              </div>

              {/* Main Scope Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs space-y-2">
                <div className="text-[11px] font-black tracking-tight text-red-600 leading-tight">
                  USER MANAGEMENT (MEGHALA SCOPE)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">0 Registered</span>
                  <span className="text-[9px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> Test
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Register new members/donors, view profiles, and perform secure OTP-verified updates.
                </p>

                {/* Primary Button */}
                <div className="pt-1">
                  <div className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-red-200 ring-2 ring-red-100">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Donor / Member</span>
                  </div>
                </div>
              </div>

              {/* Minimal Stat Cards */}
              <div className="space-y-1.5 pt-1">
                <div className="p-3 bg-[#0f172a] text-white rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">TOTAL MEMBERS</div>
                    <div className="text-sm font-bold">0 <span className="text-[10px] font-normal text-slate-400">Registered</span></div>
                  </div>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>

                <div className="p-3 bg-white border border-slate-200/70 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-[8px] font-semibold uppercase tracking-wider text-amber-600">PENDING VERIFICATION</div>
                    <div className="text-sm font-bold text-slate-800">0 <span className="text-[10px] font-normal text-slate-400">Awaiting Action</span></div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px]">⏱</div>
                </div>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto my-1 shrink-0 opacity-60" />
          </div>
        );

      case 4:
        return (
          <div className="relative bg-white h-full min-h-[470px] flex flex-col justify-between text-left text-slate-800">
            {/* Modal Header */}
            <div className="bg-red-600 text-white pt-2 pb-3 px-3.5 rounded-b-2xl shadow-sm">
              <div className="flex items-center justify-between text-[9px] font-semibold text-white/90 pb-2 px-1 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold">5G</span>
                  <div className="w-3 h-1.5 rounded-[2px] border border-white/80 p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-[1px]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center font-bold text-[10px]">+</div>
                  <span className="text-xs font-bold">Add New Donor / Member</span>
                </div>
                <X className="w-3.5 h-3.5 text-white/80" />
              </div>
              <p className="text-[9px] text-red-100 mt-1 leading-tight">
                Verify donor email via OTP to confirm credentials & activate account
              </p>
            </div>

            {/* Form Fields */}
            <div className="p-3 space-y-2 flex-1 text-[9px]">
              {/* Photo Upload Target */}
              <div className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center bg-slate-50/70 space-y-0.5">
                <Upload className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                <div className="font-semibold text-slate-700 text-[9px]">Click to upload & crop Profile Picture *</div>
                <div className="text-[7px] text-slate-400">Supports JPG, PNG, WEBP</div>
              </div>

              {/* Blood & Gender */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-500 text-[8px] uppercase">BLOOD GROUP *</label>
                  <div className="mt-0.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 flex justify-between items-center text-[10px]">
                    <span>A+</span>
                    <ChevronRight className="w-2.5 h-2.5 text-slate-400 rotate-90" />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-500 text-[8px] uppercase">GENDER / SEX *</label>
                  <div className="mt-0.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-800 flex justify-between items-center text-[10px]">
                    <span>Male</span>
                    <ChevronRight className="w-2.5 h-2.5 text-slate-400 rotate-90" />
                  </div>
                </div>
              </div>

              {/* DOB & Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-500 text-[8px] uppercase">DOB *</label>
                    <span className="text-[7px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">18+ Only</span>
                  </div>
                  <div className="mt-0.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-400 text-[9px]">
                    DD/MM/YYYY
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-500 text-[8px] uppercase">PRIMARY NAME *</label>
                  <div className="mt-0.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-[9px] font-medium truncate">
                    Rahul Krishna
                  </div>
                </div>
              </div>

              {/* Email & OTP */}
              <div>
                <label className="font-semibold text-slate-500 text-[8px] uppercase">DONOR EMAIL *</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-[9px] font-medium truncate">
                    donor@example.com
                  </div>
                  <div className="px-2.5 py-1.5 bg-red-600 text-white rounded-xl font-bold text-[8px] shrink-0 shadow-xs flex items-center gap-1">
                    <KeyRound className="w-2.5 h-2.5" />
                    <span>Send OTP</span>
                  </div>
                </div>
                <div className="text-[7.5px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/60 mt-1">
                  ⚠️ OTP Verification Required to confirm identity
                </div>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto my-1 shrink-0 opacity-60" />
          </div>
        );

      case 5:
      default:
        return (
          <div className="relative bg-white h-full min-h-[470px] flex flex-col justify-between text-left text-slate-800">
            {/* Modal Mini Header */}
            <div className="bg-red-600 text-white pt-2 pb-2 px-3.5 rounded-b-xl flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-[9px] font-semibold text-white/90 px-1 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold">5G</span>
                  <div className="w-3 h-1.5 rounded-[2px] border border-white/80 p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-[1px]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold">Step 2: Geotag & Submit</span>
                <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Kasaragod Scope</span>
              </div>
            </div>

            <div className="p-3 space-y-2 flex-1 text-[9px]">
              {/* Place / Map Search Box */}
              <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/60">
                <div className="font-bold text-slate-700 text-[9px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  <span>PLACE / MAP SEARCH</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 py-1 px-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-lg font-bold text-[8px] flex items-center justify-center gap-0.5">
                    <Compass className="w-2.5 h-2.5" /> Use My GPS
                  </div>
                  <div className="flex-1 py-1 px-2 bg-rose-50 text-rose-700 border border-rose-200/70 rounded-lg font-bold text-[8px] flex items-center justify-center gap-0.5">
                    <span>🗺️ Pick on Map</span>
                  </div>
                </div>
                <div className="px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-slate-400 text-[8px]">
                  🔍 Search Kerala place, town...
                </div>
              </div>

              {/* Place & PIN Code */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="font-bold text-slate-500 text-[8px] uppercase">PLACE / CITY *</label>
                  <div className="mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-[9px]">
                    Kanhangad
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-500 text-[8px] uppercase">PIN CODE *</label>
                  <div className="mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-[9px]">
                    671315
                  </div>
                </div>
              </div>

              {/* District Auto-Locked */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-500 text-[8px] uppercase">DISTRICT *</label>
                  <span className="text-[7px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                    <Lock className="w-2 h-2" /> Auto-Fixed from Scope
                  </span>
                </div>
                <div className="mt-0.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg font-black text-slate-700 text-[9px]">
                  Kasaragod
                </div>
              </div>

              {/* Final action */}
              <div className="pt-2 flex items-center gap-1.5">
                <div className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[9px] border border-slate-200">
                  Cancel
                </div>
                <div className="flex-1 py-1.5 bg-slate-900 text-white rounded-xl font-black text-[9px] flex items-center justify-center gap-1 shadow-md">
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verify Email OTP to Create</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
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

            {/* ============================================================ */}
            {/* FEATURED: VOLUNTEER DONOR ADD & VERIFICATION TUTORIAL        */}
            {/* ============================================================ */}
            {matchesSearch('add donor member volunteer registration otp gps meghala committe', 'ദാതാവിനെ ചേർക്കൽ അംഗം രജിസ്ട്രേഷൻ ഒടിപി ജിപിഎസ് മേഖല സമിതി') && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-9 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-7 overflow-hidden relative">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>Volunteer Master Tutorial • മേഖല സമിതി സഹായി</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                      {lang !== 'ml' ? 'How to Add & Verify New Donors' : 'മേഖലാ സമിതിയിൽ പുതിയ ദാതാക്കളെ ചേർക്കുന്ന വിധം'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      {lang !== 'ml' && (
                        <span>Step-by-step procedure with interactive device simulation, mandatory OTP verification, and GPS radius alignment.</span>
                      )}
                      {lang === 'both' && <span className="block my-0.5 text-slate-300"></span>}
                      {lang !== 'en' && (
                        <span className="block text-slate-600 font-medium">
                          തത്സമയ മൊബൈൽ സ്ക്രീൻ മാതൃകയിലൂടെയും OTP, GPS വിവരങ്ങൾ വഴിയും പുതിയ ദാതാക്കളെ വിജയകരമായി രജിസ്റ്റർ ചെയ്യാം.
                        </span>
                      )}
                    </p>
                  </div>

                  <Link
                    to="/user-management"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all hover:scale-102 active:scale-98 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Open Add Donor Tool</span>
                  </Link>
                </div>

                {/* ── MINIMALIST STEPPER RAIL (APPLE / MATERIAL 3 STYLE) ── */}
                <div className="space-y-2.5 bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Workflow Pipeline
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Step {donorAddStep} of 5
                    </span>
                  </div>

                  {/* Horizontal Segment Rail */}
                  <div className="overflow-x-auto no-scrollbar py-1">
                    <div className="min-w-[500px] flex items-center justify-between gap-2 relative">
                      {donorAddSteps.map((s) => {
                        const isCurrent = donorAddStep === s.step;
                        const isDone = donorAddStep > s.step;
                        return (
                          <button
                            key={s.step}
                            type="button"
                            onClick={() => setDonorAddStep(s.step)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                              isCurrent
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : isDone
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70'
                                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                isCurrent
                                  ? 'bg-white text-slate-900'
                                  : isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isDone ? <Check className="w-3 h-3 text-white" /> : s.step}
                            </span>
                            <span className="truncate text-xs">
                              {s.tagEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── 2-COLUMN SHOWCASE ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: DETAILS & GUIDANCE */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Stage Heading */}
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span>STAGE 0{currentStepData.step} OF 05</span>
                        <span>•</span>
                        <span className="text-red-600">{currentStepData.tagEn}</span>
                      </div>

                      <h4 className="text-xl font-semibold text-slate-900 tracking-tight">
                        {lang === 'ml' ? currentStepData.titleMl : currentStepData.titleEn}
                      </h4>
                      {lang === 'both' && (
                        <p className="text-xs font-medium text-slate-600">
                          {currentStepData.titleMl}
                        </p>
                      )}
                    </div>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {lang !== 'ml' && (
                        <span>{currentStepData.descEn}</span>
                      )}
                      {lang === 'both' && <span className="block my-1 text-slate-200">───</span>}
                      {lang !== 'en' && (
                        <span className="block text-slate-700 font-medium">{currentStepData.descMl}</span>
                      )}
                    </p>

                    {/* Action Card (Apple Minimalist Callout) */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1 text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <span>Action Required</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {lang === 'ml' ? currentStepData.keyActionMl : currentStepData.keyActionEn}
                      </p>
                    </div>

                    {/* Rule / Tip Card */}
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1 text-xs">
                      <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Security & Accuracy Standard</span>
                      </div>
                      <p className="text-emerald-800 leading-relaxed">
                        {lang === 'ml' ? currentStepData.tipMl : currentStepData.tipEn}
                      </p>
                    </div>

                    {/* Stepper Navigation */}
                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDonorAddStep(Math.max(1, donorAddStep - 1))}
                        disabled={donorAddStep === 1}
                        className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          donorAddStep === 1
                            ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {donorAddSteps.map((s) => (
                          <button
                            key={s.step}
                            onClick={() => setDonorAddStep(s.step)}
                            className={`h-1.5 rounded-full transition-all ${
                              donorAddStep === s.step ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                            }`}
                            aria-label={`Jump to step ${s.step}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setDonorAddStep(donorAddStep === 5 ? 1 : donorAddStep + 1)}
                        className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span>{donorAddStep === 5 ? 'Restart Flow' : 'Next Step'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: FLAGSHIP SMARTPHONE HARDWARE MOCKUP */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    
                    {/* Device Label */}
                    <div className="mb-2.5 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Live Screen Simulation</span>
                    </div>

                    {/* Flagship Device Frame (Matte Titanium & Dynamic Island) */}
                    <div className="w-[285px] sm:w-[305px] rounded-[3rem] p-2.5 bg-[#171717] border-[3px] border-neutral-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] relative overflow-hidden">
                      
                      {/* Dynamic Island */}
                      <div className="w-22 h-4.5 bg-black rounded-full mx-auto my-1 flex items-center justify-between px-2 text-[8px] text-white/40 relative z-30">
                        <div className="w-2 h-2 rounded-full bg-neutral-900" />
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                      </div>

                      {/* Screen Viewport */}
                      <div className="rounded-[2.2rem] overflow-hidden bg-white min-h-[475px] relative flex flex-col justify-between shadow-inner border border-slate-100">
                        {renderDonorAddMockup(donorAddStep)}
                      </div>

                      {/* Screen Highlight / Action Chip */}
                      <div className="mt-2.5 mb-0.5 px-3 py-1.5 bg-neutral-900 text-neutral-200 rounded-xl text-center text-[10px] font-medium flex items-center justify-center gap-1.5 border border-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{currentStepData.mockupCallout}</span>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

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

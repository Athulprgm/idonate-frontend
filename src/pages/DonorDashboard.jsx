import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import api from '../store/api.js';
import {
  Loader2, X, Phone, RefreshCw,
  Heart, Siren, Droplet, Send, ShieldAlert, ShieldCheck,
  Share2, MapPin, Headphones, MessageSquare,
  Scale, Calendar, AlertCircle, CheckCircle2,
  Clock, Sparkles, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal.jsx';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner.jsx';

export default function DonorDashboard() {
  const { user, setAvailability, updateProfile } = useAuthStore();
  const {
    requests, fetchRequests, fetchNotifications, triggerToast
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Health popup (mandatory for donors who haven't entered weight)
  const isHealthLogMissing = Boolean(user && (!user.weight || Number(user.weight) <= 0));
  const [showPopup, setShowPopup] = useState(false);
  const [weight, setWeight] = useState(user?.weight || '');
  const [lastDonated, setLastDonated] = useState(user?.lastDonated || user?.last_donated_date || '');
  const [neverDonated, setNeverDonated] = useState(!user?.lastDonated && !user?.last_donated_date);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user data loads or updates
  useEffect(() => {
    if (user?.weight) setWeight(user.weight);
    if (user?.lastDonated || user?.last_donated_date) {
      setLastDonated(user.lastDonated || user.last_donated_date);
      setNeverDonated(false);
    }
  }, [user]);

  // Real-time live eligibility & 3-month calculation
  const previewState = useMemo(() => {
    const numW = Number(weight);
    const hasWeight = weight !== '' && !isNaN(numW) && numW > 0;
    const isWeightEligible = hasWeight && numW >= 50;

    let dateCheck = null;

    if (!neverDonated && lastDonated) {
      const last = new Date(lastDonated);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      last.setHours(0, 0, 0, 0);

      if (last > today) {
        dateCheck = {
          isFuture: true,
          badge: 'Invalid Date',
          title: 'Date is in the future',
          desc: 'Please select a past date when you previously donated blood.',
          isIntervalEligible: false,
          color: 'rose',
        };
      } else {
        const diffTime = today.getTime() - last.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        // 3-Month Interval Rule (standard 90 days cooldown)
        const isIntervalEligible = diffDays >= 90;
        const daysLeft = Math.max(0, 90 - diffDays);
        const progressPercent = Math.min(100, Math.round((diffDays / 90) * 100));

        const eligibleDate = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const monthsAgo = (diffDays / 30.44).toFixed(1);

        dateCheck = {
          isFuture: false,
          diffDays,
          monthsAgo,
          isIntervalEligible,
          daysLeft,
          progressPercent,
          eligibleDate,
        };
      }
    }

    // Determine overall eligibility:
    // User must satisfy weight (>= 50kg) AND (first-time donor OR date >= 3 months ago)
    const isIntervalOk = neverDonated ? true : Boolean(dateCheck?.isIntervalEligible);
    const isDatePicked = neverDonated || Boolean(lastDonated);

    if (!hasWeight && !isDatePicked) {
      return {
        status: 'initial',
        isEligible: false,
        donationActive: false,
        badge: 'Pending Health Data',
        title: 'Enter Weight & Donation History',
        donationStatusText: 'Status: INACTIVE',
        desc: 'Please enter your weight (min 50 kg) and donation date to determine your active status.',
        color: 'slate',
        dateCheck,
        isWeightEligible,
        hasWeight,
      };
    }

    // If future date
    if (dateCheck?.isFuture) {
      return {
        status: 'invalid_date',
        isEligible: false,
        donationActive: false,
        badge: 'Invalid Date Selected',
        title: 'Last donation date is in the future',
        donationStatusText: 'Status: INACTIVE',
        desc: 'Please pick a past date when you previously donated.',
        color: 'rose',
        dateCheck,
        isWeightEligible,
        hasWeight,
      };
    }

    // Both conditions satisfied: ELIGIBLE & ACTIVE
    if (hasWeight && isWeightEligible && isIntervalOk) {
      const desc = neverDonated
        ? 'First-time donor with verified weight ≥ 50 kg. You are immediately eligible to donate blood!'
        : `Last donated ${dateCheck?.diffDays} days (${dateCheck?.monthsAgo} months) ago. 3-month gap satisfied!`;

      return {
        status: 'eligible',
        isEligible: true,
        donationActive: true,
        badge: '✓ 3+ Months Gap & Weight OK',
        title: 'Eligible for Blood Donation',
        donationStatusText: 'Status: ACTIVE',
        desc,
        color: 'emerald',
        dateCheck,
        isWeightEligible,
        hasWeight,
      };
    }

    // Opposite conditions: INELIGIBLE & INACTIVE
    let oppositeReason = '';
    let oppositeTitle = 'Non-Eligible for Donation';
    let oppositeBadge = 'Non-Eligible';
    let oppositeColor = 'amber';

    if (hasWeight && !isWeightEligible && !isIntervalOk && !neverDonated) {
      // Both weight and date fail
      oppositeTitle = 'Non-Eligible (Weight & 3-Month Gap)';
      oppositeBadge = 'Underweight & Cooldown';
      oppositeReason = `Weight is under 50 kg and last donation was ${dateCheck?.diffDays} days ago (${dateCheck?.daysLeft} days remaining).`;
      oppositeColor = 'rose';
    } else if (hasWeight && !isWeightEligible) {
      // Weight fails (< 50 kg)
      oppositeTitle = 'Non-Eligible (Weight < 50 kg)';
      oppositeBadge = 'Below 50 kg Limit';
      oppositeReason = `Weight is ${numW} kg. Blood donors must weigh at least 50 kg for safety.`;
      oppositeColor = 'rose';
    } else if (!isIntervalOk && !neverDonated) {
      // Date fails (within 3 months cooldown)
      oppositeTitle = 'Non-Eligible (Within 3 Months)';
      oppositeBadge = `3-Month Cooldown (${dateCheck?.daysLeft} Days Left)`;
      oppositeReason = `Donated on ${new Date(lastDonated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${dateCheck?.diffDays} days ago). 3 months gap required. Eligible on ${dateCheck?.eligibleDate}.`;
      oppositeColor = 'amber';
    } else {
      // Incomplete data
      oppositeTitle = 'Incomplete Health Info';
      oppositeBadge = 'Information Required';
      oppositeReason = !hasWeight ? 'Please enter your weight.' : 'Please select donation history.';
      oppositeColor = 'slate';
    }

    return {
      status: 'ineligible',
      isEligible: false,
      donationActive: false,
      badge: oppositeBadge,
      title: oppositeTitle,
      donationStatusText: 'Status: INACTIVE',
      desc: oppositeReason,
      color: oppositeColor,
      dateCheck,
      isWeightEligible,
      hasWeight,
    };
  }, [weight, lastDonated, neverDonated]);

  // Technical Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', description: '', type: 'Bug Report' });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Ineligible warning modal
  const [showIneligibleModal, setShowIneligibleModal] = useState(false);

  // Refresh handler
  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchRequests(), fetchNotifications()]);
      triggerToast('Dashboard updated', 'success');
    } catch {
      triggerToast('Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRequests, fetchNotifications, triggerToast]);

  useEffect(() => {
    fetchRequests();
    fetchNotifications();

    if (isHealthLogMissing) {
      const timer = setTimeout(() => setShowPopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user, isHealthLogMissing, fetchRequests, fetchNotifications]);

  const handleSaveHealthInfo = async (e) => {
    e.preventDefault();
    setFormError('');

    const numWeight = Number(weight);
    if (!weight || isNaN(numWeight) || numWeight <= 0) {
      setFormError('Please enter a valid weight in kg.');
      return;
    }
    if (numWeight < 35 || numWeight > 220) {
      setFormError('Please enter a realistic weight (35 kg - 220 kg).');
      return;
    }

    if (!neverDonated && !lastDonated) {
      setFormError('Please select your last donation date or select "First-Time Donor".');
      return;
    }

    if (!neverDonated && lastDonated) {
      const selectedDate = new Date(lastDonated);
      const today = new Date();
      if (selectedDate > today) {
        setFormError('Last donation date cannot be in the future.');
        return;
      }
    }

    setIsSaving(true);

    // 3-Month interval rule & weight >= 50kg check
    let isEligible = false;
    let reasonText = '';

    if (numWeight < 50) {
      isEligible = false;
      reasonText = 'Minimum weight of 50 kg is required for donation. Donation status is set to INACTIVE.';
    } else if (!neverDonated && lastDonated) {
      const last = new Date(lastDonated);
      const diffTime = Math.abs(new Date() - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        isEligible = false;
        const daysLeft = 90 - diffDays;
        reasonText = `Donation within 3 months cooldown (${daysLeft} days remaining). Donation status is set to INACTIVE.`;
      } else {
        isEligible = true;
      }
    } else if (neverDonated && numWeight >= 50) {
      isEligible = true;
    }

    const payload = {
      weight: numWeight,
      last_donated_date: neverDonated ? null : lastDonated,
      lastDonated: neverDonated ? null : lastDonated,
      available_for_donation: isEligible,
      availableForDonation: isEligible,
      eligibility_status: isEligible ? 'Eligible' : 'Ineligible',
      eligibilityStatus: isEligible ? 'Eligible' : 'Ineligible',
    };

    try {
      const res = await updateProfile(payload);

      // Also sync with donor eligibility endpoint
      try {
        await api.post('/donors/eligibility', {
          eligibility_status: isEligible ? 'Eligible' : 'Ineligible'
        });
      } catch (err) {
        console.warn('Syncing eligibility status endpoint:', err);
      }

      if (res?.success) {
        if (isEligible) {
          await setAvailability(true);
          triggerToast('Health log saved! Your donation status is now ACTIVE 🎉', 'success');
        } else {
          await setAvailability(false);
          triggerToast(reasonText || 'Health log saved. Donation status is INACTIVE.', 'warning');
        }
        setShowPopup(false);
      } else {
        setFormError(res?.error || 'Failed to save health info. Please try again.');
        triggerToast('Failed to save health info', 'error');
      }
    } catch {
      setFormError('Network error. Please try again.');
      triggerToast('Network error while saving', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Technical Report Submit
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      triggerToast('Please fill in title and description', 'error');
      return;
    }
    setSubmittingReport(true);
    try {
      const res = await api.post('/technical-reports', reportForm);
      if (res.data.success) {
        triggerToast('Technical report submitted successfully', 'success');
        setReportForm({ title: '', description: '', type: 'Bug Report' });
        setShowReportModal(false);
      } else {
        triggerToast(res.data.message || 'Failed to submit report', 'error');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Submission failed', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const toggleAvailability = async () => {
    if (isHealthLogMissing) {
      triggerToast('Please complete your health log (weight & last donation date) to activate donation', 'warning');
      setShowPopup(true);
      return;
    }

    const next = !user?.availableForDonation;
    if (next && user?.eligibilityStatus === 'Ineligible') {
      setShowIneligibleModal(true);
      return;
    }
    const res = await setAvailability(next);
    if (res?.ineligible) {
      setShowIneligibleModal(true);
      return;
    }
    if (res?.success) {
      triggerToast(next ? 'Marked as Available for donation' : 'Marked as Unavailable', next ? 'success' : 'warning');
    }
  };

  // Eligibility calculation
  const getEligibility = () => {
    if (isHealthLogMissing) {
      return { eligible: false, text: 'Health Log Incomplete' };
    }
    if (user?.eligibilityStatus === 'Ineligible') {
      return { eligible: false, text: 'Ineligible (Health Deferral)' };
    }
    if (user?.lastDonated) {
      const last = new Date(user.lastDonated);
      const diffTime = Math.abs(new Date() - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        return { eligible: false, text: `${90 - diffDays} Days Cooldown` };
      }
    }
    if (user?.eligibilityStatus === 'Eligible') {
      return { eligible: true, text: 'Eligible to Donate' };
    }
    return { eligible: null, text: 'Health Status Active' };
  };

  const eligibility = getEligibility();

  // Requests filtering for SOS
  const currentUserId = user ? String(user._id || user.id) : null;
  const isNotOwner = (r) => currentUserId !== String(r.requested_by || r.requestedBy || r.requested_by_id || '');
  const sos = requests.filter((r) => {
    const urg = String(r.urgencyLevel || r.urgency_level || '').toLowerCase();
    const status = String(r.status || '').toLowerCase();
    const isSos = urg.includes('immediate') || urg.includes('sos');
    const isActive = ['pending', 'waiting', 'accepted', 'active', 'in progress'].includes(status);
    return isSos && isActive && isNotOwner(r);
  });

  const userBg = (user?.bloodGroup || user?.blood_group || 'O+').toUpperCase();

  // WhatsApp SOS Share
  const handleShareWhatsApp = (req) => {
    const bg = req.bloodGroup || req.blood_group || 'O+';
    const patient = req.patientName || req.patient_name || 'Patient';
    const hospital = req.hospitalName || req.hospital_name || 'Hospital';
    const city = req.city || 'Location';
    const contact = req.contactNumber || req.contact_number || 'Emergency Desk';
    const units = req.unitsRequired || req.units_required || 1;

    const text = `*URGENT BLOOD REQUEST — iDonate Network*\n\nBlood Group: ${bg}\nPatient: ${patient}\nHospital: ${hospital}, ${city}\nUnits: ${units} Unit(s)\nContact: ${contact}\n\nPlease share and save a life.\n${window.location.origin}/requests`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-left pb-12 select-none px-1 sm:px-0 font-sans text-slate-900">

      {/* ─── 1. MINIMAL HERO PROFILE & AVAILABILITY CARD ─── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Blood Group Badge */}
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm shadow-red-600/20">
              {userBg}
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                {user?.primaryName || user?.primary_name || user?.name || 'User Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user?.city || 'Central'}, {user?.district || 'Kozhikode'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Clean Availability Toggle Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={toggleAvailability}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-between cursor-pointer border ${
              isHealthLogMissing
                ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/80'
                : user?.availableForDonation
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${
                isHealthLogMissing 
                  ? 'bg-amber-500 animate-bounce' 
                  : user?.availableForDonation 
                  ? 'bg-emerald-600 animate-pulse' 
                  : 'bg-slate-400'
              }`} />
              <span>
                {isHealthLogMissing
                  ? 'Inactive (Health Info Required)'
                  : user?.availableForDonation
                  ? 'Available to Donate Blood'
                  : 'Marked as Unavailable'}
              </span>
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {isHealthLogMissing ? 'Tap to complete' : user?.availableForDonation ? 'Active' : 'Tap to enable'}
            </span>
          </button>
        </div>
      </div>

      <NotificationPermissionBanner 
        onPermissionGranted={() => triggerToast('Push notifications enabled successfully', 'success')} 
      />

      {/* ─── 2. EMERGENCY SOS ALERT BANNER ─── */}
      {sos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <Siren className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-red-950 uppercase tracking-wider">
                  Emergency Request ({sos.length})
                </h3>
                <p className="text-xs text-red-800 font-medium">
                  <strong>{sos[0].bloodGroup || sos[0].blood_group}</strong> required at {sos[0].hospitalName || sos[0].hospital || 'Hospital'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${sos[0].contactNumber || sos[0].bystanderPhone || '112'}`}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 fill-white" /> Call Bystander
            </a>
            <button
              type="button"
              onClick={() => handleShareWhatsApp(sos[0])}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. PRIMARY QUICK ACTIONS (2 LARGE TOUCH BUTTONS) ─── */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/requests"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs transition-all flex flex-col items-start gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-red-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              Request Blood
            </h3>
            <p className="text-[11px] text-slate-500">Post hospital requirement</p>
          </div>
        </Link>

        <Link
          to="/donor/eligibility"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs transition-all flex flex-col items-start gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Health Eligibility
            </h3>
            <p className="text-[11px] text-slate-500">Check donation readiness</p>
          </div>
        </Link>
      </div>

      {/* ─── 4. MINIMAL STATS BAR ─── */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="p-1">
          <p className="text-base font-black text-slate-900">{user?.livesSaved ?? 0}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Lives Saved</p>
        </div>
        <div className="p-1 border-x border-slate-100">
          <p className="text-base font-black text-slate-900">{user?.totalDonations ?? 0}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Donations</p>
        </div>
        <div className="p-1">
          <p className="text-base font-black text-slate-900">{user?.rewardPoints ?? 0}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">JeevaPoints</p>
        </div>
      </div>

      {/* ─── 5. CLEAN ACCOUNT & SUPPORT UTILITIES ─── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-900">Health Status & Support</h3>
          <span className="text-[11px] font-semibold text-emerald-600">{eligibility.text}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <Link
            to="/support"
            className="py-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5" /> Support
          </Link>
          <Link
            to="/feedback"
            className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Send Feedback
          </Link>
          <Link
            to="/donor/eligibility"
            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-center transition flex items-center justify-center"
          >
            Health Check
          </Link>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-center transition cursor-pointer flex items-center justify-center"
          >
            Report Issue
          </button>
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* Mandatory Minimal Modern Health Info Popup */}
      <AnimatePresence>
        {showPopup && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 select-none overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] relative text-left border border-slate-100 overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dynamic Accent Top Strip */}
              <div 
                className={`absolute top-0 inset-x-0 h-1.5 transition-colors duration-500 ${
                  previewState.color === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
                    : previewState.color === 'amber'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500'
                    : previewState.color === 'rose'
                    ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600'
                    : 'bg-gradient-to-r from-slate-400 to-slate-600'
                }`} 
              />

              {/* Minimal Creative Header */}
              <div className="flex items-start gap-3.5 pt-1">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  previewState.color === 'emerald'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm shadow-emerald-500/20'
                    : previewState.color === 'amber'
                    ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-500/20'
                    : previewState.color === 'rose'
                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  {previewState.color === 'emerald' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : previewState.color === 'amber' ? (
                    <Clock className="w-5 h-5" />
                  ) : previewState.color === 'rose' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Heart className="w-5 h-5 fill-red-600/20 text-red-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Medical Registry
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      Required
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                    Health & Donation Eligibility
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-0.5">
                    Blood banks require weight ≥ 50 kg and 3-month gap between donations.
                  </p>
                </div>
              </div>

              {/* Creative Live Status Card with Cooldown Visualizer */}
              <div className={`mt-4 p-3.5 rounded-2xl border transition-all duration-300 space-y-2.5 ${
                previewState.color === 'emerald'
                  ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-950'
                  : previewState.color === 'amber'
                  ? 'bg-amber-50/70 border-amber-200/90 text-amber-950'
                  : previewState.color === 'rose'
                  ? 'bg-rose-50/70 border-rose-200/90 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {/* Status Badges Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs ${
                    previewState.color === 'emerald'
                      ? 'bg-emerald-600 text-white'
                      : previewState.color === 'amber'
                      ? 'bg-amber-500 text-white'
                      : previewState.color === 'rose'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-300 text-slate-800'
                  }`}>
                    {previewState.isEligible ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{previewState.isEligible ? 'Eligible Donor' : 'Non-Eligible'}</span>
                  </span>

                  <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    previewState.donationActive ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      previewState.donationActive 
                        ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-400/20' 
                        : 'bg-slate-400'
                    }`} />
                    <span>{previewState.donationActive ? 'Donation: ACTIVE' : 'Donation: INACTIVE'}</span>
                  </span>
                </div>

                {/* Dual Criteria Mini Badges */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">3-Month Gap:</span>
                    <span className={neverDonated || previewState.dateCheck?.isIntervalEligible ? 'text-emerald-600' : previewState.dateCheck ? 'text-amber-600' : 'text-slate-400'}>
                      {neverDonated ? 'First-Time ✨' : previewState.dateCheck?.isIntervalEligible ? 'Passed (3+ Mo)' : previewState.dateCheck ? `${previewState.dateCheck.daysLeft}d left` : 'Pending'}
                    </span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Weight Metric:</span>
                    <span className={previewState.isWeightEligible ? 'text-emerald-600' : previewState.hasWeight ? 'text-rose-600' : 'text-slate-400'}>
                      {previewState.isWeightEligible ? '≥ 50 kg (OK)' : previewState.hasWeight ? '< 50 kg (Low)' : 'Min 50 kg'}
                    </span>
                  </div>
                </div>

                {/* Cooldown Progress Bar (Visible when within 3 months cooldown) */}
                {previewState.dateCheck && !previewState.dateCheck.isIntervalEligible && !previewState.dateCheck.isFuture && !neverDonated && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                      <span>Cooldown: {previewState.dateCheck.diffDays} of 90 days</span>
                      <span>Next Eligible: {previewState.dateCheck.eligibleDate}</span>
                    </div>
                    <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden p-0.5 border border-amber-300/40">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${previewState.dateCheck.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] opacity-85 leading-relaxed pt-0.5">
                  {previewState.desc}
                </p>
              </div>

              {/* Error Alert if any */}
              {formError && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveHealthInfo} className="space-y-4 pt-3">

                {/* Creative Pill Switcher: Donated Before vs First-Time */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Donation History
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => { 
                        setNeverDonated(false); 
                        if (formError) setFormError(''); 
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !neverDonated 
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${!neverDonated ? 'text-red-600' : ''}`} />
                      <span>Donated Before</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { 
                        setNeverDonated(true); 
                        setLastDonated(''); 
                        if (formError) setFormError(''); 
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        neverDonated 
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${neverDonated ? 'text-amber-500' : ''}`} />
                      <span>First-Time Donor</span>
                    </button>
                  </div>
                </div>

                {/* Weight Input with Quick Stepper Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-red-600" />
                      <span>Body Weight</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${
                      Number(weight) >= 50 
                        ? 'text-emerald-600' 
                        : Number(weight) > 0 
                        ? 'text-rose-600' 
                        : 'text-slate-400'
                    }`}>
                      {Number(weight) >= 50 
                        ? '✓ ≥ 50 kg Eligible' 
                        : Number(weight) > 0 
                        ? '⚠️ < 50 kg Non-Eligible' 
                        : 'Min 50 kg required'}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="35"
                      max="220"
                      step="0.5"
                      required
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Enter weight in kg (e.g. 62)"
                      className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 transition"
                    />
                    <span className="absolute right-3.5 text-[11px] font-black text-slate-400 pointer-events-none">
                      KG
                    </span>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">Presets:</span>
                    {[50, 55, 60, 65, 70, 75].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          setWeight(String(w));
                          if (formError) setFormError('');
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 ${
                          Number(weight) === w
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {w} kg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Last Donated Date Input (Conditional on "Donated Before") */}
                {!neverDonated && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>Last Blood Donation Date</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">3-Month Gap Rule</span>
                    </div>

                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      required={!neverDonated}
                      value={lastDonated}
                      onChange={(e) => {
                        setLastDonated(e.target.value);
                        if (formError) setFormError('');
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 cursor-pointer transition"
                    />

                    {/* Quick Date Shortcuts for Frictionless Selection */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">Quick Pick:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() - 95); // 95 days ago (Eligible 3+ months)
                          setLastDonated(d.toISOString().split('T')[0]);
                          if (formError) setFormError('');
                        }}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition cursor-pointer"
                      >
                        ✓ 3+ Months Ago (Eligible)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() - 30); // 30 days ago (Within 3 months)
                          setLastDonated(d.toISOString().split('T')[0]);
                          if (formError) setFormError('');
                        }}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition cursor-pointer"
                      >
                        ⏳ 1 Month Ago (Cooldown)
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                      Donating blood <strong>3+ months (90+ days) ago</strong> makes status <strong>ACTIVE</strong>. Donating within 3 months marks status <strong>INACTIVE & NON-ELIGIBLE</strong>.
                    </p>
                  </div>
                )}

                {/* Action Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99] shadow-md ${
                      previewState.donationActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30'
                        : 'bg-slate-900 hover:bg-slate-950 text-white shadow-slate-900/20'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Health Log...</span>
                      </>
                    ) : previewState.donationActive ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Submit & Activate Blood Donation (ACTIVE)</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Submit Health Info (Status: INACTIVE)</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>Mandatory medical verification. Cannot be skipped without completion.</span>
                  </p>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Technical Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl relative space-y-3 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Report Issue</h3>
                <button type="button" onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Report Type</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 text-slate-900"
                    value={reportForm.type}
                    onChange={(e) => setReportForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {['Bug Report', 'Feature Request', 'Account Issue', 'Donation Issue', 'App Feedback', 'Other'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Title *</label>
                  <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 text-slate-900"
                    placeholder="Brief summary of issue"
                    value={reportForm.title}
                    onChange={(e) => setReportForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Details *</label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 text-slate-900 resize-none"
                    rows={3}
                    placeholder="Describe issue..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {submittingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Report
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ineligible Warning Modal */}
      <Modal
        isOpen={showIneligibleModal}
        onClose={() => setShowIneligibleModal(false)}
        title="Health Eligibility Status"
      >
        <div className="space-y-3 text-left">
          <div className="w-10 h-10 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-slate-900">You Are Currently Ineligible</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Availability cannot be turned ON because your status is currently marked as Ineligible.
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowIneligibleModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <Link
              to="/donor/eligibility"
              onClick={() => setShowIneligibleModal(false)}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition text-center shadow-2xs cursor-pointer flex items-center justify-center gap-1"
            >
              Health Check
            </Link>
          </div>
        </div>
      </Modal>

    </div>
  );
}

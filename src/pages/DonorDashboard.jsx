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
    const hasWeight = !isNaN(numW) && numW > 0;

    if (!hasWeight && !neverDonated && !lastDonated) {
      return {
        status: 'initial',
        isEligible: false,
        badge: 'Pending Health Data',
        title: 'Complete details to evaluate status',
        donationActive: false,
        donationStatusText: 'Status: INACTIVE',
        desc: 'Please enter your current body weight and donation history below.',
        color: 'slate',
      };
    }

    if (hasWeight && numW < 50) {
      return {
        status: 'underweight',
        isEligible: false,
        badge: 'Below 50 kg Criteria',
        title: 'Non-Eligible (< 50 kg)',
        donationActive: false,
        donationStatusText: 'Status: INACTIVE',
        desc: `Entered weight is ${numW} kg. Medical standards require a minimum body weight of 50 kg to donate blood.`,
        color: 'rose',
      };
    }

    if (!neverDonated && lastDonated) {
      const last = new Date(lastDonated);
      const today = new Date();
      if (last > today) {
        return {
          status: 'future_date',
          isEligible: false,
          badge: 'Invalid Date',
          title: 'Selected date is in the future',
          donationActive: false,
          donationStatusText: 'Status: INACTIVE',
          desc: 'Please pick a past date when you previously donated blood.',
          color: 'rose',
        };
      }

      const diffTime = Math.abs(today - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3 Months = 90 days interval rule
      if (diffDays < 90) {
        const daysLeft = 90 - diffDays;
        const eligibleDate = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return {
          status: 'cooldown',
          isEligible: false,
          diffDays,
          daysLeft,
          eligibleDate,
          badge: `3-Month Cooldown (${daysLeft} Days Left)`,
          title: 'Non-Eligible (Within 3 Months)',
          donationActive: false,
          donationStatusText: 'Status: INACTIVE',
          desc: `Donated ${diffDays} days ago. A 3-month gap is required. You will become eligible on ${eligibleDate}.`,
          color: 'amber',
        };
      } else {
        const monthsAgo = Math.floor(diffDays / 30);
        const weightOk = hasWeight ? numW >= 50 : false;
        return {
          status: 'eligible',
          isEligible: weightOk,
          diffDays,
          monthsAgo,
          badge: '✓ 3+ Months Interval Passed',
          title: weightOk ? 'Eligible to Donate Blood' : '3-Month Gap Verified',
          donationActive: weightOk,
          donationStatusText: weightOk ? 'Status: ACTIVE' : 'Status: INACTIVE',
          desc: `Last donated ${diffDays} days (~${monthsAgo} months) ago. You meet the 3-month medical requirement!`,
          color: weightOk ? 'emerald' : 'rose',
        };
      }
    }

    if (neverDonated) {
      const weightOk = hasWeight ? numW >= 50 : false;
      return {
        status: 'first_time',
        isEligible: weightOk,
        badge: '✨ First-Time Hero',
        title: weightOk ? 'Eligible to Donate Blood' : 'First-Time Donor',
        donationActive: weightOk,
        donationStatusText: weightOk ? 'Status: ACTIVE' : 'Status: INACTIVE',
        desc: weightOk
          ? 'No cooldown required! With weight ≥ 50 kg, your blood donation status will be marked ACTIVE upon submit.'
          : 'First-time donors with weight ≥ 50 kg become immediately active.',
        color: weightOk ? 'emerald' : 'slate',
      };
    }

    return {
      status: 'pending_date',
      isEligible: false,
      badge: 'Select Donation History',
      title: 'Choose date or First-Time',
      donationActive: false,
      donationStatusText: 'Status: INACTIVE',
      desc: 'Select your last donation date or choose First-Time Donor.',
      color: 'slate',
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

      {/* Mandatory Health Info Popup */}
      <AnimatePresence>
        {showPopup && (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative space-y-4 text-left border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-xs">
                  <Heart className="w-6 h-6 fill-red-600/10" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    Mandatory Health Profile
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Complete Health Details</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    To activate your blood donation status and match you with nearby patients in need, please submit your weight and last donation date.
                  </p>
                </div>
              </div>

              {/* Status Warning Banner */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center gap-2.5 text-amber-900 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[11px] leading-snug">
                  Donation status is currently <strong>Inactive</strong>. Submitting this form activates your donor status.
                </p>
              </div>

              {/* Error Alert */}
              {formError && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveHealthInfo} className="space-y-4 pt-1">
                {/* Weight Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-red-600" />
                      <span>Body Weight (kg)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">Min 50 kg for donation</span>
                  </div>
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
                    placeholder="Enter your weight (e.g. 65)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 transition"
                  />
                </div>

                {/* Last Donated Date Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>Last Blood Donation</span>
                    <span className="text-red-500">*</span>
                  </label>

                  {/* Checkbox for never donated */}
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                    <input
                      type="checkbox"
                      checked={neverDonated}
                      onChange={(e) => {
                        setNeverDonated(e.target.checked);
                        if (e.target.checked) setLastDonated('');
                        if (formError) setFormError('');
                      }}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      I have never donated blood before (First-time donor)
                    </span>
                  </label>

                  {!neverDonated && (
                    <div>
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
                      <p className="text-[10px] text-slate-400 mt-1">
                        90 days interval required between donations for donor safety.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-red-600/30 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving & Activating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit & Activate Blood Donation</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>Your health data is strictly encrypted and used only for eligibility.</span>
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

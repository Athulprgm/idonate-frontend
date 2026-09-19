import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../store/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Inbox, Send, FileText, Trash2, AlertOctagon, Star, RefreshCw,
  Search, Paperclip, ChevronLeft, ChevronRight, Reply, Forward, ArrowLeft,
  Mail, Check, X, HardDrive, Maximize2, Minimize2, CheckSquare, Square,
  LogOut, File, Download, Loader2, Eye, EyeOff, Lock, User, Menu,
  Edit3, MoreVertical, CheckCircle2, HelpCircle
} from 'lucide-react';

// Official iDonate Logo Component
const IDonateLogo = ({ className = "w-6 h-6", rounded = false }) => (
  <img
    src="/idonate.png"
    alt="iDonate"
    className={`${className} object-contain ${rounded ? 'rounded-full' : ''}`}
  />
);

export default function Mailbox() {
  const { triggerToast } = useAppStore();

  // Direct Mailbox State (Configured via Server Environment)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [activeMailbox, setActiveMailbox] = useState({
    emailAddress: 'contact@idonatedyfiksd.in',
    resourceId: 'contact@idonatedyfiksd.in',
  });
  const [availableMailboxes, setAvailableMailboxes] = useState([]);
  const [quota, setQuota] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Mailbox data state
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 25, total: 0 });
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread' | 'starred'

  // Selected message state (Reading pane)
  const [selectedUid, setSelectedUid] = useState(null);
  const [messageDetail, setMessageDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Multi-select state
  const [selectedUids, setSelectedUids] = useState(new Set());

  // Gmail floating compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isComposeMinimized, setIsComposeMinimized] = useState(false);
  const [isComposeMaximized, setIsComposeMaximized] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // 1. Check Status
  const checkConnectionStatus = useCallback(async () => {
    try {
      setIsCheckingStatus(true);
      const res = await api.get('/super-admin/mailbox/status');
      if (res.data?.connected) {
        if (res.data.activeMailbox) {
          setActiveMailbox(res.data.activeMailbox);
        }
        setAvailableMailboxes(res.data.mailboxes || []);
        setQuota(res.data.quota);
      }
    } catch (err) {
      console.warn('Mailbox status check error:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // 2. Fetch Folders
  const fetchFolders = useCallback(async () => {
    try {
      const res = await api.get('/super-admin/mailbox/folders');
      if (res.data?.success && Array.isArray(res.data.folders)) {
        setFolders(res.data.folders);
      }
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  }, []);

  // 3. Fetch Messages
  const fetchMessages = useCallback(async (folder = currentFolder, page = 1, search = searchQuery) => {
    try {
      setIsLoadingMessages(true);
      const params = { folder, page, perPage: 25 };
      if (search?.trim()) {
        params.search = search.trim();
      }
      const res = await api.get('/super-admin/mailbox/messages', { params });
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setPagination(res.data.pagination || { page, perPage: 25, total: 0 });
        setSelectedUids(new Set());
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      triggerToast('Failed to load messages from mailbox.', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentFolder, searchQuery, triggerToast]);

  // Initial load: runs once on mount
  useEffect(() => {
    checkConnectionStatus();
    fetchFolders();
    fetchMessages('INBOX', 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Folder switch effect
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    fetchMessages(currentFolder, 1);
  }, [currentFolder]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Fetch Message Detail
  const fetchMessageDetail = async (uid) => {
    try {
      setSelectedUid(uid);
      setIsLoadingDetail(true);
      const res = await api.get(`/super-admin/mailbox/messages/${uid}`, {
        params: { folder: currentFolder }
      });
      if (res.data?.success) {
        setMessageDetail(res.data.message);
        setMessages(prev => prev.map(m => m.uid === uid ? { ...m, isRead: true } : m));
      }
    } catch (err) {
      console.error('Failed to load message detail:', err);
      triggerToast('Could not load message details.', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // 5. Refresh Mailbox
  const handleRefreshMailbox = async () => {
    setShowAccountMenu(false);
    try {
      await Promise.all([
        fetchFolders(),
        fetchMessages(currentFolder, pagination.page),
        checkConnectionStatus(),
      ]);
      triggerToast('Mailbox updated.', 'success');
    } catch (err) {
      triggerToast('Refresh failed.', 'error');
    }
  };

  // Toggle Star
  const handleToggleStar = async (uid, currentStarred, e) => {
    if (e) e.stopPropagation();
    const newFlagged = !currentStarred;
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, isStarred: newFlagged } : m));
    if (messageDetail && messageDetail.uid === uid) {
      setMessageDetail(prev => ({ ...prev, isStarred: newFlagged }));
    }

    try {
      const flags = newFlagged ? ['\\Flagged'] : [];
      await api.patch(`/super-admin/mailbox/messages/${uid}/flags`, {
        folder: currentFolder,
        flags,
      });
    } catch (err) {
      console.error('Failed to update star:', err);
    }
  };

  // Toggle Read/Unread
  const handleToggleRead = async (uid, isRead, e) => {
    if (e) e.stopPropagation();
    const newRead = !isRead;
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, isRead: newRead } : m));
    if (messageDetail && messageDetail.uid === uid) {
      setMessageDetail(prev => ({ ...prev, isRead: newRead }));
    }

    try {
      const flags = newRead ? ['\\Seen'] : [];
      await api.patch(`/super-admin/mailbox/messages/${uid}/flags`, {
        folder: currentFolder,
        flags,
      });
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (uid, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/super-admin/mailbox/messages/${uid}`, {
        data: { folder: currentFolder }
      });
      setMessages(prev => prev.filter(m => m.uid !== uid));
      if (selectedUid === uid) {
        setSelectedUid(null);
        setMessageDetail(null);
      }
      triggerToast('Conversation moved to Trash.', 'success');
    } catch (err) {
      triggerToast('Failed to delete email.', 'error');
    }
  };

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedUids.size === filteredMessages.length) {
      setSelectedUids(new Set());
    } else {
      setSelectedUids(new Set(filteredMessages.map(m => m.uid)));
    }
  };

  const toggleSelectUid = (uid, e) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedUids);
    if (next.has(uid)) {
      next.delete(uid);
    } else {
      next.add(uid);
    }
    setSelectedUids(next);
  };

  // Send Email (Gmail Compose)
  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();
    if (!composeTo.trim()) {
      triggerToast('Please specify at least one recipient.', 'warning');
      return;
    }

    const toRecipients = composeTo.split(',').map(s => s.trim()).filter(Boolean);
    const ccRecipients = composeCc ? composeCc.split(',').map(s => s.trim()).filter(Boolean) : [];
    const bccRecipients = composeBcc ? composeBcc.split(',').map(s => s.trim()).filter(Boolean) : [];

    try {
      setIsSending(true);
      const payload = {
        to: toRecipients,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: composeSubject.trim() || '(no subject)',
        text: composeBody,
        html: composeBody ? `<div style="font-family: Roboto, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #202124;">${composeBody.replace(/\n/g, '<br/>')}</div>` : '',
        attachments: composeAttachments,
      };

      const res = await api.post('/super-admin/mailbox/send', payload);
      if (res.data?.success) {
        triggerToast('Message sent.', 'success');
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeCc('');
        setComposeBcc('');
        setComposeSubject('');
        setComposeBody('');
        setComposeAttachments([]);
        if (currentFolder === 'INBOX.Sent') {
          fetchMessages('INBOX.Sent', 1);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send message.';
      triggerToast(msg, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // File Upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        triggerToast(`File ${file.name} exceeds 25 MB limit`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        setComposeAttachments(prev => [
          ...prev,
          {
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            size: file.size,
            content: base64,
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Quick Reply
  const handleStartReply = (msg) => {
    setComposeTo(msg.from?.address || '');
    setComposeSubject(msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`);
    setComposeBody(`\n\nOn ${msg.formattedDate || 'earlier'}, ${msg.from?.name || msg.from?.address} wrote:\n> `);
    setIsComposeOpen(true);
    setIsComposeMinimized(false);
  };

  // Quick Forward
  const handleStartForward = (msg) => {
    setComposeTo('');
    setComposeSubject(msg.subject?.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject || ''}`);
    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${msg.from?.name || ''} <${msg.from?.address || ''}>\nDate: ${msg.formattedDate || ''}\nSubject: ${msg.subject || ''}\nTo: ${msg.to?.map(t => t.address).join(', ')}\n\n${msg.text || ''}`);
    setIsComposeOpen(true);
    setIsComposeMinimized(false);
  };

  // Filter messages
  const filteredMessages = messages.filter(m => {
    if (filterTab === 'unread') return !m.isRead;
    if (filterTab === 'starred') return m.isStarred;
    return true;
  });

  const getFolderIcon = (path, name) => {
    const p = (path || name || '').toLowerCase();
    if (p.includes('sent')) return Send;
    if (p.includes('draft')) return FileText;
    if (p.includes('trash') || p.includes('bin')) return Trash2;
    if (p.includes('spam') || p.includes('junk')) return AlertOctagon;
    if (p.includes('star')) return Star;
    return Inbox;
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter' && isComposeOpen) {
        e.preventDefault();
        handleSendEmail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComposeOpen]);

  // Loading spinner in Gmail style
  if (isCheckingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh]">
        <IDonateLogo className="w-16 h-16 animate-pulse mb-4" />
        <div className="w-48 h-1 bg-[#e0e2ec] rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#e11d48] animate-indeterminate rounded-full" />
        </div>
        <p className="mt-4 text-xs font-medium text-[#444746]">
          Loading iDonate Mail...
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // DIRECT ENTRY: AUTHENTIC GMAIL INTERFACE (MINIMAL & FAST)
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col bg-[#f8fafd] dark:bg-[#1f1f1f] rounded-2xl overflow-hidden border border-[#dadce0] dark:border-[#444746] select-none text-[#1f1f1f] dark:text-white">
      {/* ── Top Gmail Header Bar ── */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 bg-transparent">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 w-56 shrink-0">
          <button className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <IDonateLogo className="w-8 h-8" />
            <span className="text-lg font-bold text-[#b3261e] dark:text-[#ff897d] tracking-tight">
              iDonate <span className="font-normal text-[#444746] dark:text-[#c4c7c5] text-base">Mail</span>
            </span>
          </div>
        </div>

        {/* Center: Iconic Gmail Pill Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative flex items-center bg-[#eaf1fb] dark:bg-[#282a2d] hover:bg-[#e1ebf8] dark:hover:bg-[#313337] focus-within:bg-white dark:focus-within:bg-[#1f1f1f] focus-within:shadow-md focus-within:border-transparent rounded-full px-4 py-2 transition-all border border-transparent">
            <Search className="w-4 h-4 text-[#5f6368] dark:text-[#c4c7c5] shrink-0 mr-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMessages(currentFolder, 1, searchQuery)}
              placeholder="Search in mail"
              className="w-full bg-transparent text-sm text-[#1f1f1f] dark:text-white placeholder-[#5f6368] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchMessages(currentFolder, 1, '');
                }}
                className="p-1 text-[#5f6368] hover:text-[#1f1f1f] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Controls & User Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              fetchFolders();
              fetchMessages(currentFolder, pagination.page);
            }}
            title="Refresh"
            className="p-2.5 rounded-full text-[#5f6368] dark:text-[#c4c7c5] hover:bg-[#eaebef] dark:hover:bg-[#333537] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin text-[#0b57d0]' : ''}`} />
          </button>

          {/* Account Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {(activeMailbox?.emailAddress || 'C').charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Account Menu Dropdown */}
            {showAccountMenu && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-[#28292a] rounded-2xl border border-[#dadce0] dark:border-[#444746] shadow-xl p-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e0e2ec] dark:border-[#444746]">
                  <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-bold text-sm">
                    {(activeMailbox?.emailAddress || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#1f1f1f] dark:text-white truncate">
                      {activeMailbox?.emailAddress || 'contact@idonatedyfiksd.in'}
                    </p>
                    <p className="text-[11px] text-[#5f6368] dark:text-[#c4c7c5]">
                      Connected
                    </p>
                  </div>
                </div>

                <div className="py-2.5 text-xs text-[#5f6368] dark:text-[#c4c7c5]">
                  <p>Storage used: {formatBytes(quota?.storageUsed)} of {formatBytes(quota?.storageLimit || 10737418240)}</p>
                </div>

                <div className="pt-2 border-t border-[#e0e2ec] dark:border-[#444746] flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f2f6fc] dark:bg-[#333537] rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-[#444746] dark:text-[#c4c7c5]">
                      Direct entry via .env credentials
                    </span>
                  </div>
                  <button
                    onClick={handleRefreshMailbox}
                    className="w-full py-2 px-3 rounded-lg hover:bg-[#f2f6fc] dark:hover:bg-[#333537] text-left text-xs font-medium text-[#0b57d0] dark:text-[#a8c7fa] cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Mailbox</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Gmail Body: Left Sidebar + Mail Content Area ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Left Sidebar (Gmail Compose + Navigation) ── */}
        <aside className="w-56 lg:w-60 p-3 flex flex-col justify-between shrink-0">
          <div>
            {/* The Famous Gmail Compose Button */}
            <button
              onClick={() => {
                setIsComposeOpen(true);
                setIsComposeMinimized(false);
              }}
              className="mb-4 py-3.5 px-5 rounded-2xl bg-[#c2e7ff] hover:bg-[#b0dcff] hover:shadow-md text-[#001d35] font-medium text-sm transition-all flex items-center gap-3 cursor-pointer shadow-xs"
            >
              <Edit3 className="w-5 h-5 text-[#001d35]" />
              <span className="font-semibold">Compose</span>
            </button>

            {/* Folders List */}
            <div className="space-y-0.5">
              {folders.map(folder => {
                const Icon = getFolderIcon(folder.path, folder.name);
                const isActive = currentFolder === folder.path;
                return (
                  <button
                    key={folder.id || folder.path}
                    onClick={() => {
                      setCurrentFolder(folder.path);
                      setSelectedUid(null);
                      setMessageDetail(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-r-full text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#d3e3fd] text-[#041e49] font-bold dark:bg-[#004a77] dark:text-[#c2e7ff]'
                        : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#eaebef] dark:hover:bg-[#333537]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#041e49] dark:text-[#c2e7ff]' : 'text-[#444746] dark:text-[#c4c7c5]'}`} />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    {folder.unreadMessages > 0 && (
                      <span className={`text-xs font-bold ${isActive ? 'text-[#041e49] dark:text-[#c2e7ff]' : 'text-[#444746]'}`}>
                        {folder.unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Gmail Storage Meter */}
          <div className="px-3 pt-3 border-t border-[#e0e2ec] dark:border-[#444746] text-[11px] text-[#5f6368] dark:text-[#c4c7c5]">
            <div className="w-full h-1 bg-[#e0e2ec] dark:bg-[#444746] rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#0b57d0] rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(2, ((quota?.storageUsed || 0) / (quota?.storageLimit || 10737418240)) * 100))}%`
                }}
              />
            </div>
            <p>
              {formatBytes(quota?.storageUsed)} of {formatBytes(quota?.storageLimit || 10737418240)} used
            </p>
          </div>
        </aside>

        {/* ── Main Mail Canvas (White card inside Gmail frame) ── */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1f1f1f] rounded-2xl overflow-hidden mr-3 mb-3 border border-[#dadce0] dark:border-[#444746] shadow-xs">
          {/* ── Detail View OR List View ── */}
          {selectedUid ? (
            /* Reading Pane (Gmail conversation view) */
            <div className="flex-1 flex flex-col h-full min-h-0">
              {/* Detail Top Action Bar */}
              <div className="h-12 px-4 border-b border-[#e0e2ec] dark:border-[#444746] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUid(null)}
                    className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer"
                    title="Back to inbox"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteMessage(messageDetail?.uid, e)}
                    className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleToggleRead(messageDetail?.uid, true, e)}
                    className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer"
                    title="Mark as unread"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleToggleStar(messageDetail?.uid, messageDetail?.isStarred, e)}
                    className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer"
                    title="Star"
                  >
                    <Star className={`w-4 h-4 ${messageDetail?.isStarred ? 'text-[#f4b400] fill-[#f4b400]' : ''}`} />
                  </button>
                </div>

                <div className="text-xs text-[#5f6368]">
                  {messageDetail?.formattedDate || ''}
                </div>
              </div>

              {/* Message Content Area */}
              {isLoadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0b57d0]" />
                  <p className="mt-2 text-xs text-[#5f6368]">Loading message...</p>
                </div>
              ) : messageDetail ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Subject Title */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-normal text-[#1f1f1f] dark:text-white">
                      {messageDetail.subject || '(no subject)'}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#eaebef] dark:bg-[#333537] text-[#444746] dark:text-[#c4c7c5]">
                      Inbox
                    </span>
                  </div>

                  {/* Sender Info Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white flex items-center justify-center font-bold text-sm">
                        {(messageDetail.from?.name || messageDetail.from?.address || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1f1f1f] dark:text-white">
                            {messageDetail.from?.name || messageDetail.from?.address}
                          </span>
                          <span className="text-xs text-[#5f6368]">
                            &lt;{messageDetail.from?.address}&gt;
                          </span>
                        </div>
                        <p className="text-xs text-[#5f6368]">
                          to me
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartReply(messageDetail)}
                        className="p-2 rounded-full hover:bg-[#eaebef] dark:hover:bg-[#333537] text-[#5f6368] cursor-pointer"
                        title="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Attachments chips */}
                  {messageDetail.attachments && messageDetail.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {messageDetail.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-lg border border-[#dadce0] dark:border-[#444746] bg-[#f8fafd] dark:bg-[#28292a] flex items-center gap-2 text-xs"
                        >
                          <File className="w-4 h-4 text-[#ea4335]" />
                          <span className="font-medium text-[#1f1f1f] dark:text-white truncate max-w-[150px]">
                            {att.filename}
                          </span>
                          <span className="text-[10px] text-[#5f6368]">({formatBytes(att.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="pt-2 text-sm text-[#202124] dark:text-[#e3e3e3] leading-relaxed">
                    {messageDetail.html ? (
                      <div className="rounded-lg overflow-hidden border border-[#e0e2ec] dark:border-[#444746] bg-white">
                        <iframe
                          title="gmail-email-content"
                          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8" />
                                <style>
                                  body {
                                    font-family: Roboto, Arial, sans-serif;
                                    font-size: 14px;
                                    line-height: 1.5;
                                    color: #202124;
                                    margin: 16px;
                                  }
                                  img { max-width: 100%; height: auto; }
                                  a { color: #0b57d0; }
                                </style>
                              </head>
                              <body>
                                ${messageDetail.html}
                              </body>
                            </html>
                          `}
                          className="w-full min-h-[400px] border-none"
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans">
                        {messageDetail.text || '(No content)'}
                      </div>
                    )}
                  </div>

                  {/* Gmail Bottom Quick Actions: Reply & Forward */}
                  <div className="pt-6 border-t border-[#e0e2ec] dark:border-[#444746] flex items-center gap-3">
                    <button
                      onClick={() => handleStartReply(messageDetail)}
                      className="px-5 py-2 rounded-full border border-[#747775] hover:bg-[#f2f6fc] dark:hover:bg-[#333537] text-xs font-semibold text-[#1f1f1f] dark:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </button>
                    <button
                      onClick={() => handleStartForward(messageDetail)}
                      className="px-5 py-2 rounded-full border border-[#747775] hover:bg-[#f2f6fc] dark:hover:bg-[#333537] text-xs font-semibold text-[#1f1f1f] dark:text-white flex items-center gap-2 cursor-pointer"
                    >
                      <Forward className="w-3.5 h-3.5" /> Forward
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* Message List View */
            <div className="flex-1 flex flex-col h-full min-h-0">
              {/* List Header: Checkbox, Refresh, Filter tabs */}
              <div className="h-12 px-4 border-b border-[#e0e2ec] dark:border-[#444746] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 text-[#5f6368] hover:text-[#1f1f1f] cursor-pointer"
                  >
                    {selectedUids.size > 0 && selectedUids.size === filteredMessages.length ? (
                      <CheckSquare className="w-4 h-4 text-[#0b57d0]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => fetchMessages(currentFolder, pagination.page)}
                    className="p-1 text-[#5f6368] hover:text-[#1f1f1f] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Gmail Category Filter */}
                  <div className="flex items-center gap-1 ml-2">
                    {[
                      { id: 'all', label: 'Primary' },
                      { id: 'unread', label: 'Unread' },
                      { id: 'starred', label: 'Starred' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterTab(tab.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          filterTab === tab.id
                            ? 'bg-[#c2e7ff] text-[#001d35] font-bold'
                            : 'text-[#5f6368] hover:bg-[#eaebef]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                  <span>
                    {pagination.total > 0
                      ? `${(pagination.page - 1) * pagination.perPage + 1}–${Math.min(pagination.page * pagination.perPage, pagination.total)} of ${pagination.total}`
                      : '0 of 0'}
                  </span>
                  <div className="flex items-center">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => fetchMessages(currentFolder, pagination.page - 1)}
                      className="p-1 hover:bg-[#eaebef] rounded-full disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={pagination.page * pagination.perPage >= pagination.total}
                      onClick={() => fetchMessages(currentFolder, pagination.page + 1)}
                      className="p-1 hover:bg-[#eaebef] rounded-full disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Gmail Message Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#e0e2ec] dark:divide-[#444746]">
                {isLoadingMessages ? (
                  <div className="p-8 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0b57d0] mb-2" />
                    <p className="text-xs text-[#5f6368]">Loading conversations...</p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <IDonateLogo className="w-12 h-12 opacity-50 mb-3" />
                    <p className="text-sm font-medium text-[#1f1f1f] dark:text-white">Your inbox is empty</p>
                    <p className="text-xs text-[#5f6368] mt-0.5">No conversations in this category.</p>
                  </div>
                ) : (
                  filteredMessages.map(msg => {
                    const isChecked = selectedUids.has(msg.uid);
                    return (
                      <div
                        key={msg.uid}
                        onClick={() => fetchMessageDetail(msg.uid)}
                        className={`h-11 px-4 flex items-center gap-3 text-xs transition-colors cursor-pointer group ${
                          !msg.isRead
                            ? 'bg-white dark:bg-[#1f1f1f] font-bold text-[#1f1f1f] dark:text-white'
                            : 'bg-[#f2f6fc]/50 dark:bg-[#28292a]/50 text-[#444746] dark:text-[#c4c7c5]'
                        } hover:shadow-xs hover:bg-[#eaebef]/70 dark:hover:bg-[#333537]`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => toggleSelectUid(msg.uid, e)}
                          className="p-1 text-[#5f6368] hover:text-[#1f1f1f] cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#0b57d0]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        {/* Star */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(msg.uid, msg.isStarred, e)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              msg.isStarred
                                ? 'text-[#f4b400] fill-[#f4b400]'
                                : 'text-[#c4c7c5] hover:text-[#5f6368]'
                            }`}
                          />
                        </button>

                        {/* Sender */}
                        <span className={`w-40 sm:w-48 truncate shrink-0 ${!msg.isRead ? 'font-bold text-[#1f1f1f] dark:text-white' : 'font-normal'}`}>
                          {msg.from?.name || msg.from?.address}
                        </span>

                        {/* Subject - Snippet (True Gmail layout) */}
                        <div className="flex-1 truncate flex items-center gap-1.5 min-w-0">
                          <span className={`truncate ${!msg.isRead ? 'font-bold text-[#1f1f1f] dark:text-white' : 'font-normal'}`}>
                            {msg.subject || '(no subject)'}
                          </span>
                          <span className="text-[#5f6368] dark:text-[#8e918f] font-normal truncate">
                            - {msg.text ? msg.text.substring(0, 100) : ''}
                          </span>
                        </div>

                        {/* Paperclip if attachments */}
                        {msg.hasAttachments && (
                          <Paperclip className="w-3.5 h-3.5 text-[#5f6368] shrink-0" />
                        )}

                        {/* Date on Right */}
                        <span className={`text-[11px] shrink-0 font-medium ${!msg.isRead ? 'font-bold text-[#1f1f1f] dark:text-white' : 'text-[#5f6368]'}`}>
                          {msg.formattedDate}
                        </span>

                        {/* Quick hover action: Delete */}
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMessage(msg.uid, e)}
                            className="p-1 rounded-full hover:bg-slate-200 text-[#5f6368] hover:text-[#b3261e] cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* GMAIL FLOATING COMPOSE WINDOW                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isComposeOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed z-50 bg-white dark:bg-[#28292a] border border-[#dadce0] dark:border-[#444746] rounded-t-xl shadow-2xl overflow-hidden flex flex-col ${
              isComposeMaximized
                ? 'inset-6 sm:inset-10 rounded-xl'
                : isComposeMinimized
                ? 'bottom-0 right-10 w-72 h-10'
                : 'bottom-0 right-10 w-[90vw] sm:w-[540px] h-[520px]'
            }`}
          >
            {/* Dark Top Title Bar in authentic Gmail style */}
            <div className="h-10 px-4 bg-[#f2f6fc] dark:bg-[#1f1f1f] border-b border-[#e0e2ec] dark:border-[#444746] flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-[#1f1f1f] dark:text-white">
                New Message
              </span>
              <div className="flex items-center gap-1 text-[#5f6368]">
                <button
                  type="button"
                  onClick={() => setIsComposeMinimized(!isComposeMinimized)}
                  className="p-1 hover:bg-[#eaebef] rounded cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsComposeMaximized(!isComposeMaximized)}
                  className="p-1 hover:bg-[#eaebef] rounded cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1 hover:bg-[#eaebef] rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compose Form */}
            {!isComposeMinimized && (
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col min-h-0">
                {/* Recipients */}
                <div className="px-4 py-2 border-b border-[#e0e2ec] dark:border-[#444746] flex items-center gap-2">
                  <span className="text-xs text-[#5f6368] w-8">To</span>
                  <input
                    type="text"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="Recipients"
                    className="flex-1 text-xs text-[#1f1f1f] dark:text-white bg-transparent focus:outline-none"
                    required
                  />
                  <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                    {!showCc && (
                      <button type="button" onClick={() => setShowCc(true)} className="hover:text-[#1f1f1f] cursor-pointer">
                        Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button type="button" onClick={() => setShowBcc(true)} className="hover:text-[#1f1f1f] cursor-pointer">
                        Bcc
                      </button>
                    )}
                  </div>
                </div>

                {/* CC */}
                {showCc && (
                  <div className="px-4 py-2 border-b border-[#e0e2ec] dark:border-[#444746] flex items-center gap-2">
                    <span className="text-xs text-[#5f6368] w-8">Cc</span>
                    <input
                      type="text"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="flex-1 text-xs text-[#1f1f1f] dark:text-white bg-transparent focus:outline-none"
                    />
                  </div>
                )}

                {/* BCC */}
                {showBcc && (
                  <div className="px-4 py-2 border-b border-[#e0e2ec] dark:border-[#444746] flex items-center gap-2">
                    <span className="text-xs text-[#5f6368] w-8">Bcc</span>
                    <input
                      type="text"
                      value={composeBcc}
                      onChange={(e) => setComposeBcc(e.target.value)}
                      className="flex-1 text-xs text-[#1f1f1f] dark:text-white bg-transparent focus:outline-none"
                    />
                  </div>
                )}

                {/* Subject */}
                <div className="px-4 py-2 border-b border-[#e0e2ec] dark:border-[#444746]">
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full text-xs text-[#1f1f1f] dark:text-white bg-transparent focus:outline-none"
                  />
                </div>

                {/* Attachment chips */}
                {composeAttachments.length > 0 && (
                  <div className="px-4 py-1.5 bg-[#f8fafd] border-b border-[#e0e2ec] flex flex-wrap gap-2">
                    {composeAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-[#dadce0] text-[11px] flex items-center gap-1.5"
                      >
                        <Paperclip className="w-3 h-3 text-[#5f6368]" />
                        <span className="truncate max-w-[120px]">{att.filename}</span>
                        <button
                          type="button"
                          onClick={() => setComposeAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-[#5f6368] hover:text-[#b3261e]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Body Textarea */}
                <div className="flex-1 p-4 min-h-0">
                  <textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Compose email"
                    className="w-full h-full bg-transparent text-sm text-[#1f1f1f] dark:text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Gmail Bottom Toolbar with Blue Send Pill */}
                <div className="h-12 px-4 border-t border-[#e0e2ec] dark:border-[#444746] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </>
                      ) : (
                        <span>Send</span>
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full hover:bg-[#eaebef] text-[#5f6368] cursor-pointer"
                      title="Attach files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsComposeOpen(false);
                      setComposeTo('');
                      setComposeSubject('');
                      setComposeBody('');
                      setComposeAttachments([]);
                    }}
                    className="p-2 rounded-full hover:bg-[#eaebef] text-[#5f6368] hover:text-[#b3261e] cursor-pointer"
                    title="Discard draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

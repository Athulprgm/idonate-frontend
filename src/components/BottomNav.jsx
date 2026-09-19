import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import {
  LayoutDashboard,
  Droplets,
  Megaphone,
  User,
  Users,
  Mail,
  Menu,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav({ onOpenMenu }) {
  const { user } = useAuthStore();
  const { notifications } = useAppStore();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read && !n.is_read).length;

  const role = user?.role || 'user';

  // Determine dashboard link according to user role
  const dashboardLink =
    role === 'technical_admin' ? '/technical-admin/dashboard' :
      role === 'super_admin' ? '/super-admin/dashboard' :
        (role === 'block_admin' || role === 'admin') ? '/block-admin/dashboard' :
          (role === 'volunteer' || role === 'meghala' || role === 'meghala_volunteer') ? '/volunteer/dashboard' :
            role === 'unit_squad' ? '/unit-squad/dashboard' :
              '/dashboard';

  // Role-customized nav items
  let navItems = [];

  if (role === 'super_admin' || role === 'technical_admin') {
    navItems = [
      { to: dashboardLink, label: 'Dashboard', icon: LayoutDashboard },
      { to: '/super-admin/mailbox', label: 'Mailbox', icon: Mail },
      { to: '/requests', label: 'Requests', icon: Droplets },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/profile', label: 'Profile', icon: User },
    ];
  } else if (role === 'block_admin' || role === 'admin') {
    navItems = [
      { to: dashboardLink, label: 'Dashboard', icon: LayoutDashboard },
      { to: '/volunteer/accepted-donors', label: 'Accepted', icon: HeartHandshake },
      { to: '/requests', label: 'Requests', icon: Droplets },
      { to: '/admin/volunteers', label: 'Meghalas', icon: Users },
      { to: '/profile', label: 'Profile', icon: User },
    ];
  } else if (['volunteer', 'meghala', 'meghala_volunteer', 'unit_squad'].includes(role)) {
    navItems = [
      { to: dashboardLink, label: 'Dashboard', icon: LayoutDashboard },
      { to: '/volunteer/accepted-donors', label: 'Accepted', icon: HeartHandshake },
      { to: '/requests', label: 'Requests', icon: Droplets },
      { to: '/volunteer/users', label: 'Donors', icon: Users },
      { to: '/profile', label: 'Profile', icon: User },
    ];
  } else {
    // Standard User / Donor
    navItems = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/requests', label: 'Requests', icon: Droplets },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/profile', label: 'Profile', icon: User },
    ];
  }

  const isCurrentActive = (to) => {
    try {
      const toUrl = new URL(to, window.location.origin);
      return location.pathname === toUrl.pathname;
    } catch {
      return location.pathname === to;
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] lg:hidden select-none transition-all"
    >
      <div className="flex items-center justify-around px-1 h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer ${
                active ? 'text-rose-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute -top-[1px] w-8 h-1 bg-rose-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  active ? 'bg-rose-50 text-rose-600 scale-105' : 'bg-transparent text-slate-500'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>

              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate max-w-[62px]">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu Toggle Button for full Sidebar drawer */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center justify-center h-full py-1 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          aria-label="Open full menu"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100/80 text-slate-600">
            <Menu className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate text-slate-500 font-medium">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, LayoutDashboard, Plus, LogOut, User, Moon, Sun, Languages, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { toggleTheme, isDark } from '../utils/theme.js';
import { useI18n } from '../utils/i18n.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore();
  const { t, locale, setLocale } = useI18n();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  const isAdmin = profile?.role === 'admin';

  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link to="/" className="shrink-0"><Logo /></Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          <NavLink to="/browse" className={linkCls}>{t('nav.browse')}</NavLink>
          {user && <NavLink to="/favourites" className={linkCls}>{t('nav.favourites')}</NavLink>}
          {user && <NavLink to="/messages" className={linkCls}>{t('nav.messages')}</NavLink>}
          {user && <NavLink to="/dashboard" className={linkCls}>{t('nav.dashboard')}</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkCls}><Shield className="inline w-4 h-4 mr-1" />{t('nav.admin')}</NavLink>}
        </nav>

        <div className="flex-1" />

        <button onClick={() => { setLocale(locale === 'ar' ? 'en' : 'ar'); }}
          className="hidden sm:inline-flex btn-ghost px-2.5 py-2" title="Language">
          <Languages className="w-4 h-4" />
          <span className="text-xs font-bold">{locale === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        <button onClick={() => { toggleTheme(); force((x) => x + 1); }}
          className="hidden sm:inline-flex btn-ghost px-2.5 py-2" title="Theme">
          {isDark() ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/sell" className="hidden sm:inline-flex btn-primary"><Plus className="w-4 h-4" />{t('nav.sell')}</Link>

        {user ? (
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white grid place-items-center text-sm font-bold">
                  {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                </div>
              )}
            </button>
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-1 w-56 card shadow-soft p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <div className="text-sm font-semibold truncate">{profile?.full_name || user.email}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><User className="w-4 h-4" />{t('nav.profile')}</Link>
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><LayoutDashboard className="w-4 h-4" />{t('nav.dashboard')}</Link>
              <Link to="/favourites" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Heart className="w-4 h-4" />{t('nav.favourites')}</Link>
              <Link to="/messages" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><MessageCircle className="w-4 h-4" />{t('nav.messages')}</Link>
              <button onClick={async () => { await signOut(); nav('/'); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600">
                <LogOut className="w-4 h-4" />{t('nav.signout')}
              </button>
            </div>
          </div>
        ) : (
          <Link to="/auth" className="btn-secondary">{t('nav.signin')}</Link>
        )}

        <button onClick={() => setOpen((o) => !o)} className="md:hidden btn-ghost p-2">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-col gap-1 bg-white dark:bg-slate-950">
          <NavLink onClick={() => setOpen(false)} to="/browse" className={linkCls}>{t('nav.browse')}</NavLink>
          {user && <NavLink onClick={() => setOpen(false)} to="/favourites" className={linkCls}>{t('nav.favourites')}</NavLink>}
          {user && <NavLink onClick={() => setOpen(false)} to="/messages" className={linkCls}>{t('nav.messages')}</NavLink>}
          {user && <NavLink onClick={() => setOpen(false)} to="/dashboard" className={linkCls}>{t('nav.dashboard')}</NavLink>}
          {isAdmin && <NavLink onClick={() => setOpen(false)} to="/admin" className={linkCls}>{t('nav.admin')}</NavLink>}
          <Link onClick={() => setOpen(false)} to="/sell" className="btn-primary mt-2"><Plus className="w-4 h-4" />{t('nav.sell')}</Link>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="btn-secondary flex-1"><Languages className="w-4 h-4" />{locale === 'ar' ? 'EN' : 'ع'}</button>
            <button onClick={() => { toggleTheme(); force((x) => x + 1); }} className="btn-secondary flex-1">{isDark() ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}Theme</button>
          </div>
        </div>
      )}
    </header>
  );
}

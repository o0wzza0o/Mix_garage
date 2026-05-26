import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/auth.js';
import Logo from '../components/Logo.jsx';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        toast.success('Welcome back');
      } else {
        await signUpWithEmail({ email, password, full_name: name });
        toast.success('Account created');
      }
      nav(redirect);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally { setBusy(false); }
  };

  const google = async () => {
    try { await signInWithGoogle(); }
    catch (e) { toast.error(e.message || 'Google sign-in failed'); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white p-12 items-center">
        <div>
          <Logo size={48} />
          <h2 className="text-4xl font-extrabold mt-8 leading-tight">The smart way to buy and sell cars.</h2>
          <p className="mt-4 text-white/80 max-w-sm">Join Mix Garage today — find your next ride, or list yours and reach thousands of buyers.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md card p-7 shadow-soft animate-slide-up">
          <h1 className="text-2xl font-extrabold">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'signin' ? "New here? " : 'Already have an account? '}
            <button className="text-brand-700 font-semibold hover:underline" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
          {/*
       <button onClick={google} type="button" className="btn-secondary w-full mt-5">
            <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8.4 19.7-20 0-1.2-.1-2.4-.3-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.5 6.1 29.5 4 24 4 16.4 4 9.8 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.6 35 27 36 24 36c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.6 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.3 5.3c-.5.4 6.6-4.8 6.6-14.9 0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>
          */}
          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />or<div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="label">Full name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button disabled={busy} className="btn-primary w-full mt-2">
              {busy ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-5 text-center">
            By continuing you agree to our <Link to="#" className="underline">Terms</Link> & <Link to="#" className="underline">Privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

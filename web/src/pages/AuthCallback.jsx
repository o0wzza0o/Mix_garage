import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => {
    // Supabase JS detects session in URL automatically; just redirect once we have it.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      nav(data.session ? '/' : '/auth', { replace: true });
    }, 400);
    return () => clearTimeout(t);
  }, [nav]);
  return <div className="p-12 text-center text-slate-500">Signing you in…</div>;
}

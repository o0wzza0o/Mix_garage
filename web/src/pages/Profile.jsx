import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { updateProfile, uploadAvatar } from '../services/auth.js';
import { EG_GOVERNORATES } from '../utils/constants.js';

export default function Profile() {
  const { user, profile, loadProfile } = useAuthStore();
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(user.id, {
        full_name: form.full_name, phone: form.phone, whatsapp: form.whatsapp,
        city: form.city, governorate: form.governorate, bio: form.bio,
      });
      toast.success('Profile saved');
      await loadProfile();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const onAvatar = async (file) => {
    if (!file) return;
    setAvatarBusy(true);
    try {
      const url = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: url });
      await loadProfile();
      toast.success('Avatar updated');
    } catch (e) { toast.error(e.message); } finally { setAvatarBusy(false); }
  };

  if (!profile) return <div className="p-10 text-center text-slate-500">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Your profile</h1>

      <div className="card p-5 flex items-center gap-4 mb-4">
        <div className="relative">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-700 text-white grid place-items-center text-2xl font-bold">
              {(profile.full_name || user.email || '?')[0].toUpperCase()}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-8 h-8 rounded-full bg-brand-700 text-white grid place-items-center cursor-pointer hover:bg-brand-800">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" disabled={avatarBusy}
              onChange={(e) => onAvatar(e.target.files?.[0])} />
          </label>
        </div>
        <div>
          <div className="font-bold text-lg">{profile.full_name || 'Unnamed'}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          <span className="chip capitalize mt-1 inline-block">{profile.role}</span>
        </div>
      </div>

      <form onSubmit={save} className="card p-5 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Phone</label><input className="input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} /></div>
          <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">City</label><input className="input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} /></div>
          <div>
            <label className="label">Governorate</label>
            <select className="input" value={form.governorate || ''} onChange={(e) => set('governorate', e.target.value)}>
              <option value="">Select…</option>
              {EG_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea rows={3} className="input" value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        </div>
        <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}

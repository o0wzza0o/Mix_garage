import { useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { FUEL_TYPES, TRANSMISSIONS, CONDITIONS, POPULAR_MAKES, EG_GOVERNORATES, YEARS } from '../utils/constants.js';

const empty = {
  title: '', description: '', price: '', negotiable: false,
  make: '', model: '', year: new Date().getFullYear(), mileage: '',
  fuel_type: 'petrol', transmission: 'automatic', color: '', condition: 'used',
  city: '', governorate: '', whatsapp: '',
};

export default function ListingForm({
  initial, existingImages = [], onSubmit, onDeleteImage, submitting, submitLabel = 'Publish',
}) {
  const [form, setForm] = useState({ ...empty, ...(initial || {}) });
  const [files, setFiles] = useState([]); // newly added File objects
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addFiles = (list) => {
    const arr = Array.from(list || []);
    const total = files.length + existingImages.length + arr.length;
    if (total > 15) {
      toast.error('Max 15 photos per listing');
      return;
    }
    setFiles((f) => [...f, ...arr]);
  };

  const removeNew = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.price || Number(form.price) < 0) return toast.error('Valid price required');
    if (!form.make || !form.model || !form.year) return toast.error('Make, model and year are required');
    onSubmit({
      ...form,
      price: Number(form.price),
      year: Number(form.year),
      mileage: form.mileage === '' ? null : Number(form.mileage),
    }, files);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card p-5">
        <h3 className="font-bold mb-4">Basic info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. 2019 Toyota Corolla XLi - Excellent condition" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea rows={5} className="input" placeholder="Describe the car, history, features..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div>
            <label className="label">Price (EGP) *</label>
            <input type="number" min="0" className="input" value={form.price} onChange={(e) => set('price', e.target.value)} required />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.negotiable} onChange={(e) => set('negotiable', e.target.checked)} className="w-4 h-4 accent-brand-700" />
              <span className="text-sm font-medium">Price is negotiable</span>
            </label>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-bold mb-4">Vehicle details</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Make *</label>
            <input list="makes" className="input" value={form.make} onChange={(e) => set('make', e.target.value)} required />
            <datalist id="makes">{POPULAR_MAKES.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className="label">Model *</label>
            <input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} required />
          </div>
          <div>
            <label className="label">Year *</label>
            <select className="input" value={form.year} onChange={(e) => set('year', e.target.value)} required>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Mileage (km)</label>
            <input type="number" min="0" className="input" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
          </div>
          <div>
            <label className="label">Fuel</label>
            <select className="input capitalize" value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
              {FUEL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Transmission</label>
            <select className="input capitalize" value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
              {TRANSMISSIONS.map((x) => <option key={x} value={x}>{x.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <input className="input" value={form.color || ''} onChange={(e) => set('color', e.target.value)} />
          </div>
          <div>
            <label className="label">Condition</label>
            <select className="input capitalize" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              {CONDITIONS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-bold mb-4">Location & contact</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Governorate</label>
            <select className="input" value={form.governorate || ''} onChange={(e) => set('governorate', e.target.value)}>
              <option value="">Select...</option>
              {EG_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">WhatsApp number</label>
            <input className="input" placeholder="+20..." value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-bold mb-1">Photos</h3>
        <p className="text-xs text-slate-500 mb-4">Up to 15 photos. The first photo is the cover.</p>

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-700/10 transition">
          <Upload className="w-7 h-7 text-slate-400" />
          <div className="text-sm font-semibold">Click to upload</div>
          <div className="text-xs text-slate-500">PNG, JPG, WebP — max 5 MB each</div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </label>

        {(existingImages.length > 0 || files.length > 0) && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
            {existingImages.slice().sort((a, b) => a.order_index - b.order_index).map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-700 text-white text-[10px] font-bold inline-flex items-center gap-1"><Star className="w-2.5 h-2.5" />Cover</span>}
                {onDeleteImage && (
                  <button type="button" onClick={() => onDeleteImage(img)}
                    className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-black/60 text-white hover:bg-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1 left-1 chip bg-emerald-100 text-emerald-800 text-[10px]">New</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="btn-primary px-6">
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

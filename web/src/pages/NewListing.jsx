import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ListingForm from '../components/ListingForm.jsx';
import { createListing, uploadListingImage } from '../services/listings.js';
import { useAuthStore } from '../store/authStore.js';

export default function NewListing() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (data, files) => {
    setBusy(true);
    try {
      const created = await createListing({ ...data, seller_id: user.id, status: 'active' });
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await uploadListingImage(user.id, created.id, files[i], i);
      }
      toast.success('Listing published');
      nav(`/listings/${created.id}`);
    } catch (e) {
      toast.error(e.message || 'Could not create listing');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Sell your car</h1>
      <ListingForm onSubmit={onSubmit} submitting={busy} submitLabel="Publish listing" />
    </div>
  );
}

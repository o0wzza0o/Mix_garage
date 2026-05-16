import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ListingForm from '../components/ListingForm.jsx';
import {
  fetchListingById, updateListing, uploadListingImage, deleteListingImage,
} from '../services/listings.js';
import { useAuthStore } from '../store/authStore.js';

export default function EditListing() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const l = await fetchListingById(id);
        if (!l) { toast.error('Not found'); nav('/dashboard'); return; }
        if (l.seller_id !== user.id) { toast.error('Not authorized'); nav('/'); return; }
        setListing(l);
        setImages(l.images || []);
      } finally { setLoading(false); }
    })();
  }, [id, user.id, nav]);

  const onDeleteImage = async (img) => {
    try {
      await deleteListingImage(img);
      setImages((arr) => arr.filter((x) => x.id !== img.id));
    } catch (e) { toast.error(e.message); }
  };

  const onSubmit = async (data, files) => {
    setBusy(true);
    try {
      await updateListing(id, data);
      const startIndex = images.length;
      for (let i = 0; i < files.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await uploadListingImage(user.id, id, files[i], startIndex + i);
      }
      toast.success('Listing updated');
      nav(`/listings/${id}`);
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!listing) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Edit listing</h1>
      <ListingForm
        initial={listing}
        existingImages={images}
        onDeleteImage={onDeleteImage}
        onSubmit={onSubmit}
        submitting={busy}
        submitLabel="Save changes"
      />
    </div>
  );
}

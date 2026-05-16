export default function Logo({ size = 32, withText = true }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" className="rounded-xl">
        <rect width="64" height="64" rx="14" fill="#0F6E56" />
        <path d="M14 38l4-12a4 4 0 0 1 3.8-2.8h20.4A4 4 0 0 1 46 26l4 12v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-2H21v2a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-8z" fill="#fff" />
        <circle cx="22" cy="42" r="3" fill="#0F6E56" />
        <circle cx="42" cy="42" r="3" fill="#0F6E56" />
      </svg>
      {withText && (
        <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
          Mix <span className="text-brand-700 dark:text-brand-400">Garage</span>
        </span>
      )}
    </div>
  );
}

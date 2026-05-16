import { Car } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', subtitle, action, icon }) {
  const Icon = icon || Car;
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-700/20 grid place-items-center text-brand-700 dark:text-brand-400 mb-4">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

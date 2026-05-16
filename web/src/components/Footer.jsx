import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="text-sm text-slate-500 mt-3 max-w-xs">A trusted marketplace to buy and sell cars in your area.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><a href="/browse" className="hover:text-brand-700">Browse cars</a></li>
            <li><a href="/sell" className="hover:text-brand-700">Sell a car</a></li>
            <li><a href="/favourites" className="hover:text-brand-700">Favourites</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><a href="#" className="hover:text-brand-700">About</a></li>
            <li><a href="#" className="hover:text-brand-700">Contact</a></li>
            <li><a href="#" className="hover:text-brand-700">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Stay safe</h4>
          <p className="text-sm text-slate-500">Always inspect the vehicle and meet in a public place.</p>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Mix Garage. All rights reserved.
      </div>
    </footer>
  );
}

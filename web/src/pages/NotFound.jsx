import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div>
        <div className="text-7xl font-extrabold text-brand-700">404</div>
        <h1 className="text-xl font-bold mt-2">Page not found</h1>
        <p className="text-slate-500 mt-1">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary mt-5 inline-flex">Go home</Link>
      </div>
    </div>
  );
}

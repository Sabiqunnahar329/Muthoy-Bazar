import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <img src="/logo.png" alt="" className="h-24 w-24 object-contain" />
      <h1 className="text-3xl font-bold text-brand">Page not found</h1>
      <p className="text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/" className="rounded-lg bg-cta px-6 py-2.5 font-semibold text-white">Back to home</Link>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <h1 className="text-6xl font-bold text-slate-200">404</h1>
      <p className="text-lg text-slate-600">Page not found</p>
      <Link
        href="/"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Go Home
      </Link>
    </div>
  );
}

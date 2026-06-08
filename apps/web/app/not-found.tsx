import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-gray-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Receipt missing
        </h1>
        <p className="mt-4 text-gray-400">The thermal paper trail ends here.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-neutral-700 px-5 py-3 text-sm text-gray-300 transition-colors hover:border-neutral-500 hover:text-white"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

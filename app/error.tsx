"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Something went wrong.</h1>
          <p className="text-sm text-slate-600 mt-2">
            Please reload the page. Your draft is saved locally.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

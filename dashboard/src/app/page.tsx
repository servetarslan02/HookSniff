export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">🪝 Hookrelay</h1>
      <p className="text-xl text-gray-600 mb-8">
        Reliable webhook delivery for developers
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/dashboard"
          className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
        >
          Go to Dashboard
        </a>
        <a
          href="/dashboard/docs"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          API Docs
        </a>
      </div>
    </div>
  );
}

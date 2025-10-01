import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Custom Chatbots App</h1>

        <div className="space-y-4">
          <p className="text-lg">Welcome to the Custom Chatbots Platform</p>

          <nav className="flex flex-col gap-4 mt-8">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-center"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-center"
            >
              Sign Up
            </Link>
            <Link
              href="/create-bot"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 text-center"
            >
              Create Bot
            </Link>
            <Link
              href="/my-bots"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-center"
            >
              My Bots
            </Link>
            <Link
              href="/subscribe"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 text-center"
            >
              Browse Bots
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}

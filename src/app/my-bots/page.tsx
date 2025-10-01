"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { getUserBots, deleteBot, type Bot } from "@/lib/database";
import Link from "next/link";

export default function MyBotsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadBots();
    }
  }, [user, authLoading, router]);

  const loadBots = async () => {
    if (!user) return;

    try {
      const userBots = await getUserBots(user.id);
      setBots(userBots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (botId: string) => {
    if (!confirm("Are you sure you want to delete this bot?")) return;

    try {
      await deleteBot(botId);
      setBots(bots.filter((bot) => bot.id !== botId));
      alert("Bot deleted successfully");
    } catch (err: any) {
      alert("Error deleting bot: " + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Bots</h1>
          <Link
            href="/create-bot"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Create New Bot
          </Link>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {bots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't created any bots yet.</p>
            <Link
              href="/create-bot"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Create Your First Bot
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <img
                  src={bot.profile_pic_url}
                  alt={bot.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{bot.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {bot.description || "No description"}
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    {bot.training_data.length} training file(s)
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/bot/${bot.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
                    >
                      Chat
                    </Link>
                    <button
                      onClick={() => handleDelete(bot.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getAllBots, type Bot } from "@/lib/database";
import Link from "next/link";

export default function SubscribePage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const allBots = await getAllBots();
      setBots(allBots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">Loading bots...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Browse Bots</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {bots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No bots available yet.</p>
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
                  <Link
                    href={`/bot/${bot.id}`}
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
                  >
                    View Bot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

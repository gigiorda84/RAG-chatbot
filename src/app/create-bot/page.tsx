"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { createBot } from "@/lib/database";
import { uploadBotPicture, uploadBotData } from "@/utils/upload";

export default function CreateBotPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [dataFiles, setDataFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setLoading(true);

    try {
      // Validate
      if (!name || !profilePic) {
        throw new Error("Name and profile picture are required");
      }

      // Create temporary bot ID
      const tempBotId = `${user.id}-${Date.now()}`;

      // Upload profile picture
      const profilePicUrl = await uploadBotPicture(profilePic, tempBotId);
      if (!profilePicUrl) {
        throw new Error("Failed to upload profile picture");
      }

      // Upload data files
      const trainingData: string[] = [];
      if (dataFiles) {
        for (let i = 0; i < dataFiles.length; i++) {
          const file = dataFiles[i];
          const filePath = await uploadBotData(file, tempBotId);
          if (filePath) {
            trainingData.push(filePath);
          }
        }
      }

      // Create bot in database
      await createBot({
        name,
        description,
        creator_id: user.id,
        profile_pic_url: profilePicUrl,
        training_data: trainingData,
      });

      alert("Bot created successfully!");
      router.push("/my-bots");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Bot</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Bot Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="My Awesome Bot"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your bot..."
              rows={4}
            />
          </div>

          <div>
            <label
              htmlFor="profilePic"
              className="block text-sm font-medium mb-2"
            >
              Profile Picture * (Max 5MB)
            </label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label
              htmlFor="dataFiles"
              className="block text-sm font-medium mb-2"
            >
              Training Data Files (Text/PDF, Max 5MB each)
            </label>
            <input
              type="file"
              id="dataFiles"
              accept=".txt,.pdf"
              multiple
              onChange={(e) => setDataFiles(e.target.files)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload files that your bot will use as knowledge base
            </p>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Creating Bot..." : "Create Bot"}
          </button>
        </form>
      </div>
    </div>
  );
}

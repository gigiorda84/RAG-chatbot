"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { getBotById, type Bot } from "@/lib/database";
import { getBotDataContent } from "@/utils/upload";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function BotChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  const [bot, setBot] = useState<Bot | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    loadBot();
  }, [id, user]);

  const loadBot = async () => {
    try {
      const botData = await getBotById(id);
      setBot(botData);

      // For now, give everyone access (Stripe disabled)
      if (user) {
        setHasAccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !bot || !user) return;

    if (!hasAccess) {
      alert("You need to subscribe to chat with this bot");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setSending(true);

    try {
      // Load training data
      let knowledgeBase = "";
      for (const filePath of bot.training_data) {
        const content = await getBotDataContent(filePath);
        if (content) {
          knowledgeBase += content + "\n\n";
        }
      }

      // Build context for Gemini
      const systemContext = `You are ${bot.name}. ${
        bot.description ? bot.description : ""
      }

${knowledgeBase ? `Use this knowledge to answer questions:\n${knowledgeBase}` : ""}

Respond to the user's message in a helpful and engaging way.`;

      // Build conversation history for Gemini
      const conversationHistory = messages.map(m =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      ).join("\n");

      const fullPrompt = `${systemContext}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ""}
User: ${currentInput}
Assistant:`;

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.candidates[0].content.parts[0].text,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError("Failed to send message: " + err.message);
      alert("Error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">Loading bot...</div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">Error: {error || "Bot not found"}</p>
          <button
            onClick={() => router.push("/subscribe")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4">Please login to chat with bots</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Stripe features disabled for now
  // if (!hasAccess) {
  //   return subscription page
  // }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Bot Header */}
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4 flex items-center gap-4">
          <img
            src={bot.profile_pic_url}
            alt={bot.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold">{bot.name}</h1>
            <p className="text-sm text-gray-600">{bot.description}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p>Start a conversation with {bot.name}!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

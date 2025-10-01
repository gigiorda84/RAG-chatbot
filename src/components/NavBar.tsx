"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function NavBar() {
  const { user } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Custom Chatbots
        </Link>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/create-bot" className="hover:text-gray-300">
                Create Bot
              </Link>
              <Link href="/my-bots" className="hover:text-gray-300">
                My Bots
              </Link>
              <Link href="/subscribe" className="hover:text-gray-300">
                Browse
              </Link>
              <Link href="/profile" className="hover:text-gray-300">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/signup" className="hover:text-gray-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

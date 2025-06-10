"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              BrAInstormer
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Collaborative brainstorming platform where creativity meets structure. 
              Generate ideas, enhance them with AI, and get valuable feedback from peers.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors duration-200 block"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200 block"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">⏱</div>
              <h3 className="text-xl font-semibold mb-2">Timed Brainstorming</h3>
              <p className="text-gray-600">
                1-minute focused bursts to generate creative project ideas quickly
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
              <p className="text-gray-600">
                Enhance your raw ideas with AI to create polished project descriptions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Peer Review</h3>
              <p className="text-gray-600">
                Get valuable feedback and questions from other creative minds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

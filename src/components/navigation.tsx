"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Notifications {
  pendingAssignments: number;
  unansweredQuestions: number;
  newQuestions: number;
  totalNotifications: number;
}

export function Navigation() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notifications | null>(null);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              BrAInstormer
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Navigation Links with badges */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/review" 
                className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Review
                {notifications && notifications.pendingAssignments > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.pendingAssignments}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/questions" 
                className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Questions
                {notifications && notifications.unansweredQuestions > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.unansweredQuestions}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user.username}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
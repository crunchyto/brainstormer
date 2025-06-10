"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";

interface Assignment {
  id: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    originalText: string;
    enhancedText?: string;
    status: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export default function Review() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    fetchAssignments();
  }, [session, status, router]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/reviews/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (assignment: Assignment) => {
    router.push(`/review/${assignment.id}`);
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Assigned Projects
          </h1>
          <p className="text-gray-600">
            Review projects assigned to you and provide feedback to project owners
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Assigned</h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have any projects assigned for review yet.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Status badge */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Project info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {assignment.project.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    by {assignment.project.user.username}
                  </p>

                  {/* Project preview */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {assignment.project.originalText}
                    </p>
                  </div>

                  {/* Enhanced indicator */}
                  {assignment.project.enhancedText && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ✨ AI Enhanced
                      </span>
                    </div>
                  )}

                  {/* Action button */}
                  <button
                    onClick={() => handleStartReview(assignment)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    {assignment.status === 'PENDING' ? 'Start Review' : 
                     assignment.status === 'IN_PROGRESS' ? 'Continue Review' : 
                     'View Completed Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
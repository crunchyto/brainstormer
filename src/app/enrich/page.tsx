"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";

interface Project {
  id: string;
  title: string;
  originalText: string;
  enhancedText?: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

export default function Enrich() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    fetchProjects();
    fetchUsers();
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/projects/assign");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched users:", data.users); // Debug log
        setUsers(data.users);
      } else {
        console.error("Failed to fetch users:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleEnhance = async (projectId: string) => {
    setEnhancing(projectId);
    try {
      const response = await fetch("/api/projects/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the project in state
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, enhancedText: data.project.enhancedText, status: data.project.status }
            : p
        ));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to enhance project");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      alert("Failed to enhance project");
    } finally {
      setEnhancing(null);
    }
  };

  const handleAssign = async (projectId: string) => {
    const assigneeId = selectedAssignee[projectId];
    if (!assigneeId) {
      alert("Please select a user to assign the project to");
      return;
    }

    setAssigning(projectId);
    try {
      const response = await fetch("/api/projects/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, assigneeId }),
      });

      if (response.ok) {
        // Update project status
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: "ASSIGNED" } : p
        ));
        alert("Project assigned successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to assign project");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      alert("Failed to assign project");
    } finally {
      setAssigning(null);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  // Filter and deduplicate projects - only show projects with meaningful content
  const brainstormedProjects = projects.filter((p, index, arr) => {
    // Must have original text with meaningful content (more than just whitespace)
    if (!p.originalText || p.originalText.trim().length < 10) return false;
    
    // Remove duplicates based on original text content
    const firstIndex = arr.findIndex(proj => 
      proj.originalText?.trim() === p.originalText?.trim() && 
      proj.originalText?.trim().length > 0
    );
    return firstIndex === index;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enrich Your Projects
          </h1>
          <p className="text-gray-600">
            Enhance your brainstormed ideas with AI and assign them for peer review
          </p>
        </div>

        {brainstormedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Yet</h2>
            <p className="text-gray-600 mb-6">
              Start by brainstorming some project ideas first!
            </p>
            <button
              onClick={() => router.push("/brainstorm")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Start Brainstorming
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {brainstormedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'BRAINSTORMED' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'ENHANCED' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'ASSIGNED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Text */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Original Idea</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {project.originalText}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Text */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Enhanced Version</h4>
                      {!project.enhancedText && (
                        <button
                          onClick={() => handleEnhance(project.id)}
                          disabled={enhancing === project.id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          {enhancing === project.id ? "Enhancing..." : "Enhance with AI"}
                        </button>
                      )}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      {project.enhancedText ? (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {project.enhancedText}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Click &quot;Enhance with AI&quot; to improve this project idea
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment Section */}
                {project.enhancedText && project.status !== 'ASSIGNED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Assign for Review</h4>
                    {users.length === 0 ? (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-yellow-800">
                          <strong>No other users available for assignment.</strong><br />
                          Other users need to register on the platform before you can assign projects to them for review.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <select
                          value={selectedAssignee[project.id] || ""}
                          onChange={(e) => setSelectedAssignee(prev => ({
                            ...prev,
                            [project.id]: e.target.value
                          }))}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a user to review this project</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.username} ({user.email})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(project.id)}
                          disabled={assigning === project.id || !selectedAssignee[project.id]}
                          className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          {assigning === project.id ? "Assigning..." : "Assign"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {project.status === 'ASSIGNED' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✅ This project has been assigned for review
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
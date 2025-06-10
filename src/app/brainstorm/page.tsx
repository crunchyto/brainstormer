"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Navigation } from "@/components/navigation";

interface Project {
  id: number;
  title: string;
  content: string;
}

interface ProjectSize {
  label: string;
  value: string;
  duration: number; // in seconds
  budget: string;
}

const PROJECT_SIZES: ProjectSize[] = [
  { label: "Small Project (~$3,000)", value: "small", duration: 60, budget: "~$3,000" },
  { label: "Medium Project (~€50,000)", value: "medium", duration: 120, budget: "~€50,000" },
  { label: "Large Project (~€150,000)", value: "large", duration: 180, budget: "~€150,000" },
  { label: "Enterprise Project (€1,000,000+)", value: "enterprise", duration: 240, budget: "€1,000,000+" },
  { label: "Crazy Multi Billion Shit!", value: "crazy", duration: 300, budget: "Multi Billion" },
];

export default function Brainstorm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [currentProject, setCurrentProject] = useState(1);
  const [selectedProjectSize, setSelectedProjectSize] = useState<ProjectSize | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [showSizeSelection, setShowSizeSelection] = useState(true);
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: "Project Idea 1", content: "" },
    { id: 2, title: "Project Idea 2", content: "" },
    { id: 3, title: "Project Idea 3", content: "" },
  ]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    } else {
      // Generate a unique session ID when user first loads the page
      if (!sessionId) {
        setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      }
    }
  }, [session, status, router, sessionId]);

  // Set initial content when project changes
  useEffect(() => {
    const project = projects.find(p => p.id === currentProject);
    setCurrentContent(project?.content || "");
  }, [currentProject, projects]);

  // Timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0 && !isCompleted) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleNextProject();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft, isCompleted]);

  // Auto-save functionality
  useEffect(() => {
    if (currentContent.trim() && isActive) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      
      autoSaveRef.current = setTimeout(() => {
        saveProject(currentProject, currentContent);
      }, 5000);
    }
    
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [currentContent, currentProject, isActive]);

  const saveProject = async (projectId: number, content: string) => {
    try {
      const response = await fetch("/api/projects/brainstorm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          content,
          title: `Project Idea ${projectId} - ${selectedProjectSize?.budget || 'Unknown'}`,
          projectSize: selectedProjectSize?.value,
          budget: selectedProjectSize?.budget,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        // Update local state
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, content } : p
        ));
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const handleProjectSizeSelect = (size: ProjectSize) => {
    setSelectedProjectSize(size);
    setTimeLeft(size.duration);
    setShowSizeSelection(false);
  };

  const startTimer = () => {
    if (!selectedProjectSize) return;
    setIsActive(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleNextProject = () => {
    // Save current content immediately
    if (currentContent.trim()) {
      saveProject(currentProject, currentContent);
    }

    if (currentProject < 3) {
      setCurrentProject(currentProject + 1);
      setTimeLeft(selectedProjectSize?.duration || 60);
      setCurrentContent("");
      setShowSizeSelection(true);
      setIsActive(false);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(e.target.value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setCurrentProject(1);
    setSelectedProjectSize(null);
    setTimeLeft(60);
    setIsActive(false);
    setIsCompleted(false);
    setShowSizeSelection(true);
    setCurrentContent("");
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    setProjects([
      { id: 1, title: "Project Idea 1", content: "" },
      { id: 2, title: "Project Idea 2", content: "" },
      { id: 3, title: "Project Idea 3", content: "" },
    ]);
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Brainstorm Session Complete!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You&apos;ve successfully completed 3 project ideas. Great work!
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={resetSession}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Start New Session
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Countdown Brainstorm
          </h1>
          <p className="text-gray-600">
            Project {currentProject} of 3 • Focus and let your creativity flow!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{currentProject}/3 projects</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentProject / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Project Size Selection */}
        {showSizeSelection && !isActive && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Select Project Size for {projects.find(p => p.id === currentProject)?.title}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Choose the economic investment level to determine your brainstorming time
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleProjectSizeSelect(size)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                >
                  <div className="font-semibold text-gray-900 mb-1">{size.label}</div>
                  <div className="text-sm text-gray-600 mb-2">Budget: {size.budget}</div>
                  <div className="text-sm font-medium text-blue-600">
                    Timer: {Math.floor(size.duration / 60)}:{(size.duration % 60).toString().padStart(2, '0')} minutes
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Project Size Info */}
        {selectedProjectSize && !showSizeSelection && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-blue-900">
              {selectedProjectSize.label} - {selectedProjectSize.budget}
            </div>
            <div className="text-blue-700">
              Brainstorming time: {Math.floor(selectedProjectSize.duration / 60)} minutes
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-4 ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {formatTime(timeLeft)}
          </div>
          {!isActive && selectedProjectSize && !showSizeSelection && (
            <button
              onClick={startTimer}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Start Brainstorming ({Math.floor(selectedProjectSize.duration / 60)} min)
            </button>
          )}
        </div>

        {/* Text Area */}
        {selectedProjectSize && !showSizeSelection && (
          <div className="mb-6">
            <label htmlFor="brainstorm-text" className="block text-lg font-medium text-gray-900 mb-3">
              {projects.find(p => p.id === currentProject)?.title} - {selectedProjectSize.budget}
            </label>
            <textarea
              ref={textareaRef}
              id="brainstorm-text"
              value={currentContent}
              onChange={handleContentChange}
              placeholder="Start typing your project idea here... Be creative and don&apos;t worry about perfection!"
              className="w-full h-64 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-lg"
              disabled={!isActive}
            />
            <div className="text-sm text-gray-500 mt-2">
              Auto-saves every 5 seconds while typing
            </div>
          </div>
        )}

        {/* Next Project Button */}
        {isActive && (
          <div className="text-center">
            <button
              onClick={handleNextProject}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-orange-700 transition-colors duration-200"
            >
              Next Project Brainstorm →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
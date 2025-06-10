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

interface Review {
  id: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  answers: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }[];
}

export default function ReviewProject({ params }: { params: { assignmentId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [completingAssignment, setCompletingAssignment] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    fetchAssignment();
  }, [session, status, router, params.assignmentId]);

  const fetchAssignment = async () => {
    try {
      // Get all assignments and find the specific one
      const response = await fetch("/api/reviews/assignments");
      if (response.ok) {
        const data = await response.json();
        const foundAssignment = data.assignments.find((a: Assignment) => a.id === params.assignmentId);
        
        if (!foundAssignment) {
          router.push("/review");
          return;
        }
        
        setAssignment(foundAssignment);
        
        // Fetch existing review
        const reviewResponse = await fetch(`/api/reviews?projectId=${foundAssignment.project.id}`);
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          setReview(reviewData.review);
          setReviewNotes(reviewData.review?.notes || "");
        }

        // Fetch questions
        const questionsResponse = await fetch(`/api/questions?projectId=${foundAssignment.project.id}`);
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData.questions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!assignment || !reviewNotes.trim()) return;

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: assignment.project.id,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReview(data.review);
        alert("Review saved successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save review");
      }
    } catch (error) {
      console.error("Review save error:", error);
      alert("Failed to save review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!assignment || !questionContent.trim()) return;

    setSubmittingQuestion(true);
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: assignment.project.id,
          content: questionContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(prev => [data.question, ...prev]);
        setQuestionContent("");
        alert("Question submitted successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit question");
      }
    } catch (error) {
      console.error("Question submit error:", error);
      alert("Failed to submit question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleCompleteAssignment = async () => {
    if (!assignment) return;

    setCompletingAssignment(true);
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      if (response.ok) {
        alert("Review completed successfully!");
        router.push("/review");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to complete review");
      }
    } catch (error) {
      console.error("Complete assignment error:", error);
      alert("Failed to complete review");
    } finally {
      setCompletingAssignment(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || !assignment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/review")}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              ← Back to Reviews
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review: {assignment.project.title}
              </h1>
              <p className="text-gray-600">
                Project by {assignment.project.user.username} • 
                Assigned {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {assignment.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Project Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Idea</h3>
              <div className="bg-gray-50 p-6 rounded-lg h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {assignment.project.originalText}
                </p>
              </div>
            </div>

            {/* Enhanced Text */}
            {assignment.project.enhancedText && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Version</h3>
                <div className="bg-blue-50 p-6 rounded-lg h-64 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {assignment.project.enhancedText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Notes - Full Width */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Review Notes</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveReview}
                disabled={submittingReview || !reviewNotes.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {submittingReview ? "Saving..." : "Save Review"}
              </button>
              {assignment.status !== "COMPLETED" && (
                <button
                  onClick={handleCompleteAssignment}
                  disabled={completingAssignment || !reviewNotes.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {completingAssignment ? "Completing..." : "Mark as Complete"}
                </button>
              )}
            </div>
          </div>
          
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Write your comprehensive review here...

Consider addressing:
• Overall impression of the project idea
• Strengths and unique aspects
• Potential challenges or risks
• Market viability and target audience
• Suggestions for improvement
• Implementation recommendations
• Resource requirements
• Next steps or milestones"
            className="w-full h-96 p-6 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-lg leading-relaxed"
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {review ? `Last saved: ${new Date(review.updatedAt).toLocaleString()}` : "Not saved yet"}
            </div>
            <div className="text-sm text-gray-500">
              {reviewNotes.length} characters
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions & Discussion</h2>
          
          {/* Submit new question */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Ask a Question
            </label>
            <textarea
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Ask a specific question about this project that would help you provide a better review..."
              className="w-full h-24 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSubmitQuestion}
                disabled={submittingQuestion || !questionContent.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              >
                {submittingQuestion ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          </div>

          {/* Questions list */}
          {questions.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions ({questions.length})
              </h3>
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                    <div className="mb-4">
                      <p className="text-gray-700 mb-3 leading-relaxed font-medium">{question.content}</p>
                      <div className="text-sm text-gray-500">
                        Asked by {question.user.username} on {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Answers */}
                    {question.answers.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">
                          {question.answers.length > 1 ? 'Answers:' : 'Answer:'}
                        </h5>
                        <div className="space-y-3">
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="bg-white p-4 rounded-md border border-gray-200">
                              <p className="text-gray-700 mb-2 leading-relaxed">{answer.content}</p>
                              <div className="text-sm text-gray-500">
                                Answered by {answer.user.username} on {new Date(answer.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 italic">No questions asked yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
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
  answers: Answer[];
  project: {
    id: string;
    title: string;
    status: string;
  };
}

interface ProjectQuestions {
  project: {
    id: string;
    title: string;
    status: string;
  };
  questions: Question[];
}

export default function Questions() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [questionsByProject, setQuestionsByProject] = useState<ProjectQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState<{ [key: string]: string }>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    fetchQuestions();
  }, [session, status, router]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions/my-projects");
      if (response.ok) {
        const data = await response.json();
        setQuestionsByProject(data.questionsByProject);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const content = answerContent[questionId];
    if (!content?.trim()) return;

    setSubmittingAnswer(questionId);
    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the questions state to include the new answer
        setQuestionsByProject(prev => prev.map(projectQuestions => ({
          ...projectQuestions,
          questions: projectQuestions.questions.map(question => 
            question.id === questionId 
              ? { ...question, answers: [...question.answers, data.answer] }
              : question
          )
        })));
        
        // Clear the answer input
        setAnswerContent(prev => ({
          ...prev,
          [questionId]: ""
        }));
        
        alert("Answer submitted successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit answer");
      }
    } catch (error) {
      console.error("Answer submit error:", error);
      alert("Failed to submit answer");
    } finally {
      setSubmittingAnswer(null);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const totalQuestions = questionsByProject.reduce((total, project) => total + project.questions.length, 0);
  const unansweredQuestions = questionsByProject.reduce((total, project) => 
    total + project.questions.filter(q => q.answers.length === 0).length, 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Answer Project Questions
          </h1>
          <p className="text-gray-600">
            Respond to questions about your projects from reviewers
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unansweredQuestions}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalQuestions - unansweredQuestions}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
          </div>
        </div>

        {questionsByProject.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Yet</h2>
            <p className="text-gray-600 mb-6">
              Questions from reviewers will appear here when they review your projects.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {questionsByProject.map((projectQuestions) => (
              <div key={projectQuestions.project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Project header */}
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {projectQuestions.project.title}
                      </h2>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        projectQuestions.project.status === 'BRAINSTORMED' ? 'bg-yellow-100 text-yellow-800' :
                        projectQuestions.project.status === 'ENHANCED' ? 'bg-blue-100 text-blue-800' :
                        projectQuestions.project.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {projectQuestions.project.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {projectQuestions.questions.length} question{projectQuestions.questions.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {projectQuestions.questions.filter(q => q.answers.length === 0).length} unanswered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="p-6 space-y-6">
                  {projectQuestions.questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                      {/* Question */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Question:</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{question.content}</p>
                        <p className="text-sm text-gray-500">
                          Asked by {question.user.username}
                        </p>
                      </div>

                      {/* Existing answers */}
                      {question.answers.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            {question.answers.length > 1 ? 'Answers:' : 'Your Answer:'}
                          </h4>
                          <div className="space-y-3">
                            {question.answers.map((answer) => (
                              <div key={answer.id} className="bg-green-50 p-4 rounded-lg">
                                <p className="text-gray-700 mb-2">{answer.content}</p>
                                <p className="text-sm text-gray-500">
                                  Answered by {answer.user.username} on {new Date(answer.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer form */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          {question.answers.length > 0 ? 'Add another answer:' : 'Your answer:'}
                        </label>
                        <textarea
                          value={answerContent[question.id] || ""}
                          onChange={(e) => setAnswerContent(prev => ({
                            ...prev,
                            [question.id]: e.target.value
                          }))}
                          placeholder="Type your answer here..."
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => handleSubmitAnswer(question.id)}
                            disabled={submittingAnswer === question.id || !answerContent[question.id]?.trim()}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                          >
                            {submittingAnswer === question.id ? "Submitting..." : "Submit Answer"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
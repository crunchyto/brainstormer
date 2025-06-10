import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all questions for user's projects
    const questions = await prisma.question.findMany({
      where: {
        project: {
          userId: user.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group questions by project
    const questionsByProject = questions.reduce((acc, question) => {
      const projectId = question.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          project: question.project,
          questions: []
        };
      }
      acc[projectId].questions.push(question);
      return acc;
    }, {} as Record<string, { project: { id: string; title: string; originalText: string; status: string; createdAt: Date; userId: string }; questions: typeof questions }>);

    return NextResponse.json({ 
      questionsByProject: Object.values(questionsByProject),
      totalQuestions: questions.length 
    });

  } catch (error) {
    console.error("My questions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
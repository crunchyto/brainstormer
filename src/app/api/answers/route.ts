import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { questionId, content } = await request.json();

    if (!questionId || !content) {
      return NextResponse.json(
        { error: "Question ID and answer content are required" },
        { status: 400 }
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

    // Check if question exists and belongs to user's project
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        project: {
          select: {
            userId: true,
            title: true
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if user owns the project
    if (question.project.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only answer questions about your own projects" },
        { status: 403 }
      );
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        questionId,
        userId: user.id,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Answer submitted successfully",
      answer: {
        id: answer.id,
        content: answer.content,
        createdAt: answer.createdAt,
        user: answer.user
      }
    });

  } catch (error) {
    console.error("Answer submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
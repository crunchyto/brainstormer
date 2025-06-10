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

    const { projectId, content } = await request.json();

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Project ID and question content are required" },
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

    // Check if user has an assignment for this project
    const assignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Project not assigned to this user" },
        { status: 403 }
      );
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        projectId,
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
      message: "Question submitted successfully",
      question: {
        id: question.id,
        content: question.content,
        createdAt: question.createdAt,
        user: question.user
      }
    });

  } catch (error) {
    console.error("Question submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get questions for this project
    const questions = await prisma.question.findMany({
      where: { projectId },
      include: {
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

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
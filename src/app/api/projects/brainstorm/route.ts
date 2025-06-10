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

    const { content, title, sessionId } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Create a unique identifier for this specific project in this session
    const sessionIdentifier = sessionId || `session-${Date.now()}`;
    const uniqueTitle = `${title} - ${sessionIdentifier}`;

    // Check if project already exists for this specific project in this session
    const existingProject = await prisma.project.findFirst({
      where: {
        userId: user.id,
        title: uniqueTitle
      }
    });

    let project;
    if (existingProject) {
      // Update existing project
      project = await prisma.project.update({
        where: { id: existingProject.id },
        data: { originalText: content }
      });
    } else {
      // Create new project
      project = await prisma.project.create({
        data: {
          title: uniqueTitle,
          originalText: content,
          userId: user.id,
          status: "BRAINSTORMED"
        }
      });
    }

    return NextResponse.json({
      message: "Project saved successfully",
      project: {
        id: project.id,
        title: project.title,
        content: project.originalText
      }
    });

  } catch (error) {
    console.error("Brainstorm save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
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

    const { projectId, assigneeId } = await request.json();

    if (!projectId || !assigneeId) {
      return NextResponse.json(
        { error: "Project ID and assignee ID are required" },
        { status: 400 }
      );
    }

    // Find the user (project owner)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Check if assignee exists
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId }
    });

    if (!assignee) {
      return NextResponse.json(
        { error: "Assignee not found" },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assigneeId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Project already assigned to this user" },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId,
        userId: assigneeId,
        status: "PENDING"
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Update project status to ASSIGNED
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ASSIGNED" }
    });

    return NextResponse.json({
      message: "Project assigned successfully",
      assignment: {
        id: assignment.id,
        status: assignment.status,
        assignee: assignment.user,
        project: assignment.project,
        createdAt: assignment.createdAt
      }
    });

  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get all users except current user for assignment options
    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id }
      },
      select: {
        id: true,
        username: true,
        email: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
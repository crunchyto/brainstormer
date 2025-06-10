import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    const assignmentId = params.id;

    if (!status || !assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID and status are required" },
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

    // Check if assignment belongs to this user
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        id: assignmentId,
        userId: user.id
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Update assignment status
    const updatedAssignment = await prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: { status },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    // If marking as completed, also update project status
    if (status === "COMPLETED") {
      await prisma.project.update({
        where: { id: assignment.projectId },
        data: { status: "REVIEWED" }
      });
    }

    return NextResponse.json({
      message: "Assignment status updated successfully",
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error("Assignment update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
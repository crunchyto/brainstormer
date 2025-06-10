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

    const { projectId, notes } = await request.json();

    if (!projectId || !notes) {
      return NextResponse.json(
        { error: "Project ID and notes are required" },
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

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { notes }
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          projectId,
          userId: user.id,
          notes
        }
      });
      
      // Update assignment status to IN_PROGRESS
      await prisma.projectAssignment.update({
        where: { id: assignment.id },
        data: { status: "IN_PROGRESS" }
      });
    }

    return NextResponse.json({
      message: "Review saved successfully",
      review: {
        id: review.id,
        notes: review.notes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    });

  } catch (error) {
    console.error("Review save error:", error);
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

    // Get review for this project by this user
    const review = await prisma.review.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    return NextResponse.json({ review });

  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
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

    // Count pending assignments (projects assigned to me)
    const pendingAssignments = await prisma.projectAssignment.count({
      where: {
        userId: user.id,
        status: "PENDING"
      }
    });

    // Count unanswered questions on my projects
    const unansweredQuestions = await prisma.question.count({
      where: {
        project: {
          userId: user.id
        },
        answers: {
          none: {}
        }
      }
    });

    // Count new questions since last week (basic notification logic)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newQuestions = await prisma.question.count({
      where: {
        project: {
          userId: user.id
        },
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    return NextResponse.json({
      pendingAssignments,
      unansweredQuestions,
      newQuestions,
      totalNotifications: pendingAssignments + unansweredQuestions
    });

  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
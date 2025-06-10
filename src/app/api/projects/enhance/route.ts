import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await request.json();

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

    // Get the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.originalText || project.originalText.trim().length === 0) {
      return NextResponse.json(
        { error: "Project has no content to enhance" },
        { status: 400 }
      );
    }

    // Check if already enhanced
    if (project.enhancedText) {
      return NextResponse.json({
        message: "Project already enhanced",
        project: {
          id: project.id,
          originalText: project.originalText,
          enhancedText: project.enhancedText
        }
      });
    }

    // Enhance with OpenAI
    const prompt = `You are a professional business consultant helping to enhance and refine project ideas. 

Original project idea:
"${project.originalText}"

Please enhance this project idea by:
1. Making it more professional and well-structured
2. Adding clarity and detail where needed
3. Organizing the content with bullet points or sections if appropriate
4. Maintaining the original intent and creativity
5. Making it more compelling and actionable

Keep the enhanced version concise but comprehensive, and ensure it sounds professional while preserving the original creative spirit.

Enhanced project idea:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      return NextResponse.json(
        { error: "Failed to enhance project text" },
        { status: 500 }
      );
    }

    // Update project with enhanced text
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: { 
        enhancedText,
        status: "ENHANCED"
      }
    });

    return NextResponse.json({
      message: "Project enhanced successfully",
      project: {
        id: updatedProject.id,
        title: updatedProject.title,
        originalText: updatedProject.originalText,
        enhancedText: updatedProject.enhancedText,
        status: updatedProject.status
      }
    });

  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
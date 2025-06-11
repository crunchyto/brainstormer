import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Simple test first - just return success without any dependencies
    return NextResponse.json({
      message: "Signup endpoint is working",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Basic endpoint error" },
      { status: 500 }
    );
  }
}
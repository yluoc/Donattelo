import { NextResponse } from "next/server";
import { checkFlaskHealth } from "~~/lib/flask-api";

export async function GET() {
  try {
    // Check Flask backend health using the utility function
    const flaskHealth = await checkFlaskHealth();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      frontend: {
        status: "healthy",
        service: "Next.js frontend",
        version: "15.x",
      },
      backend: flaskHealth,
      message: "Both frontend and backend are connected and healthy",
      endpoints: {
        upload: "/api/upload-image",
        chat: "/api/chat",
        health: "/api/health",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        frontend: {
          status: "healthy",
          service: "Next.js frontend",
          version: "15.x",
        },
        backend: {
          status: "unreachable",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        message: "Frontend is healthy but Flask backend connection failed",
        troubleshooting: {
          check: "Ensure Flask backend is running on http://127.0.0.1:5000",
          start_command: "python app.py",
          requirements: "Flask server with /health, /analyze/image, and /chat endpoints",
        },
      },
      { status: 503 },
    );
  }
}

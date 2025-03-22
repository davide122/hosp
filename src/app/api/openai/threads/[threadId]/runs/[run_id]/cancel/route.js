// app/api/openai/cancel-run/route.js (Next.js 13+)
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { threadId, run_id } = params;
    
    if (!threadId || !run_id) {
      return NextResponse.json(
        { error: "Missing parameters: threadId and run_id are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // First, get the current run status
    const getRunUrl = `https://api.openai.com/v1/threads/${threadId}/runs/${run_id}`;
    const getRunResponse = await fetch(getRunUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });

    if (!getRunResponse.ok) {
      const errorData = await getRunResponse.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error?.message || "Failed to get run status" },
        { status: getRunResponse.status }
      );
    }

    const runData = await getRunResponse.json();
    if (runData.status === "completed" || runData.status === "failed" || runData.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot cancel run with status '${runData.status}'` },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.openai.com/v1/threads/${threadId}/runs/${run_id}/cancel`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error?.message || "Failed to cancel run" },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return NextResponse.json(
        { error: "Invalid response from OpenAI API" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

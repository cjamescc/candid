import { NextResponse } from "next/server";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// The client (app/page.jsx) builds the full Anthropic Messages API request body
// — model, max_tokens, messages, and optionally the web_search tool — and POSTs
// it here instead of calling api.anthropic.com directly. This route attaches the
// API key server-side and proxies the request, so the key is never shipped to
// the browser. The upstream JSON response is passed straight back, unchanged, so
// the client's existing parsing logic keeps working as-is.
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const anthropicResponse = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await anthropicResponse.json();
  return NextResponse.json(data, { status: anthropicResponse.status });
}

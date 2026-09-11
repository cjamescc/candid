import { NextResponse } from "next/server";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// The client (app/page.jsx) builds the Anthropic Messages API request body
// — model, messages, and optionally the web_search tool — and POSTs it here
// instead of calling api.anthropic.com directly. This route attaches the API
// key server-side and proxies the request, so the key is never shipped to the
// browser. The upstream JSON response is passed straight back, unchanged, so
// the client's existing parsing logic keeps working as-is.
const MAX_TOKENS = 8000;

// The audit can take longer than the default serverless function timeout while
// waiting on the Anthropic API. Extend it so the response isn't cut off.
export const maxDuration = 300;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let requestBody: Record<string, unknown>;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Set the token ceiling for the Anthropic call here, overriding whatever the
  // client sent.
  requestBody.max_tokens = MAX_TOKENS;

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

  // The client (app/page.jsx) does its own extraction + JSON.parse of the
  // audit result and that's what the user actually sees. This is a parallel
  // attempt at the same parse, purely so a failure shows up here in the
  // server logs — the browser console isn't something we can check from the
  // deploy environment.
  let raw = "";
  try {
    const textBlocks = (data.content || [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text);
    raw = textBlocks.join("\n").trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    JSON.parse(clean);
  } catch (parseErr) {
    console.error("Candid audit JSON parse failed:", {
      stop_reason: data.stop_reason,
      length: raw.length,
      tail: raw.slice(-500),
    });
  }

  return NextResponse.json(data, { status: anthropicResponse.status });
}

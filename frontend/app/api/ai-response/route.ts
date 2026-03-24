import { NextResponse } from "next/server";

const DEFAULT_BASE_URL = "https://spam-mail-api-l6cq.onrender.com";

async function proxyPost(path: string, payload: unknown) {
  const baseUrl = (process.env.SPAM_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await resp.text();
    const data = text ? JSON.parse(text) : null;

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Upstream error (${resp.status})`, details: data ?? text },
        { status: resp.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const message = isAbort ? "Request timed out" : String(err);
    return NextResponse.json({ error: "Request failed", details: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text = String(body?.text ?? body?.message ?? "").trim();

  if (!text) {
    return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
  }

  return proxyPost("/ai-response", { text, message: text });
}

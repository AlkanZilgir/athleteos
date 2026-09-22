// AthleteOS Command Engine — Gemini proxy.
//
// The engine key never reaches the browser. The client sends the assembled
// system prompt and the conversation; this function attaches the key and
// forwards to the Gemini API. Callers must present a valid Supabase JWT,
// so an anonymous visitor cannot spend quota.
//
// Secret required: GEMINI_API_KEY (free tier, no card — aistudio.google.com).
// Deploy with verify_jwt on (matching create-checkout-session / send-push).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Tunable without a code change if the latency or the quota needs moving.
// Flash is the free tier's workhorse: fast, and generous on requests per day.
const MODEL = Deno.env.get('COACH_MODEL') || 'gemini-2.0-flash';

// The engine answers in three short paragraphs; a seven-day plan payload is
// the long case. The cap is headroom, not a target.
const MAX_TOKENS = 8192;

// Guard rails on what a single caller may push through in one request. The
// client also caps history at 12 turns; this is the server-side backstop.
const MAX_TURNS = 24;
const MAX_CHARS = 60000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

type Turn = { role: 'user' | 'assistant'; content: string };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) return json({ error: 'engine_not_configured' }, 503);

    // ── Caller must be a signed-in AthleteOS user ────────────────────────
    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: 'unauthorized' }, 401);

    // ── Payload ──────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const system = typeof body.system === 'string' ? body.system : '';
    const raw = Array.isArray(body.messages) ? body.messages : [];
    if (!system || raw.length === 0) return json({ error: 'bad_request' }, 400);

    const turns: Turn[] = raw
      .filter((m: { role?: string; content?: unknown }) =>
        (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .slice(-MAX_TURNS);

    // Gemini requires the first turn to be from the user.
    while (turns.length && turns[0].role !== 'user') turns.shift();
    if (turns.length === 0) return json({ error: 'bad_request' }, 400);

    const size = system.length + turns.reduce((n, m) => n + m.content.length, 0);
    if (size > MAX_CHARS) return json({ error: 'payload_too_large' }, 413);

    // Gemini names the assistant role 'model'; everything else is 'user'.
    const contents = turns.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // ── Engine call ──────────────────────────────────────────────────────
    // The key travels as a header, not in the query string, so it cannot leak
    // into an access log or a redirect along the way.
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.7 },
        }),
      },
    );

    if (!res.ok) {
      // Typed by status, so a rate limit and a bad key do not read the same.
      const detail = await res.text().catch(() => '');
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        console.error('coach: key rejected', res.status, detail.slice(0, 300));
        return json({ error: 'engine_key_rejected' }, 502);
      }
      if (res.status === 429) return json({ error: 'rate_limited' }, 429);
      console.error('coach: upstream', res.status, detail.slice(0, 300));
      return json({ error: 'engine_error', status: res.status }, 502);
    }

    const data = await res.json();

    // A safety block arrives as a finishReason, not an HTTP error.
    const cand = data?.candidates?.[0];
    const blocked = data?.promptFeedback?.blockReason ||
      (cand?.finishReason && cand.finishReason !== 'STOP' && cand.finishReason !== 'MAX_TOKENS'
        ? cand.finishReason
        : null);
    if (blocked && !cand?.content) {
      return json({ error: 'refused', category: String(blocked) }, 200);
    }

    const text = (cand?.content?.parts ?? [])
      .map((p: { text?: string }) => p?.text ?? '')
      .join('')
      .trim();

    if (!text) return json({ error: 'empty' }, 502);

    return json({
      text,
      model: data?.modelVersion ?? MODEL,
      usage: {
        input: data?.usageMetadata?.promptTokenCount ?? 0,
        output: data?.usageMetadata?.candidatesTokenCount ?? 0,
        cache_read: data?.usageMetadata?.cachedContentTokenCount ?? 0,
      },
    });
  } catch (err) {
    console.error('coach:', err);
    return json({ error: 'internal' }, 500);
  }
});

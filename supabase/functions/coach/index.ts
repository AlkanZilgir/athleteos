// AthleteOS Command Engine — Anthropic proxy.
//
// The engine key never reaches the browser. The client sends the assembled
// system prompt and the conversation; this function attaches the key and
// forwards to the Messages API. Callers must present a valid Supabase JWT,
// so an anonymous visitor cannot spend tokens.
//
// Secret required: ANTHROPIC_API_KEY.
// Deploy with verify_jwt on (matching create-checkout-session / send-push).

import Anthropic from 'npm:@anthropic-ai/sdk@0.124.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Tunable without a code change if the bill or the latency needs moving.
const MODEL = Deno.env.get('COACH_MODEL') || 'claude-opus-5';
const EFFORT = Deno.env.get('COACH_EFFORT') || 'medium';

// The engine answers in three short paragraphs; a seven-day plan payload is
// the long case. The cap is headroom, not a target — you are billed on tokens
// generated, so a generous ceiling costs nothing and avoids truncation.
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
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

    // Keep only the roles the Messages API accepts, and only the tail.
    const messages: Anthropic.Beta.BetaMessageParam[] = raw
      .filter((m: { role?: string; content?: unknown }) =>
        (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .slice(-MAX_TURNS)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content }));

    // The API requires the first message to be from the user.
    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (messages.length === 0) return json({ error: 'bad_request' }, 400);

    const size = system.length + messages.reduce((n, m) => n + m.content.length, 0);
    if (size > MAX_CHARS) return json({ error: 'payload_too_large' }, 413);

    // ── Engine call ──────────────────────────────────────────────────────
    const client = new Anthropic({ apiKey });
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Programming and volume analysis are the reason this exists; adaptive
      // thinking earns its keep. Effort sits at medium because the engine is
      // instructed to be brief and this is a per-message consumer cost.
      thinking: { type: 'adaptive' },
      output_config: { effort: EFFORT },
      // A safety decline should hand back a usable answer rather than a wall.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // The system prompt is stable across a conversation; the messages are
      // not. Caching the prefix is most of the input cost on turn two onward.
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    if (response.stop_reason === 'refusal') {
      return json({
        error: 'refused',
        category: response.stop_details?.category ?? null,
      }, 200);
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    if (!text) return json({ error: 'empty' }, 502);

    return json({
      text,
      model: response.model,
      usage: {
        input: response.usage?.input_tokens ?? 0,
        output: response.usage?.output_tokens ?? 0,
        cache_read: response.usage?.cache_read_input_tokens ?? 0,
      },
    });
  } catch (err) {
    // Typed first, so a rate limit and a bad key do not read the same.
    if (err instanceof Anthropic.AuthenticationError) return json({ error: 'engine_key_rejected' }, 502);
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'rate_limited' }, 429);
    if (err instanceof Anthropic.BadRequestError) return json({ error: 'bad_request', detail: err.message }, 400);
    if (err instanceof Anthropic.APIError) return json({ error: 'engine_error', status: err.status }, 502);
    console.error('coach:', err);
    return json({ error: 'internal' }, 500);
  }
});

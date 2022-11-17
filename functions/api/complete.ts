import { Ratelimit } from '@upstash/ratelimit'; // for deno: see above
import { Redis } from '@upstash/redis/cloudflare';

const cache = new Map();

export async function onRequestPost({ request, env }) {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(env),
    limiter: Ratelimit.slidingWindow(1, '10 s'),
    ephemeralCache: cache,
  });

  const ip = request.headers.get('cf-connecting-ip');
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  if (!success) {
    return new Response(
      JSON.stringify({
        error: `You have exceeded the rate limit of ${limit} requests per 10 seconds`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      },
    );
  }

  const json = await request.json();
  // TODO: Validate the request body

  const { OPENAI_API_KEY } = env;

  const resp = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      ...json,
      model: 'text-davinci-002',
    }),
  });
  const data = await resp.json();

  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}

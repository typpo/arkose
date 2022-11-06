export async function onRequestPost({ request, env }) {
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

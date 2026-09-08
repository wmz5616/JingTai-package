// Cloudflare Pages Function: /api/geo
// Uses native Cloudflare edge cf.country object to return client's 2-letter ISO country code

export const onRequestGet = async (context: any): Promise<Response> => {
  try {
    const country = context.request?.cf?.country || 'US';
    return new Response(JSON.stringify({ country, ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ country: 'US', ok: false }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

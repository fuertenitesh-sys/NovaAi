export async function onRequestGet() {
  return new Response(JSON.stringify({ market: 'in' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

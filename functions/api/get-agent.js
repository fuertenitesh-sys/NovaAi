export async function onRequestGet() {
  return new Response(JSON.stringify({
    success: true,
    name: "Riya Voice Intelligence",
    brand: "Nova.ai"
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestGet() {
  const settings = {
    success: true,
    response: {
      bot_name: "Riya",
      bot_tagline: "Riya",
      bot_logo: "/assets/nova-avatar.jpg",
      bot_button_color: "#2563eb",
      bot_button_hover_color: "#1d4ed8",
      bot_border_color: "#2563eb",
      bot_text_color: "#20221f",
      bot_status_bar_color: "#2563eb",
      bot_background_color: "#faf9f6",
      show_is_power_by: false,
      svg_logo: null,
      voice_animation_color: "#2563eb"
    }
  };

  return new Response(JSON.stringify(settings), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

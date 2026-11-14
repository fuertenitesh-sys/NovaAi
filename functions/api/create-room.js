export async function onRequestPost() {
  const cleanAgentId = '01a1d8a0-eb07-7a44-9066-fb2420c08c97';
  const apiKey = 'ak_a579c7540418ffa23147b97a01d984d21a023319cf51aad5c0950da3f26cb965';

  const payload = {
    agent_id: cleanAgentId,
    type: 'web_call',
    prompt_dynamic_variables: {
      agent_name: 'Riya',
      company_name: 'Nova.ai',
      assistant_name: 'Riya',
      company: 'Nova',
      brand: 'Nova.ai'
    }
  };

  try {
    const res = await fetch('https://api.ravan.ai/api/v1/calling/create-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Origin': 'https://www.ravan.ai',
        'Referer': 'https://www.ravan.ai/'
      },
      body: JSON.stringify(payload)
    });

    const parsed = await res.json();
    if (parsed && parsed.data && parsed.data.access_token) {
      const formatted = {
        success: true,
        response: {
          success: true,
          token: parsed.data.access_token,
          url: parsed.data.url,
          call_id: parsed.data.room_id,
          room_id: parsed.data.room_id,
          session_id: parsed.data.session_id
        }
      };
      return new Response(JSON.stringify(formatted), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key'
    }
  });
}

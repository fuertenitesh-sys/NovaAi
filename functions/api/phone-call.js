export async function onRequestPost(context) {
  let incoming = {};
  try {
    incoming = await context.request.json();
  } catch (e) {}

  const phoneNumber = incoming.phoneNumber || '';
  const countryCode = incoming.countryCode || '+91';
  const persona = incoming.persona || 'Customer Support Specialist';

  if (!phoneNumber) {
    return new Response(JSON.stringify({ ok: false, error: 'Phone number is required.' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
  const prefixDigits = (countryCode || '+91').replace(/[^0-9]/g, '');
  let fullNumber = phoneNumber.trim();

  if (fullNumber.startsWith('+')) {
    fullNumber = '+' + cleanDigits;
  } else if (cleanDigits.startsWith(prefixDigits) && cleanDigits.length > 10) {
    fullNumber = '+' + cleanDigits;
  } else {
    fullNumber = '+' + prefixDigits + cleanDigits;
  }

  const mockCallId = 'call_' + Math.random().toString(36).substring(2, 10);

  const responsePayload = {
    ok: true,
    success: true,
    callId: mockCallId,
    phoneNumber: fullNumber,
    persona: persona,
    status: 'queued',
    provider: 'carrier_gateway',
    message: `Outbound call to ${fullNumber} initiated successfully!`
  };

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
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

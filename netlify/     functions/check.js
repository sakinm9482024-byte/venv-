exports.handler = async function (event) {
  // CORS headers (dorkar hole nijer domain diye restrict koro)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const uid = event.queryStringParameters.uid;
  const client = event.queryStringParameters.client;

  if (!uid || uid.trim().length < 3) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid UID" }),
    };
  }

  // Client -> API key mapping (Netlify env vars theke asbe)
  const keys = {
    client1: process.env.API_KEY_CLIENT1,
    client2: process.env.API_KEY_CLIENT2,
    client3: process.env.API_KEY_CLIENT3,
  };

  const apiKey = keys[client];

  if (!client || !apiKey) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Invalid client" }),
    };
  }

  try {
    const apiUrl = `https://api.f9bazar.com/check.php?uid=${encodeURIComponent(
      uid
    )}&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API Error" }),
    };
  }
};
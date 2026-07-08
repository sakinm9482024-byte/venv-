export default async (req, context) => {
  const url = new URL(req.url);
  const uid = (url.searchParams.get("uid") || "").trim();
  const apiKey = req.headers.get("x-api-key");

  // আপনার 3টা API key (client দের এখান থেকে একটা করে দিবেন)
  const VALID_KEYS = {
    "key_client1_9x7a2b": "client_1",
    "key_client2_4m8k1p": "client_2",
    "key_client3_7z2q9w": "client_3",
  };

  const jsonResponse = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  // 1. API key check
  if (!apiKey || !VALID_KEYS[apiKey]) {
    return jsonResponse({ error: "Invalid API key" }, 403);
  }

  // 2. UID validation
  if (!uid || uid.length < 3) {
    return jsonResponse({ error: "Enter a valid UID" }, 400);
  }

  // 3. External API call
  try {
    const externalRes = await fetch(
      `https://api.f9bazar.com/check.php?uid=${encodeURIComponent(uid)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!externalRes.ok) {
      let errData = null;
      try {
        errData = await externalRes.json();
      } catch (_) {}

      if (errData?.error === "ID NOT FOUND") {
        return jsonResponse({ error: "UID সঠিক নয়" }, 404);
      }
      return jsonResponse({ error: "API Error" }, 502);
    }

    const data = await externalRes.json();

    if (data && data.nickname) {
      return jsonResponse({
        uid,
        nickname: data.nickname,
        region: data.region || null,
        client: VALID_KEYS[apiKey],
      });
    } else {
      return jsonResponse({ error: "No Profile Found" }, 404);
    }
  } catch (err) {
    return jsonResponse({ error: "API Error" }, 502);
  }
};

export const config = {
  path: "/api/check",
};

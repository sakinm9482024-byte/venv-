const API_URL = "https://apis.fftopbd.com/api/game-id-checker";

const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Origin": "https://fftopbd.com",
  "Referer": "https://fftopbd.com/",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const uid = url.searchParams.get("uid");

    if (!uid) {
      return new Response(
        JSON.stringify({ error: "uid query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ playerid: uid }),
      });

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Upstream request failed" }),
          { status: res.status, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await res.json();
      const nickname = data && data.data && data.data.username;

      if (!nickname) {
        return new Response(
          JSON.stringify({ error: "Username not found", raw: data }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ uid, nickname }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
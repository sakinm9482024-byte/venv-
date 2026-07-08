const { uid: getUidData } = require('free-fire-apis');

const VALID_KEYS = {
  "ffk_7hT9mQx2LpR4vK1nZ8s": "client_1",
  "ffk_3wD6yB9jF2gN5cX0rM7": "client_2",
  "ffk_9qA1sE4tH7uJ3kL6oP2": "client_3",
};

exports.handler = async (event) => {
  const uid = (event.queryStringParameters?.uid || "").trim();
  const apiKey = event.headers["x-api-key"];

  const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!apiKey || !VALID_KEYS[apiKey]) {
    return jsonResponse(403, { error: "Invalid API key" });
  }

  if (!uid || uid.length < 3) {
    return jsonResponse(400, { error: "Enter a valid UID" });
  }

  try {
    const data = await getUidData(uid);

    if (data && data.Nickname) {
      return jsonResponse(200, {
        uid: data.Uid || uid,
        nickname: data.Nickname,
        region: data.Region || null,
        client: VALID_KEYS[apiKey],
      });
    } else {
      return jsonResponse(404, { error: "No Profile Found" });
    }
  } catch (err) {
    return jsonResponse(502, { error: "API Error", details: err.message });
  }
};
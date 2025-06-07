const fetch = require("node-fetch");

exports.handler = async function (event) {
  const allowedOrigin = "https://demo-deteasy.squarespace.com";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = (body.message || "").trim();

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "Beskeden må ikke være tom." }),
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-chat", // ✅ this works
        messages: [
          {
            role: "system",
            content: "Du er en venlig dansk chatbot, der forklarer ting på en enkel og hjælpsom måde.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ OpenRouter Error:", data.error);
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter." }),
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Intet svar modtaget.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("💥 Funktion Fejl:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Intern serverfejl: " + err.message }),
    };
  }
};

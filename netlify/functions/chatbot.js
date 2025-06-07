const fetch = require("node-fetch");

exports.handler = async function (event) {
  const allowedOrigin = "https://demo-deteasy.squarespace.com";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: "OK"
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = typeof body.message === "string" ? body.message.trim() : "";

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "Beskeden må ikke være tom." })
      };
    }

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: "Du er en venlig dansk chatbot der forklarer ting på en enkel og hjælpsom måde."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error("❌ OpenRouter API Error:", data.error);
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter API." })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Intet svar modtaget.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin
      },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("💥 Server error:", err.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Intern serverfejl: " + err.message })
    };
  }
};

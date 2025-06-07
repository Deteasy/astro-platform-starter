// ✅ chatbot.js (med forbedret prompt + option til websearch)
const fetch = require("node-fetch");

exports.handler = async function (event) {
  const allowedOrigin = "https://demo-deteasy.squarespace.com";

  // Handle CORS preflight
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
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Du er en dansk chatbot ved navn Daniel, som giver korte, faktabaserede og letforståelige svar. Svar på spørgsmål klart og tydeligt. Sig til hvis du ikke har adgang til ny information."
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
      console.error("OpenRouter API Error:", data.error);
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter API." })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Daniel har ikke noget svar på det.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin
      },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Serverfejl:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Serverfejl: " + err.message })
    };
  }
};

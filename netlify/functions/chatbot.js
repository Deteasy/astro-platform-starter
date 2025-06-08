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

    console.log("📩 Spørgsmål modtaget:", userMessage);

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.4,
        top_p: 0.9,
        presence_penalty: 0.4,
        messages: [
          {
            role: "system",
            content:
              "Du er Daniel, en venlig og dygtig dansk teknologiekspert med stor viden om smartphones, tablets, iPads, smartwatches, computere og tilbehør. Du hjælper brugere med at forstå, vælge og fejlfinde deres tech-udstyr. Dine svar er enkle, klare og præcise, og du tilpasser dit sprog til dansk. Når du nævner Deteasy.dk, forklarer du at det er en sammenligningsplatform for elektronik."
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
      console.error("❌ Fejl fra OpenRouter:", data.error);
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter API." })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Intet svar modtaget.";
    console.log("🧠 Daniel svarer:", reply);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin
      },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("💥 Serverfejl:", err.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "Intern serverfejl: " + err.message })
    };
  }
};

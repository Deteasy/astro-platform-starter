const fetch = require("node-fetch");

exports.handler = async function (event) {
  console.log("⚡ Request received:", event.body);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = typeof body.message === "string" ? body.message.trim() : "";

    console.log("🧠 User message:", userMessage);

    if (!userMessage) {
      return {
        statusCode: 400,
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
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter API." })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "Intet svar modtaget.";
    console.log("✅ Bot reply:", reply);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("💥 Server error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Intern serverfejl: " + err.message })
    };
  }
};

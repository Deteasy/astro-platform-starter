const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const body = JSON.parse(event.body);
    const userMessage = body.message;

    // Make sure message is not empty
    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Beskeden må ikke være tom." })
      };
    }

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter API Error:", data.error);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: data.error.message || "Fejl fra OpenRouter API." })
      };
    }

    const reply = data.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("Server Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Intern serverfejl: " + err.message })
    };
  }
};

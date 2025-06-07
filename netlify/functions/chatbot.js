<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deteasy Chatbot</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', sans-serif;
      background-color: #f7f7f8;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .chat-container {
      width: 100%;
      max-width: 700px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      height: 90vh;
      overflow: hidden;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chat-messages p {
      margin: 0;
      line-height: 1.6;
    }

    .chat-messages strong {
      display: block;
      margin-bottom: 6px;
    }

    .chat-form {
      display: flex;
      padding: 16px;
      background-color: #fafafa;
      border-top: 1px solid #eee;
    }

    .chat-form input {
      flex: 1;
      padding: 14px 18px;
      border: 1px solid #ddd;
      border-radius: 12px;
      font-size: 16px;
      outline: none;
    }

    .chat-form button {
      background-color: #005eff;
      color: white;
      border: none;
      padding: 0 24px;
      margin-left: 12px;
      font-size: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .chat-form button:hover {
      background-color: #0049c7;
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div id="chat-messages" class="chat-messages"></div>

    <form id="chat-form" class="chat-form">
      <input
        type="text"
        id="user-input"
        placeholder="Hvad kan jeg hjælpe med?"
        autocomplete="off"
        required
      />
      <button type="submit">Send</button>
    </form>
  </div>

  <script>
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const chat = document.getElementById("chat-messages");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;

      chat.innerHTML += `<p><strong>Du:</strong> ${question}</p>`;
      input.value = "";

      // Vis "Daniel skriver..." straks for hurtig visuel feedback
      const typingIndicator = document.createElement("p");
      typingIndicator.id = "typing-indicator";
      typingIndicator.innerHTML = `<strong>Daniel:</strong> <em>skriver...</em>`;
      chat.appendChild(typingIndicator);
      chat.scrollTop = chat.scrollHeight;

      try {
        const res = await fetch("/.netlify/functions/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question })
        });

        const data = await res.json();
        typingIndicator.remove();
        chat.innerHTML += `<p><strong>Daniel:</strong> ${data.reply || "Beklager, jeg kan ikke svare på det lige nu."}</p>`;
        chat.scrollTop = chat.scrollHeight;
      } catch (error) {
        typingIndicator.remove();
        chat.innerHTML += `<p style="color:red"><strong>Daniel:</strong> Der opstod en fejl. Prøv igen senere.</p>`;
      }
    });
  </script>
</body>
</html>

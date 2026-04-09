(function () {
  // 🔴 Create container
  const container = document.createElement("div");
  container.id = "ai-widget-container";

  container.innerHTML = `
    <div id="ai-widget-button">Chat</div>

    <div id="ai-widget-box">
      <div id="ai-chat"></div>

      <div id="ai-input-area">
        <input id="ai-input" placeholder="Type a message..." />
        <button id="ai-send">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // 🔴 Styles
  const style = document.createElement("style");
  style.innerHTML = `
    #ai-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: black;
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      cursor: pointer;
      z-index: 9999;
    }

    #ai-widget-box {
      position: fixed;
      bottom: 70px;
      right: 20px;
      width: 300px;
      height: 400px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 10px;
      display: none;
      flex-direction: column;
      z-index: 9999;
    }

    #ai-chat {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      font-family: Arial;
      display: flex;
      flex-direction: column;
    }

    .ai-msg {
      margin: 6px 0;
      padding: 8px;
      border-radius: 8px;
      max-width: 70%;
      font-size: 14px;
    }

    .user {
      background: black;
      color: white;
      align-self: flex-end;
    }

    .bot {
      background: #eee;
      align-self: flex-start;
    }

    #ai-input-area {
      display: flex;
      width: 100%;
      border-top: 1px solid #ccc;
    }

    #ai-input {
      flex: 1;
      min-width: 0;
      border: none;
      padding: 10px;
      outline: none;
    }

    #ai-send {
      width: 70px;
      background: black;
      color: white;
      border: none;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // 🔴 Elements
  const button = document.getElementById("ai-widget-button");
  const box = document.getElementById("ai-widget-box");
  const chat = document.getElementById("ai-chat");
  const input = document.getElementById("ai-input");
  const send = document.getElementById("ai-send");

  const email = "guest@site.com";

  // 🔴 Toggle logic (clean)
  let isOpen = false;

  button.onclick = () => {
    isOpen = !isOpen;
    box.style.display = isOpen ? "flex" : "none";
  };

  // 🔴 Add message
  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `ai-msg ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  // 🔴 Initial bot greeting
  addMessage("Hi — how can I help you today?", "bot");

  // 🔴 Send message
  async function sendMessage() {
    const message = input.value;
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          email
        })
      });

      const data = await res.json();

      addMessage(data.data.response, "bot");

    } catch (err) {
      addMessage("Error connecting to support.", "bot");
      console.error(err);
    }
  }

  // 🔴 Click send
  send.onclick = sendMessage;

  // 🔴 Press Enter to send
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

})();
document.addEventListener("DOMContentLoaded", function () {

  // Create toggle button
  const button = document.createElement("div");
  button.innerText = "Chat";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.background = "#22c55e";
  button.style.color = "white";
  button.style.padding = "12px 16px";
  button.style.borderRadius = "999px";
  button.style.cursor = "pointer";
  button.style.fontWeight = "600";
  button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  button.style.zIndex = "9999";

  document.body.appendChild(button);

  // Create chat container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "70px";
  container.style.right = "20px";
  container.style.width = "360px";
  container.style.height = "520px";
  container.style.background = "#1e293b";
  container.style.borderRadius = "16px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.overflow = "hidden";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.color = "white";
  container.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
  container.style.zIndex = "9999";

  // Animation initial state
  container.style.opacity = "0";
  container.style.transform = "translateY(20px)";
  container.style.pointerEvents = "none";
  container.style.transition = "all 0.3s ease";

  container.innerHTML = `
    <div style="
      padding: 14px 16px;
      background: #0f172a;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 1px solid #334155;
    ">
      Support
    </div>

    <div id="messages" style="
      flex:1;
      padding:16px;
      overflow:auto;
      display:flex;
      flex-direction:column;
    "></div>

    <div style="
      display:flex;
      padding:10px;
      border-top:1px solid #334155;
      gap:8px;
    ">
      <input id="input" placeholder="Type your message..." style="
        flex:1;
        padding:10px 12px;
        background:#0f172a;
        color:white;
        border:none;
        border-radius:8px;
        outline:none;
        font-size:14px;
      " />
      <button id="send" style="
        padding:10px 14px;
        background:#22c55e;
        border:none;
        border-radius:8px;
        font-weight:600;
        cursor:pointer;
      ">
        Send
      </button>
    </div>
  `;

  document.body.appendChild(container);

  // Toggle logic with animation
  let isOpen = false;

  button.onclick = () => {
    isOpen = !isOpen;

    if (isOpen) {
      container.style.opacity = "1";
      container.style.transform = "translateY(0)";
      container.style.pointerEvents = "auto";
    } else {
      container.style.opacity = "0";
      container.style.transform = "translateY(20px)";
      container.style.pointerEvents = "none";
    }
  };

  const messagesDiv = container.querySelector("#messages");
  const input = container.querySelector("#input");
  const sendBtn = container.querySelector("#send");

  function addMessage(text, sender) {
    const div = document.createElement("div");

    div.style.marginBottom = "12px";
    div.style.padding = "10px 12px";
    div.style.borderRadius = "12px";
    div.style.maxWidth = "75%";
    div.style.fontSize = "14px";
    div.style.lineHeight = "1.4";

    if (sender === "user") {
      div.style.background = "#3b82f6";
      div.style.alignSelf = "flex-end";
    } else {
      div.style.background = "#334155";
      div.style.alignSelf = "flex-start";
    }

    div.innerText = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return div;
  }

  async function sendMessage() {
    const message = input.value;
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    sendBtn.disabled = true;

    const loading = addMessage("Typing...", "bot");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          email: "test@example.com"
        })
      });

      const data = await res.json();
      loading.innerText = data.data.response;

    } catch (err) {
      loading.innerText = "Connection failed. Try again.";
      console.error(err);
    }

    sendBtn.disabled = false;
  }

  sendBtn.onclick = sendMessage;

});
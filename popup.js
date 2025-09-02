document.addEventListener("DOMContentLoaded", () => {
  const botTokenInput = document.getElementById("botToken");
  const chatIdInput = document.getElementById("chatId");

  // Load config
  chrome.storage.local.get(["botToken", "chatId"], data => {
    if (data.botToken) botTokenInput.value = data.botToken;
    if (data.chatId) chatIdInput.value = data.chatId;
  });

  // Save
  document.getElementById("saveBtn").onclick = () => {
    chrome.storage.local.set({
      botToken: botTokenInput.value.trim(),
      chatId: chatIdInput.value.trim()
    }, () => alert("Saved!"));
  };

  // Test connection
  document.getElementById("testBtn").onclick = () => {
    chrome.runtime.sendMessage({ action: "testConnection" });
  };
});
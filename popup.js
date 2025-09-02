document.addEventListener("DOMContentLoaded", async () => {
  const botTokenInput = document.getElementById("botToken");
  const chatIdInput = document.getElementById("chatId");
  const saveBtn = document.getElementById("saveBtn");
  const testBtn = document.getElementById("testBtn");
  const toggleScrapeBtn = document.getElementById("toggleScrapeBtn");

  // Load saved settings
  chrome.storage.local.get(["botToken", "chatId", "scrapingActive"], data => {
    if (data.botToken) botTokenInput.value = data.botToken;
    if (data.chatId) chatIdInput.value = data.chatId;
    toggleScrapeBtn.textContent = data.scrapingActive ? "Stop Scraping" : "Start Scraping";
  });

  // Save config
  saveBtn.addEventListener("click", () => {
    chrome.storage.local.set({
      botToken: botTokenInput.value.trim(),
      chatId: chatIdInput.value.trim()
    }, () => alert("Saved!"));
  });

  // Test connection (send hello to Telegram)
  testBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "testConnection"
    });
  });

  // Toggle scraping
  toggleScrapeBtn.addEventListener("click", () => {
    chrome.storage.local.get("scrapingActive", data => {
      let newStatus = !data.scrapingActive;
      chrome.storage.local.set({ scrapingActive: newStatus });
      toggleScrapeBtn.textContent = newStatus ? "Stop Scraping" : "Start Scraping";
      chrome.runtime.sendMessage({ action: "toggleScraping", active: newStatus });
    });
  });
});
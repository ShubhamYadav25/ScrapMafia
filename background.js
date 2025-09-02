let sentJobs = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "jobsFound") {
    chrome.storage.local.get(["botToken", "chatId", "scrapingActive"], cfg => {
      if (!cfg.scrapingActive) return;
      message.data.forEach(job => {
        let key = (job.email || "") + "|" + (job.jobLink || "");
        if (!sentJobs[key]) {
          sentJobs[key] = true;
          sendToTelegram(cfg.botToken, cfg.chatId, job);
        }
      });
    });
  }

  if (message.action === "testConnection") {
    chrome.storage.local.get(["botToken", "chatId"], cfg => {
      sendToTelegram(cfg.botToken, cfg.chatId, { 
        email: "", company: "", position: "", experience: "", jobLink: ""
      }, "✅ Test message: Hello from Job Scraper!");
    });
  }

  if (message.action === "toggleScraping") {
    sentJobs = {}; // reset memory when restarting
  }
});

async function sendToTelegram(botToken, chatId, job, customText = null) {
  if (!botToken || !chatId) { console.error("Missing Bot Token/Chat ID."); return; }

  const text = customText || `Job Found:
Email: ${job.email}
Company: ${job.company}
Position: ${job.position}
Experience: ${job.experience}
Job link: ${job.jobLink}`;

  try {
    let res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });
    console.log("Telegram:", await res.json());
  } catch (err) {
    console.error("Telegram send failed:", err);
  }
}
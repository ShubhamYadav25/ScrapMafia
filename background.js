let sentJobs = {};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "jobsFound") {
    chrome.storage.local.get(["botToken", "chatId"], cfg => {
      if (!cfg.botToken || !cfg.chatId) {
        console.warn("⚠️ Missing Telegram config.");
        return;
      }

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
      sendToTelegram(cfg.botToken, cfg.chatId, {}, "✅ Test message: Hello from Job Scraper!");
    });
  }
});

async function sendToTelegram(botToken, chatId, job, customText = null) {
  const text = customText || `📣 Job Found:
Email: ${job.email}
Number: ${job.number}
Role: ${job.role}
Qualification: ${job.qualification}
Industry: ${job.industry}
Salary: ${job.salary}
Location: ${job.location}
Skills: ${job.skills}
Experience: ${job.experience}
Job link: ${job.jobLink}`;

  try {
    let res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    console.log("Telegram response:", await res.json());
  } catch (err) {
    console.error("Telegram send failed:", err);
  }
}
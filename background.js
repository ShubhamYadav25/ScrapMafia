const TELEGRAM_TOKEN = "8351501293:AAHzTfB9bVWggXguHWXu-8wb0mygF3gAlnA";
const CHAT_ID = "7888363351";

// Track sent jobs to avoid duplicates
let sentJobs = {};

// Listen for messages from contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "jobsFound") {
    console.log("Background got jobs:", message.data);

    message.data.forEach(job => {
      let uniqueKey = (job.email || "") + "|" + (job.jobLink || "");
      if (!sentJobs[uniqueKey]) {
        sentJobs[uniqueKey] = true;
        console.log("Sending to Telegram:", job);
        sendToTelegram(job);  // ✅ now this exists right below
      } else {
        console.log("Duplicate ignored:", job);
      }
    });
  }
});

// === Function must live in SAME FILE to be defined ===
async function sendToTelegram(job) {
  const text = `Job Found:
Email: ${job.email}
Company: ${job.company}
Position: ${job.position}
Experience: ${job.experience}
Job link: ${job.jobLink}`;

  try {
    let res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text
      })
    });
    let data = await res.json();
    console.log("Telegram API response:", data);
  } catch (err) {
    console.error("Failed sending to Telegram:", err);
  }
}

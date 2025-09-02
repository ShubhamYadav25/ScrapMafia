const TELEGRAM_TOKEN = "8351501293:AAHzTfB9bVWggXguHWXu-8wb0mygF3gAlnA";
const CHAT_ID = "7888363351";

function sendToTelegram(job) {
  const text = `Job Found:\nEmail: ${job.email}\nCompany: ${job.company}\nPosition: ${job.position}\nExperience: ${job.experience}\nJob link: ${job.jobLink}`;

  fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text
    })
  });
}
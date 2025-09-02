function randomDelay(min = 1000, max = 3000) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

// Extract job-like posts from LinkedIn feed
async function scrapeFeed() {
  let posts = document.querySelectorAll(".update-components-text");
  let results = [];

  posts.forEach(post => {
    let text = post.innerText;

    // Simple heuristics (improve regex as needed)
    let emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    let companyMatch = text.match(/at\s+([A-Z][A-Za-z0-9& ]+)/);
    let positionMatch = text.match(/looking for\s+(.*?)\s+at/i) || text.match(/hiring\s+(.*?)\s+at/i);
    let experienceMatch = text.match(/(\d+\+?\s+years?)/i);

    let jobLinkElement = post.closest("div.feed-shared-update")?.querySelector("a[href*='linkedin.com/jobs']");
    let jobLink = jobLinkElement ? jobLinkElement.href.split("?")[0] : "";

    if (emailMatch || jobLink) {
      results.push({
        email: emailMatch ? emailMatch[0] : "",
        company: companyMatch ? companyMatch[1] : "",
        position: positionMatch ? positionMatch[1] : "",
        experience: experienceMatch ? experienceMatch[0] : "",
        jobLink: jobLink
      });
    }
  });

  // Send to background for Telegram
  if (results.length > 0) {
    chrome.runtime.sendMessage({ action: "jobsFound", data: results });
  }
}

// Run every so often with random delay
(async function loopScraping() {
  while (true) {
    await scrapeFeed();
    await randomDelay(15000, 30000); // scrape roughly every 15–30 sec
    window.scrollBy(0, 400); // scroll to load more posts
  }
})();
// contentScript.js

let scrollTimeout;

// Watch for scrolling, but only scrape once user *stops* scrolling
window.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    // Check we still have a valid extension runtime
    if (chrome.runtime?.id) {
      chrome.storage.local.get("scrapingActive", data => {
        if (data.scrapingActive) {
          scrapeJobs();
        }
      });
    } else {
      console.warn("⚠️ Extension context invalidated — refresh the page after reloading the extension.");
    }
  }, 2000); // 2s after stop scrolling
});

// === Scraper function ===
function scrapeJobs() {
  try {
    let posts = document.querySelectorAll(".update-components-text");
    let results = [];

    posts.forEach(post => {
      let text = post.innerText;

      // Basic pattern matches — custom regex can be enhanced here
      let emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
      let companyMatch = text.match(/at\s+([A-Z][A-Za-z0-9& ]+)/);
      let positionMatch =
        text.match(/looking for\s+(.*?)\s+at/i) ||
        text.match(/hiring\s+(.*?)\s+at/i);
      let experienceMatch = text.match(/(\d+\+?\s+years?)/i);

      let jobLinkElement =
        post.closest("div.feed-shared-update")?.querySelector(
          "a[href*='linkedin.com/jobs']"
        );
      let jobLink = jobLinkElement ? jobLinkElement.href.split("?")[0] : "";

      // Save result only if relevant
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

    // === Send results, but safely check runtime context ===
    if (results.length > 0) {
      if (chrome.runtime?.id) {
        try {
          chrome.runtime.sendMessage({ action: "jobsFound", data: results });
          console.log("📨 Sent jobs to background:", results);
        } catch (err) {
          console.warn(
            "⚠️ Could not send message — extension context missing:",
            err
          );
        }
      } else {
        console.warn(
          "⚠️ Attempted to send but extension runtime is invalidated (probably reloaded)."
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in scrapeJobs():", err);
  }
}
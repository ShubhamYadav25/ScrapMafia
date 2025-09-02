console.log("🚀 LinkedIn Job Scraper active");

// Run scraping at random time intervals (20–40s)
function startScraping() {
  scrapeJobs(); // first run
  const delay = Math.floor(Math.random() * 20000) + 20000; // 20-40s
  setTimeout(startScraping, delay);
}
startScraping();

function scrapeJobs() {
  try {
    let posts = document.querySelectorAll(".update-components-text");
    let results = [];

    posts.forEach(post => {
      let text = post.innerText;

      let emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
      let numberMatch = text.match(/\+?\d[\d\s\-KATEX_INLINE_OPENKATEX_INLINE_CLOSE]{7,}\d/);
      let roleMatch = text.match(/role[:\-]?\s*(.+)/i);
      let qualificationMatch = text.match(/qualification[:\-]?\s*(.+)/i);
      let industryMatch = text.match(/industry[:\-]?\s*(.+)/i);
      let salaryMatch = text.match(/(?:salary|ctc)[:\-]?\s*([^\n]+)/i);
      let locationMatch = text.match(/(?:location|based in)[:\-]?\s*(.+)/i);
      let skillsMatch = text.match(/skills?[:\-]?\s*(.+)/i);
      let experienceMatch = text.match(/(\d+\+?\s+years?)/i);

      let jobLinkEl = post.closest("div.feed-shared-update")?.querySelector("a[href*='linkedin.com/jobs']");
      let jobLink = jobLinkEl ? jobLinkEl.href.split("?")[0] : "";

      if (emailMatch || jobLink) {
        results.push({
          email: emailMatch ? emailMatch[0] : "",
          number: numberMatch ? numberMatch[0] : "",
          role: roleMatch ? roleMatch[1] : "",
          qualification: qualificationMatch ? qualificationMatch[1] : "",
          industry: industryMatch ? industryMatch[1] : "",
          salary: salaryMatch ? salaryMatch[1] : "",
          location: locationMatch ? locationMatch[1] : "",
          skills: skillsMatch ? skillsMatch[1] : "",
          experience: experienceMatch ? experienceMatch[0] : "",
          jobLink: jobLink
        });
      }
    });

    if (results.length > 0) {
      console.log("📨 Found jobs:", results);
      chrome.runtime.sendMessage({ action: "jobsFound", data: results });
    } else {
      console.log("ℹ️ No jobs this run");
    }
  } catch (err) {
    console.error("❌ scrapeJobs error:", err);
  }
}
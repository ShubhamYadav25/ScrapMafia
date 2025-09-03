console.log("🚀 LinkedIn Job Scraper");

// -----------------------------
// Utility extractors
// -----------------------------

function extractEmail(t) {
  let m = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].trim() : "";
}

function extractPhone(t) {
  // Matches: +91 9888 730 672, 9888730672, 98-8873-0672
  let m = t.match(/(\+?\d{1,3}[-\s]?)?(\d{10}|\d{3}[-\s]?\d{3}[-\s]?\d{4}|\d{4}[-\s]?\d{6})/);
  return m ? m[0].replace(/\s|-/g, "").trim() : "";
}

function extractHashtags(t) {
  let m = t.match(/#\w+/g);
  return m ? m.join(", ") : "";
} 

function extractLocation(t) {
  let m = t.match(/📍\s*([^\n]+)/);
  if (m) return m[1].trim();
  let k = t.match(/(location|based in|venue|work location|job location)[:\-]?\s*(.+)/i);
  return k ? k[2].trim() : "";
}

function extractRoles(t) {
  let roles = [];
  t.split(/\n|•|–|-/).forEach(line => {
    if (/(developer|engineer|tester|analyst|architect|manager|executive|coordinator)/i.test(line)) {
      roles.push(line.trim());
    }
  });
  return roles.length ? [...new Set(roles)] : [];
}

function extractExperience(t) {
  let m = t.match(/(\d+\+?\s*(?:years?|yrs?)(?:\s*-\s*\d+\+?\s*(?:yrs?|years))?)/gi);
  return m ? m.join(", ") : "";
}

function extractSalary(t) {
  let m = t.match(/(salary|ctc|package|₹|usd|\$)\s*[:\-]?\s*([^\n]+)/i);
  return m ? m[2].trim() : "";
}

function extractShift(t) {
  let m = t.match(/(shift|shifts?)[:\-]?\s*(.+)/i);
  return m ? m[2].trim() : "";
}

function extractQualifications(t) {
  let m = t.match(/(qualification[s]?|education|degree)[:\-]?\s*([^\n]+)/i);
  return m ? m[2].trim() : "";
}

function extractResponsibilities(t) {
  let m = t.match(/Responsibilities:([\s\S]*?)(?:Qualification|Skills|Experience|$)/i);
  return m ? m[1].trim() : "";
}

function extractSkills(t) {
  let m = t.match(/(skills?|must have|technologies)[:\-]?\s*([^\n]+)/i);
  return m ? m[2].trim() : "";
}

function extractCompany(t) {
  let m = t.match(/at\s+([A-Za-z0-9 &.]+)/i);
  if (m) return m[1].trim();
  let n = t.match(/join\s+(our|the)?\s*team\s*(at)?\s*([A-Za-z0-9 &.]+)/i);
  return n ? (n[3] || "").trim() : "";
}

function extractJobType(t) {
  let m = t.match(/(remote|hybrid|onsite|in office|work from office|walk-?in|full[\s-]?time|part[\s-]?time)/i);
  return m ? m[0].trim() : "";
}

function extractDateTime(t) {
  let m = t.match(/(\d{1,2}(st|nd|rd|th)?\s+\w+\s*(\d{4})?|(\d{1,2}[:.]\d{2}\s*(am|pm)))/gi);
  return m ? m.join(", ") : "";
}

function extractVenue(t) {
  let m = t.match(/venue[\s:–-]+([\s\S]+)/i);
  if (m) return m[1].split("\n")[0].trim();
  return "";
}

function extractDocuments(t) {
  let m = t.match(/documents.*[:\-]\s*([\s\S]+)/i);
  if (m) {
    return m[1].split("\n").map(s => s.trim()).filter(Boolean).join(", ");
  }
  return "";
}

// -----------------------------
// Safe messaging wrapper
// -----------------------------
function safeSendMessage(msg) {
  try {
    if (chrome?.runtime?.id) {
      chrome.runtime.sendMessage(msg);
    } else {
      console.log("ℹ️ Extension messaging not available. Local output only:", msg);
    }
  } catch (err) {
    console.log("⚠️ Couldn’t send to extension:", err);
  }
}

// -----------------------------
// Scraper core
// -----------------------------
function scrapeJobs() {
  try {
    let posts = document.querySelectorAll(".update-components-text");
    let results = [];

    posts.forEach(post => {
      let text = post.innerText || "";

      let data = {
        company: extractCompany(text) || "",
        roles: extractRoles(text) || [],
        experience: extractExperience(text) || "",
        location: extractLocation(text) || "",
        salary: extractSalary(text) || "",
        jobType: extractJobType(text) || "",
        qualifications: extractQualifications(text) || "",
        responsibilities: extractResponsibilities(text) || "",
        skills: extractSkills(text) || "",
        shift: extractShift(text) || "",
        benefits: (text.includes("perks") || text.includes("Why Join Us")) ? "See JD" : "",
        dateTime: extractDateTime(text) || "",
        venue: extractVenue(text) || "",
        documentsRequired: extractDocuments(text) || "",
        hashtags: extractHashtags(text) || "",
        email: extractEmail(text) || "",
        phoneNumber: extractPhone(text) || ""
      };

      // Capture job link if available
      let jobLinkEl = post.closest("div.feed-shared-update")
        ?.querySelector("a[href*='linkedin.com/jobs']");
      data.jobLink = jobLinkEl ? jobLinkEl.href.split("?")[0] : "";

      if (data.email || data.phoneNumber || data.jobLink || data.roles.length > 0) {
        results.push(data);
      }
    });

    if (results.length > 0) {
      console.log("📨 Found jobs:", results);
      safeSendMessage({ action: "jobsFound", data: results });
    } else {
      console.log("ℹ️ No jobs this run");
    }

  } catch (err) {
    console.error("❌ scrapeJobs error:", err);
  }
}

// -----------------------------
// Safe random interval runner
// -----------------------------
let timerId = null;
function startScraping() {
  scrapeJobs();
  const delay = Math.floor(Math.random() * 20000) + 20000; // 20–40s
  timerId = setTimeout(startScraping, delay);
}
startScraping();

window.addEventListener("beforeunload", () => clearTimeout(timerId));
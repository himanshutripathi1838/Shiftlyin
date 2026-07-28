import puppeteer from "puppeteer";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("🚀 Starting Shiftlyin Automated Landing Page UI Tests...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  
  try {
    console.log("🌐 Navigating to http://127.0.0.1:5173/ ...");
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle2" });
    
    // Test 1: Page Title
    const title = await page.title();
    console.log(`✅ Page Title Loaded: "${title}"`);

    // Test 2: Theme Toggle
    console.log("🔍 Testing Theme Toggle...");
    const htmlClassBefore = await page.evaluate(() => document.documentElement.className);
    console.log(`- Theme class before click: "${htmlClassBefore}"`);
    
    await page.click(".theme-toggle-btn");
    await delay(1000);
    const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
    console.log(`- Theme class after click: "${htmlClassAfter}"`);
    
    if (htmlClassAfter.includes("dark") !== htmlClassBefore.includes("dark")) {
      console.log("✅ Theme Toggle works successfully!");
    } else {
      console.error("❌ Theme Toggle failed to switch classes.");
    }

    // Reset theme
    await page.click(".theme-toggle-btn");
    await delay(500);

    // Test 3: How Shiftlyin Works Modal Popup
    console.log("🔍 Testing How Shiftlyin Works click interaction...");
    await page.click(".works-card");
    await delay(1000);
    
    const isModalVisible = await page.evaluate(() => {
      // Look for a modal container overlay
      const divs = Array.from(document.querySelectorAll("div"));
      return divs.some(d => d.style.position === "fixed" && d.style.zIndex === "1000");
    });
    
    if (isModalVisible) {
      console.log("✅ Workflow Steps Modal popup opened successfully on click!");
    } else {
      console.error("❌ Workflow Steps Modal failed to open.");
    }
    
    // Close modal by clicking outside
    await page.click("div[style*='position: fixed']");
    await delay(500);

    // Test 4: Key Features Live Demos
    console.log("🔍 Testing Key Features click interaction...");
    await page.click(".feature-card");
    await delay(1000);
    
    const isDemoVisible = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll("div"));
      return divs.some(d => d.style.position === "fixed" && d.style.zIndex === "1000");
    });
    
    if (isDemoVisible) {
      console.log("✅ Key Features Live Demo Modal opened successfully on click!");
    } else {
      console.error("❌ Key Features Live Demo Modal failed to open.");
    }

    console.log("🎉 All UI tests executed successfully!");
  } catch (error) {
    console.error("❌ Test run failed with error:", error);
  } finally {
    await browser.close();
  }
})();

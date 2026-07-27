import puppeteer from "puppeteer";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("🚀 Starting HUSTLR Part 2: Interactive Demos UI Tests...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  
  try {
    console.log("🌐 Navigating to http://127.0.0.1:5173/ ...");
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle2" });
    
    // Find all feature cards
    const featureCards = await page.$$(".feature-card");
    console.log(`- Found ${featureCards.length} Feature Cards on-screen.`);

    // --- TEST 1: GPS Attendance check-in alert ---
    console.log("🔍 Testing GPS Attendance geofenced Check-In button click...");
    // GPS Attendance is index 2
    await featureCards[2].click();
    await delay(1000);

    // Setup dialog alert listener
    let alertTriggered = false;
    page.on("dialog", async (dialog) => {
      console.log(`  - Browser alert intercepted: "${dialog.message()}"`);
      if (dialog.message().includes("Mock Check-In successful")) {
        alertTriggered = true;
      }
      await dialog.accept();
    });

    // Find and click 'Tap to Check-In' button inside modal
    const checkInBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find(b => b.innerText.includes("Tap to Check-In"));
    });

    if (checkInBtn) {
      await checkInBtn.click();
      await delay(1000);
      if (alertTriggered) {
        console.log("✅ GPS Check-In alert fired and handled successfully!");
      } else {
        console.error("❌ GPS Check-In alert was not triggered.");
      }
    } else {
      console.error("❌ Could not locate the Check-In button in the modal.");
    }

    // Close the modal by clicking the Close button
    const closeBtn1 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find(b => b.innerText.includes("Close Demo"));
    });
    if (closeBtn1) await closeBtn1.click();
    await delay(500);

    // --- TEST 2: Secure Wallet Withdraw UPI state change ---
    console.log("🔍 Testing Secure Wallet Withdraw UPI transfer animation...");
    // Re-query cards to be safe
    const updatedCards = await page.$$(".feature-card");
    // Wallet is index 6
    await updatedCards[6].click();
    await delay(1000);

    // Get the withdraw button element
    const withdrawBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find(b => b.innerText.includes("Withdraw to Bank"));
    });

    if (withdrawBtn) {
      // Click the withdraw button
      await withdrawBtn.click();
      await delay(1000);

      // Verify text changed to success message
      const buttonText = await page.evaluate((btn) => btn.innerText, withdrawBtn);
      console.log(`  - Wallet button text after click: "${buttonText}"`);

      if (buttonText.includes("Transferred to UPI")) {
        console.log("✅ Wallet Withdrawal mock UPI transfer triggered successfully!");
      } else {
        console.error("❌ Wallet button did not transition text correctly.");
      }
    } else {
      console.error("❌ Could not locate the Withdraw button in the modal.");
    }

    // Close the modal
    const closeBtn2 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find(b => b.innerText.includes("Close Demo"));
    });
    if (closeBtn2) await closeBtn2.click();
    await delay(500);

    console.log("🎉 Part 2 Automated Interactive tests executed successfully!");
  } catch (error) {
    console.error("❌ Part 2 test run failed with error:", error);
  } finally {
    await browser.close();
  }
})();

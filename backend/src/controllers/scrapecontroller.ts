


// import puppeteer from "puppeteer";
// import { Request, Response } from "express";

// export const checkSwiggyAvailability = async (req: Request, res: Response) => {
//   const { location } = req.body;

//   if (!location) {
//     return res.status(400).json({ error: "Location is required." });
//   }

//   const browser = await puppeteer.launch({
//     headless: false,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     slowMo: 50,
//   });

//   const page = await browser.newPage();
//   await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
//       const navigationPromise = page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 });

//   try {
//     await page.goto("https://www.swiggy.com/", {
//       waitUntil: "domcontentloaded",
//       timeout: 30000,
//     });
//     await navigationPromise

//     // Focus and type into the input box
//     const inputSelector = "input[placeholder='Enter your delivery location']";
//     await page.waitForSelector(inputSelector, { timeout: 10000 });
//     await page.click(inputSelector);
//     await page.type(inputSelector, location);
//     await navigationPromise

//     // Wait for suggestions container
//     const suggestionSelector = "._1oLDb li";
//     await page.waitForSelector(suggestionSelector, { timeout: 10000 });

//     // Click the first suggestion explicitly
//     await page.click(suggestionSelector);

//     // Wait for navigation to location-based Swiggy page

//     const finalUrl = page.url();
//     const isAvailable = !finalUrl.includes("landing");

//     console.log("Page URL:", finalUrl);
//     res.json({ available: isAvailable });
//       console.log('did I get this far?');
//   } catch (error) {
//     console.error("Swiggy error:", error);
//     res.status(500).json({ available: false, error: "Scraping failed" });
//   } finally {
//     await browser.close();
//   }
// };

import puppeteer from "puppeteer";
import { Request, Response } from "express";

export const checkSwiggyAvailability = async (req: Request, res: Response) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: "Location is required." });
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    slowMo: 50,
  });

  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
    );

    // Open Swiggy homepage
    await page.goto("https://www.swiggy.com/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for and type into location input
    const inputSelector = "input[placeholder='Enter your delivery location']";
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.click(inputSelector);
    await page.type(inputSelector, location);

    // Wait for suggestion dropdown to appear
    const suggestionSelector = 'input[id="search"]';
    await page.waitForSelector(suggestionSelector, { timeout: 10000 });

    // Now set up waitForNavigation AFTER the action that triggers it
    const navigationPromise = page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    // Click the first suggestion
    await page.click(suggestionSelector);

    // Now wait for the navigation to complete
    await navigationPromise;

    const finalUrl = page.url();
    const isAvailable = !finalUrl.includes("landing");

    console.log("Page URL:", finalUrl);
    res.json({ available: isAvailable });
  } catch (error) {
    console.error("Swiggy error:", error);
    res.status(500).json({ available: false, error: "Scraping failed" });
  } finally {
    await browser.close();
  }
};

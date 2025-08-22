

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

interface LocationData {
  [x: string]: any;
  description: string;
  place_id: string;
  address: string;
}

interface CheckAvailabilityBody {
  pickup: LocationData;
  destination: LocationData;
}

app.post(
  "/api/check-availability",
  async (req: Request<{}, {}, CheckAvailabilityBody>, res: Response) => {
    const pickupLocationName = req.body.pickup?.address;
    const destinationLocationName = req.body.destination?.address;

    if (!pickupLocationName || !destinationLocationName) {
      return res
        .status(400)
        .json({ error: "Pickup and destination names are required" });
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
      );

      console.log("Opening Rapido...");
      await page.goto("https://www.rapido.bike", { waitUntil: "networkidle2" });

      // Pickup
      await page.waitForSelector("input[placeholder='Enter Pickup Location']");
      await page.click("input[placeholder='Enter Pickup Location']");
      await page.type("input[placeholder='Enter Pickup Location']", pickupLocationName, { delay: 100 });
      await new Promise(res => setTimeout(res, 2000));
      const pickupSuggestion = (await page.$$(".dropdown-item"))[0];
      if (pickupSuggestion) await pickupSuggestion.click();

      // Drop
      await page.waitForSelector("input[placeholder='Enter Drop Location']");
      await page.click("input[placeholder='Enter Drop Location']");
      await page.type("input[placeholder='Enter Drop Location']", destinationLocationName, { delay: 100 });
      await new Promise(res => setTimeout(res, 2000));
      const dropSuggestion = (await page.$$(".dropdown-item"))[0];
      if (dropSuggestion) await dropSuggestion.click();

      // Book ride
      await page.waitForSelector('button[aria-label="book-ride"]');
      await page.click('button[aria-label="book-ride"]');
      await new Promise(res => setTimeout(res, 5000)); 

      // Scrape results
      await page.waitForSelector(".card-wrap", { timeout: 60000 });
const rides = await page.evaluate(() => {
  const rideElements = document.querySelectorAll(".card-wrap");
  return Array.from(rideElements).map((card) => {
    const type =
      card.querySelector(".card-content")?.textContent?.trim() || "Unknown";

    const price = Array.from(card.querySelectorAll("div"))
      .map((el) => el.textContent?.trim())
      .filter((text) => text?.includes("₹"))
      .pop() || "N/A";

    return { type, price };
  });
});

      console.log("Rides found:", rides);


      // await browser.close();

      res.json({ success: true, rides });
    } catch (error) {
      console.error("Puppeteer error:", error);
      if (browser) {
        await browser.close();
      }
      
      res.status(500).json({ success: false, error: "Failed to get Rapido estimates" });
    }
  }
);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);




import puppeteer from "puppeteer";
import { Request, Response } from "express";

export const getRapidoEstimate = async (req: Request, res: Response) => {
  const { pickup, destination } = req.body;

  if (!pickup || !destination) {
    return res.status(400).json({ error: "Pickup and destination are required" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: false, // show browser
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Pretend to be a normal browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
    );

    console.log("Opening Rapido...");
    await page.goto("https://www.rapido.bike", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    // For now, just test if the page opened
    await page.screenshot({ path: "rapido_home.png" });

    await browser.close();
    res.json({ success: true, message: "Rapido page opened and screenshot taken" });
  } catch (error) {
    console.error("Puppeteer error:", error);
    res.status(500).json({ error: "Failed to load Rapido page" });
  }
};

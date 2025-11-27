import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

app.get("/", (req, res) => {
  res.send("🚀 Ilmhona PDF server is running");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html, fileName } = req.body;

    if (!html) return res.status(400).send("❌ No HTML received");

    const path = await chromium.executablePath();
    console.log("Chromium PATH:", path);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: path,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName || "ilmhona"}.pdf"`
    });

    res.send(pdf);

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).send("PDF generation failed");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Ilmhona PDF server running on port ${PORT}`)
);

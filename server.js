import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("🚀 Ilmhona PDF server running (fast chrome)");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html, fileName } = req.body;

    if (!html) return res.status(400).send("❌ No HTML received");

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName || "resume"}.pdf"`,
    });

    res.send(pdf);

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).send("Error generating PDF");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Ilmhona PDF server running on port ${PORT}`)
);

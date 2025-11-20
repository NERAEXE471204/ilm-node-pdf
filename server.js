import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("Ilmhona PDF server is running 🚀");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html, fileName } = req.body;

    if (!html || html.length < 20) {
      return res.status(400).send("❌ HTML content is empty or too short");
    }

    console.log("🔥 HTML length:", html.length);

    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote"
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName || "document"}.pdf"`
    );

    res.send(pdf);

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).send("PDF generation error: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Ilmhona PDF server running on port ${PORT}`);
});

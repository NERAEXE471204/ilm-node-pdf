import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Ilmhona PDF server is running 🚀");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const { html, fileName } = req.body;

    console.log("🔥 HTML length:", html.length);

    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error("❌ PDF error:", err);
    res.status(500).send("PDF generation error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Ilmhona PDF server running on port ${PORT}`));

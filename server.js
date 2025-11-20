import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// === Проверка здоровья ===
app.get("/", (req, res) => {
  res.send("🚀 Ilmhona PDF server running");
});

// === Маршрут генерации PDF ===
app.post("/generate-pdf", async (req, res) => {
  try {
    const { html, fileName } = req.body;

    if (!html) {
      return res.status(400).send("❌ No HTML received");
    }

    console.log("🔥 HTML length:", html.length);

    // Запуск Chromium
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Генерация PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, left: 0, right: 0, bottom: 0 }
    });

    await browser.close();

    console.log("✅ PDF Generated");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName || "resume"}.pdf"`,
    });

    return res.send(pdfBuffer);

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    return res.status(500).send("Error generating PDF");
  }
});

// === Старт сервера ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Ilmhona PDF server running on port ${PORT}`);
});

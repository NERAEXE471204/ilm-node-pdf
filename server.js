// ======================================================
// Ilmhona PDF Service — Puppeteer standalone version
// ======================================================

const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();

app.use(bodyParser.json({ limit: "10mb" }));

// === Тестовый эндпоинт ===
app.get("/test", (req, res) => {
  res.json({ status: "PDF server OK ✅" });
});

// === Главный эндпоинт для генерации PDF ===
app.post("/generate-pdf", async (req, res) => {
  const { html, fileName } = req.body;

  if (!html) {
    return res.status(400).send("HTML required");
  }

  const safeName = (fileName || "resume")
    .replace(/[^\w\d_-]/g, "_");
  
  try {
    console.log("📄 Запуск Chromium...");

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`
    });

    res.send(pdfBuffer);

    console.log("✅ PDF отправлен:", safeName);

  } catch (error) {
    console.error("❌ Ошибка PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

// === Запуск сервера ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Ilmhona PDF server running on port ${PORT}`);
});


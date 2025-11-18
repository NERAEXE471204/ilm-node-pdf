import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer-core";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Ilmhona PDF server is running 🚀");
});

app.post("/generate-pdf", async (req, res) => {
 try {
    const { html, fileName } = req.body;
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: "/usr/bin/google-chrome"
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4" });

    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Ilmhona PDF server running on port ${PORT}`));


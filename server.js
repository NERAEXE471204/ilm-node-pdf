import express from "express";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health-check
app.get("/", (req, res) => {
    res.send("Ilmhona PDF server is running 🚀");
});

// PDF endpoint
app.post("/generate-pdf", async (req, res) => {
    try {
        const { html, fileName } = req.body;

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({ format: "A4" });

        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName}.pdf"`
        });

        res.send(pdfBuffer);

    } catch (err) {
        console.error("PDF ERROR:", err);
        res.status(500).send("PDF generation error");
    }
});

app.listen(10000, () => {
    console.log("🚀 Ilmhona PDF server running on port 10000");
});


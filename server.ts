import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini PQC Security Audit Endpoint
  app.post("/api/gemini/audit", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets."
        });
      }

      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are Aegis-AI, an elite Post-Quantum Cryptography (PQC) auditor and cybersecurity expert.
Your goal is to evaluate the user's cryptographic queries, legacy code blocks, or software dependencies, and provide a detailed risk report.
Your response MUST be extremely technical, professional, clean, and directly cover:
- Cryptographic risk of the current state (such as RSA, ECC, AES vulnerabilities).
- NIST Post-Quantum Cryptography (PQC) migration timelines and compliance.
- Recommended migration strategies specifically referencing CRYSTALS-Kyber, CRYSTALS-Dilithium, Falcon, and SPHINCS+.
- Actionable next steps.

Format your output in clean, professional Markdown with clear section headers, bullet points, and code blocks where applicable. Ensure your tone is authoritative, highly technical, and objective.`;

      const contents = `User Query: ${prompt}\n\nAdditional Context (Active Security State or SBOM):\n${JSON.stringify(context, null, 2)}`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];
      let response = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            if (response && response.text) break;
          } catch (err: any) {
            lastError = err;
            const errStr = String(err?.message || err);
            const is503OrRateLimit = err?.status === 503 || err?.code === 503 || errStr.includes("503") || errStr.includes("high demand") || err?.status === 429;
            
            if (is503OrRateLimit && attempt < 3) {
              await new Promise((res) => setTimeout(res, attempt * 1200));
            } else {
              break;
            }
          }
        }
        if (response && response.text) break;
      }

      if (!response || !response.text) {
        const errMsg = lastError?.message || String(lastError);
        if (errMsg.includes("503") || errMsg.includes("high demand")) {
          return res.status(503).json({
            error: "The Gemini AI model is currently experiencing temporary high demand (503). Please wait a moment and click retry."
          });
        }
        throw lastError || new Error("Failed to receive a response from Gemini AI.");
      }

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const is503 = String(err?.message || "").includes("503") || String(err?.message || "").includes("high demand");
      res.status(is503 ? 503 : 500).json({ 
        error: is503 
          ? "The Gemini AI model is currently experiencing temporary high demand (503). Please try again shortly." 
          : (err.message || "An error occurred during Gemini AI analysis.") 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});

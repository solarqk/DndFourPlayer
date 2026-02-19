import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from dist
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback (so refresh/deep links work)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Serving dist on http://0.0.0.0:${port}`);
});

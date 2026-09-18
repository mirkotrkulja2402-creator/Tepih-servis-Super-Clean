import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    })
  : null;

app.get("/api/health", async (_req, res) => {
  let db = "local-dev";
  if (pool) {
    try {
      await pool.query("select 1");
      db = "postgres-ok";
    } catch (e) {
      db = "postgres-error";
    }
  }
  res.json({ ok: true, app: "Tepih servis Super Clean", db });
});

app.get("/api/config", async (_req, res) => {
  res.json({
    company: {
      name: "Super Clean",
      subtitle: "TEPIH SERVIS",
      phone: "066 311 221",
      city: "Banja Luka",
    },
    deliveryPrice: 5,
    modules: [
      "Kupci",
      "Cjenovnik",
      "Narudžbe",
      "Mjerenje",
      "Računi",
      "Blagajna",
      "Izvještaji",
      "Ruta",
      "GARI",
      "QR KOD",
      "Administrator",
    ],
  });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");
const clientPublic = path.resolve(__dirname, "../../client/public");

// PWA files must be served before the SPA fallback.
app.get("/manifest.webmanifest", (_req, res) => {
  res.sendFile(path.join(clientPublic, "manifest.webmanifest"));
});

app.get("/sw.js", (_req, res) => {
  res.sendFile(path.join(clientPublic, "sw.js"));
});

app.use(express.static(clientDist));
app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Super Clean server listening on ${port}`));

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.post("/compile", (req, res) => {
  const code = req.body && req.body.code;
  const fqbn = (req.body && req.body.fqbn) || "arduino:avr:nano";
  if (!code || typeof code !== "string") {
    return res.status(400).json({ success: false, error: "Codigo vacio." });
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sketch-"));
  const sketchName = path.basename(tmpDir);
  const inoPath = path.join(tmpDir, sketchName + ".ino");
  const buildDir = path.join(tmpDir, "build");

  fs.writeFileSync(inoPath, code, "utf8");

  execFile(
    "arduino-cli",
    ["compile", "--fqbn", fqbn, "--output-dir", buildDir, tmpDir],
    { timeout: 25000 },
    (err, stdout, stderr) => {
      try {
        if (err) {
          return res.status(400).json({
            success: false,
            error: stderr || stdout || err.message
          });
        }
        const hexPath = path.join(buildDir, sketchName + ".ino.hex");
        const hex = fs.readFileSync(hexPath, "utf8");
        res.json({ success: true, hex });
      } catch (readErr) {
        res.status(500).json({ success: false, error: readErr.message });
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  );
});

app.get("/", (_req, res) => res.send("Compilador Arduino Nano listo."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en puerto " + PORT));

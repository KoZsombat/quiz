import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fileHandler(app) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../images"));
    },
    filename: (req, file, cb) => {
      let code = req.body.code;
      let index = req.body.index;
      const extension = path.extname(file.originalname);
      const uniqueName = `${code}_${index}${extension}`;

      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter,
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }
    res.json({
      success: true,
      filename: req.file.filename,
    });
  });

  app.post("/api/delete", (req, res) => {
    const { filename } = req.body;
    const filePath = path.join(__dirname, "../images", filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting file" });
      }
      res.json({ message: "File deleted successfully" });
    });
  });

  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../images", filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ error: "File not found" });
      }
    });
  });

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}

export default fileHandler;

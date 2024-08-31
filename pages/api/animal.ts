import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
const TeachableMachine = require("@sashido/teachablemachine-node");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "/public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `uploaded_image_${Date.now()}${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  upload.single("image")(req as any, res as any, (err: any) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const model = new TeachableMachine({
      modelUrl: "https://teachablemachine.withgoogle.com/models/bB3YHn5r/",
    });

    model
      .classify({
        imageUrl: "https://candy.blbt.app" + "/api/download/" + file.filename,
      })
      .then((predictions: any) => {
        return res.status(200).json(predictions);
      })
      .catch((e: any) => {
        console.error(e);
        return res.status(500);
      });
  });
}

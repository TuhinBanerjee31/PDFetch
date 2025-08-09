import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { contextRetriever } from "./utils/contextRetriever.js";
import { chatResult } from "./utils/chatResult.js";

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const myQueue = new Queue("file-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

app.get("/", (req, res) => {
  return res.json({ message: "ALL WORKING FINE" });
});

app.post("/upload/pdf", upload.single("pdf"), (req, res) => {
  myQueue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      source: req.file.destination,
      path: req.file.path,
    })
  );

  return res.json({ message: "uploaded" });
});

app.post("/chat", async (req, res) => {
  const userQuery = req.body.message;

  const selfQueryRetriever = await contextRetriever();

  const ans = await chatResult(selfQueryRetriever, userQuery);

  console.log("ANSWER: ", ans);
  return res.json({ ans });
});

app.listen(8000, () => console.log(`Server started on PORT:${8000}`));

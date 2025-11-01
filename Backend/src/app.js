import express from "express";
import cors from "cors";
import mgnregaRoutes from "./routes/mgnregaRoutes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173","https://gram-data-gt3m.onrender.com"],
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is healthy ✅" });
});

app.use("/api/mgnrega", mgnregaRoutes);

export default app;

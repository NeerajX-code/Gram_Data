import express from "express";
import cors from "cors";
import mgnregaRoutes from "./routes/mgnregaRoutes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

app.use(express.json());

app.use("/api/mgnrega", mgnregaRoutes);

export default app;

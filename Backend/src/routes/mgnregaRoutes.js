import express from "express";

const router = express.Router();

import { getDistrictData } from "../controllers/mgnregaController.js";

router.post("/", getDistrictData);

export default router;

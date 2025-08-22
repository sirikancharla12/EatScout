import { Router } from "express";
import { getRapidoEstimate } from "../controllers/scrapecontroller";

const router = Router();

// router.post("/get-rides", getRapidoEstimate);
router.post("/check-availability", getRapidoEstimate);

export default router;




import { Router } from "express";
import { checkSwiggyAvailability } from "../controllers/scrapecontroller";

const scrapeRoutes = Router();
scrapeRoutes.post("/check-availability", checkSwiggyAvailability);

export default scrapeRoutes;

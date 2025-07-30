import {Router} from "express"
import scrapeRoutes from "./scraperoute"
const router=Router()
router.use("/",scrapeRoutes)

export default router
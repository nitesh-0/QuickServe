import express from "express"
import authRoutes from "./auth"
import menuRoutes from "./menu_items"
import qrRoutes from "./qrgenerate"
import orderRoutes from "./orders"
import placedOrdersRoutes from "./placedorders"

const router = express()

router.use("/auth", authRoutes)
router.use("/menu", menuRoutes)
router.use("/tables", qrRoutes)
router.use("/orders", orderRoutes)
router.use("/owner", placedOrdersRoutes)


export default router;

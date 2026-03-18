import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import packagesRouter from "./packages";
import workshopsRouter from "./workshops";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(packagesRouter);
router.use(workshopsRouter);
router.use(ordersRouter);
router.use(reviewsRouter);
router.use(chatRouter);

export default router;

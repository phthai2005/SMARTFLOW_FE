import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crowdsourcingRouter from "./crowdsourcing";
import rulesRouter from "./rules";
import adminsRouter from "./admins";
import usersRouter from "./users";
import modelsRouter from "./models";
import evidenceRouter from "./evidence";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crowdsourcingRouter);
router.use(rulesRouter);
router.use(adminsRouter);
router.use(usersRouter);
router.use(modelsRouter);
router.use(evidenceRouter);

export default router;

import express from "express"
import * as attendanceRuleController from "./attendanceRule.controller.js";
import { authMiddleware } from "../../auth/auth.middleware.js";
import { roleMiddleware } from "../../../middleware/role.middleware.js";

const router = express.Router();

router.get('/',authMiddleware,roleMiddleware('ADMIN'),attendanceRuleController.getAttendanceRule);
router.put('/',authMiddleware,roleMiddleware('ADMIN'),attendanceRuleController.updateAttendanceRule);

export default router;
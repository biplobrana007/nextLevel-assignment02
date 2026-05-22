import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { userRole } from "../auth/user.roles";

const router = Router();

router.post("/", auth(userRole.contributor,userRole.maintainer), issueController.createIssue);

export const issueRoute = router;

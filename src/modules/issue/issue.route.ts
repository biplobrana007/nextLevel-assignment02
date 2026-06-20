import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { userRole } from "../auth/user.roles";

const router = Router();

router.post(
  "/",
  auth(userRole.contributor, userRole.maintainer),
  issueController.createIssue
);
router.get("", issueController.getAllIssue);
router.get("/:id", issueController.getSingleIssue);
router.patch(
  "/:id",
  auth(userRole.contributor, userRole.maintainer),
  issueController.updateIssue
);
router.delete("/:id", auth(userRole.maintainer), issueController.deleteIssue);

export const issueRoute = router;

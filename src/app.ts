import express, { type Request, type Response } from "express";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://localhost:3000",
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "assignment-02",
    level: "next level",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);
export default app;

import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";

const createIssue = async (req: Request, res: Response) => {
  const { id } = req.user as JwtPayload;

  try {
    const result = await issueService.createIssueIntoDB(req.body, id);
    res.status(201).json({
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};
const getAllIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssueFromDB();
    res.status(200).json({
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssue,
};

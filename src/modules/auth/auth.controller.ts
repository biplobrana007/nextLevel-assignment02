import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {

  try {
    const result = await authService.signupUserIntoDB(req.body);
    res.status(201).json({
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {

  try {
    const result = await authService.loginUserFromDB(req.body);
    res.status(200).json({
      message: "User logged in successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signupUser,
  loginUser
};

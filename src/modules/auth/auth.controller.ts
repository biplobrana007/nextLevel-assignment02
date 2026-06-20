import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message:
        error.message ===
        'duplicate key value violates unique constraint "users_email_key"'
          ? "This email already exits!"
          : error.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserFromDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signupUser,
  loginUser,
};

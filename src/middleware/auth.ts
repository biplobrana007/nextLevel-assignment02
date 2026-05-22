import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env.config";
import { pool } from "../db";
import type { Role } from "../modules/auth/user.interface";

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }
  
      const decoded = jwt.verify(
        token as string,
        config.jwt_secret as string
      ) as JwtPayload;
  
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id]
      );
  
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }
  
      if (roles.length && !roles.includes(decoded.role)) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      next(error)
    }
  };
};

export default auth;

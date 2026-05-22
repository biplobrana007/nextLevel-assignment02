import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env.config";

const auth = async (req: Request, res: Response, next: NextFunction) => {

  const token = req.headers.authorization;
  const decoded = jwt.verify(
    token as string,
    config.jwt_secret as string
  ) as JwtPayload;

  req.user = decoded;
  next();
};

export default auth;

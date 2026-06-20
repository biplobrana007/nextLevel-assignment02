import config from "../../config/env.config";
import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signupUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );

  delete result.rows[0].password;

  return result;
};

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtpayload, config.jwt_secret as string, {
    expiresIn: "1d",
  });

  delete user.password;

  return { token, user};
};
export const authService = {
  signupUserIntoDB,
  loginUserFromDB,
};

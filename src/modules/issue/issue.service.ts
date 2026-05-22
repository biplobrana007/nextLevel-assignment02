import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue, reporterId: number) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type, reporter_id) VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, reporterId]
  );

  return result;
};

const getAllIssueFromDB = async () => {

  const result = await pool.query(`
    SELECT * FROM issues
    
    `);

  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB
};

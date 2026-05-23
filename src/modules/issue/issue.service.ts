import type { Response } from "express";
import { pool } from "../../db";
import type { IIssue } from "./issue.interface";
import sendResponse from "../../utility/sendResponse";

const createIssueIntoDB = async (payload: IIssue, reporterId: number) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,status, reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5)
        RETURNING *
        `,
    [title, description, type, status, reporterId]
  );

  return result;
};

const getAllIssueFromDB = async () => {
  const issues = await pool.query(`
    SELECT * FROM issues
    
    `);

  const users = await pool.query(`
    SELECT * FROM users
    `);

  const mapIssues = issues.rows.map((issue) => {
    const { id, title, description, type, status, created_at, updated_at } =
      issue;

    const user = users.rows.find((user) => user.id === issue.reporter_id);
    const { id: userId, name, role } = user;

    const result = {
      id: id,
      title: title,
      description: description,
      type: type,
      status: status,
      reporter: {
        id: userId,
        name: name,
        role: role,
      },
      created_at: created_at,
      updated_at: updated_at,
    };

    return result;
  });

  return mapIssues;
};

const getSingleIssueFromDB = async (id: string, res:Response) => {
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );

  if (issue.rows.length === 0) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Issue Not Found",
    });
  }

  const {
    id: issueId,
    title,
    description,
    type,
    status,
    created_at,
    updated_at,
  } = issue.rows[0];

  const reporterId = issue.rows[0].reporter_id;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    
    `,
    [reporterId]
  );

  const { id: userId, name, role } = user.rows[0];

  const result = {
    id: issueId,
    title: title,
    description: description,
    type: type,
    status: status,
    reporter: {
      id: userId,
      name: name,
      role: role,
    },
    created_at: created_at,
    updated_at: updated_at,
  };

  return result;
};
const updateIssueIntoDB = async (
  payload: IIssue,
  id: string,
  role: string,
  userId: string,
  res: Response
) => {
  const { title, description, type } = payload;

  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );

  if (issue.rows.length === 0) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Issue Not Found",
    });
  }
  if (role === "contributor" && userId !== issue.rows[0].reporter_id) {
    sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "As a contributor you are allowed to update only your own issue",
    });
  }

  if (role === "contributor" && issue.rows[0].status !== "open") {
    sendResponse(res, {
      statusCode: 403,
      success: false,
      message:
        "You are a contributor and status is also not open so you can't update the issue",
    });
  }

  const result = await pool.query(
    `
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type)

    WHERE id=$4 RETURNING *
    `,
    [title, description, type, id]
  );

  return result;
};
const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1
    `,
    [id]
  );

  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};

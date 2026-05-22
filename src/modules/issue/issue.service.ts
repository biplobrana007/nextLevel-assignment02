import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

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
  const result = await pool.query(`
    SELECT * FROM issues
    
    `);

  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );

  return result;
};
const updateIssueIntoDB = async (
  payload: IIssue,
  id: string,
  role: string,
  userId : string
) => {
  const { title, description, type } = payload;

  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );


  if(role === "contributor" && userId !== issue.rows[0].reporter_id){
    throw new Error ("As a contributor you are allowed to update only your own issue")
  }

  if (role === "contributor" && issue.rows[0].status !== "open") {
    throw new Error(
      "You are a contributor and status is also not open so you cant update the issue"
    );
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

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
};

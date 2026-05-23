import type { Request } from "express";
import { issueService } from "../modules/issue/issue.service";

const issueSortBy = async (req: Request) => {
  const result = await issueService.getAllIssueFromDB();
  const { sort = "newest", type, status } = req.query;
  let data: object[] = [];
  
  // sort by time
  if (sort === "newest") {
    data = [
      ...result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    ];
  } else if (sort === "oldest") {
    data = [
      ...result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    ];
  }

  // sort by type
  if (type === "bug") {
    data = [...result.filter((issue) => issue.type === "bug")];
  } else if (type === "feature_request") {
    data = [...result.filter((issue) => issue.type === "feature_request")];
  }

  //short by status
  if (status === "open") {
    data = [...result.filter((issue) => issue.status === "open")];
  } else if (status === "in_progress") {
    data = [...result.filter((issue) => issue.status === "in_progress")];
  } else if (status === "resolved") {
    data = [...result.filter((issue) => issue.status === "resolved")];
  }

  return data;
};

export default issueSortBy;

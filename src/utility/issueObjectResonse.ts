import type { User } from "../modules/auth/user.interface";
import type { Issue } from "../modules/issue/issue.interface";

const issueObjectResponse = (issue: Issue, user: User) => {
  const { id, title, description, type, status, created_at, updated_at } =
    issue;
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
  console.log(result);
  return result;
};

export default issueObjectResponse;

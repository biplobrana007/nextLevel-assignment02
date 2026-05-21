type Role = "contributor" | "maintainer";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const role = ["contributor", "maintainer"] as const;

export type Role = (typeof role)[number];

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

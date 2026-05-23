const type = ["bug", "feature_request"];
const status = ["open", "un_progress", "resolved"];

export type Type = (typeof type)[number];
export type Status = (typeof status)[number];

export interface Issue {
  id:number;
  title: string;
  description: string;
  type: Type;
  status: Status;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}
export interface IIssue {
  title: string;
  description: string;
  type: Type;
  status: Status;
  reporter_id: number;
}

const type = ["bug", "feature_request"];
const status = ["open", "un_progress", "resolved"];

export type Type = (typeof type)[number];
export type Status = (typeof status)[number];

export interface IIssue {
  title: string;
  description: string;
  type: Type;
  status: Status;
  reporter_id: number;
}

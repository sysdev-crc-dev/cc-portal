export enum RoleEnum {
  Admin = "Admin",
  Staff = "Staff",
  Operator = "Operator",
}

export type Role = {
  id: number | string;
  name?: string;
};

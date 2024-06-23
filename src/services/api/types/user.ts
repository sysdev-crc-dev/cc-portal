import { RoleEnum } from "./role";

export type User = {
  role: RoleEnum;
  email: string;
  id: number;
  employee: Employee;
  employee_id: number;
};

export type Employee = {
  id: number;
  name: string;
  last_name: string;
  cell_phone: string;
};

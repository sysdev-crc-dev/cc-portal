import { Employee } from "./employee";

export type Company = {
  id: number;
  name: string;
  type: string;
  is_active: string;
  employees: Pick<Employee, "id" | "name">[];
};

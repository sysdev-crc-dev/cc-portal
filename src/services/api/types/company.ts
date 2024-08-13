import { Customer } from "./customer";

export type Company = {
  id: number;
  name: string;
  type: string;
  is_active: string;
  customers: Pick<Customer, "id" | "name">[];
};

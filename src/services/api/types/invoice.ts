import { Customer } from "./customer";

export type Invoice = {
  id: number;
  name: string;
  rfc: string;
  email: string;
  invoice_use: string;
  postal_code: string;
  fiscal_regimen: string;
  customer_id: number;
  customer: Pick<Customer, "id" | "name">;
};

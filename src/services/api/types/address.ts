import { Customer } from "./customer";

export type Address = {
  id: number;
  street: string;
  neighborhood: string;
  no_ext: number;
  no_int: number;
  postal_code: string;
  town: string;
  state: string;
  extra_info: string;
  customer_id: number;
  customer?: Pick<Customer, "id">;
};

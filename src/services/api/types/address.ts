import { Customer } from "./customer";
import { Provider } from "./provider";

export type Address = {
  id: number;
  street: string;
  neighborhood: string;
  no_ext: string;
  no_int: string;
  postal_code: string;
  town: string;
  state: string;
  extra_info: string;
  customer_id: number;
  customer?: Pick<Customer, "id">;
  provider_id?: number;
  provider?: Pick<Provider, "id">;
};

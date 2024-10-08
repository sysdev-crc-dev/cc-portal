import { SortEnum } from "@/services/api/types/sort-type";
import { Address } from "@/services/api/types/address";

export type AddressFilterType = {
  customer_id: string;
  provider_id: string;
  postal_code: string;
  street: string;
};

export type AddressSortType = {
  orderBy: keyof Address;
  order: SortEnum;
};

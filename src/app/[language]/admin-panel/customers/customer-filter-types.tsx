import { SortEnum } from "@/services/api/types/sort-type";
import { Customer } from "@/services/api/types/customer";

export type CustomerFilterType = {
  name: string;
  last_name: string;
  cell_phone: string;
  email: string;
};

export type CustomerSortType = {
  orderBy: keyof Customer;
  order: SortEnum;
};

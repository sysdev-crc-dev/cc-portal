import { SortEnum } from "@/services/api/types/sort-type";
import { Supply } from "@/services/api/types/supply";

export type SupplyFilterType = {
  id: string;
  name: string;
  project_id: string;
};

export type SupplySortType = {
  orderBy: keyof Supply;
  order: SortEnum;
};

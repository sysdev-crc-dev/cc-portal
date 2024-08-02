import { SortEnum } from "@/services/api/types/sort-type";
import { Provider } from "@/services/api/types/provider";

export type ProviderFilterType = {
  name: string;
  tag: string;
  address_id: string;
  id: string;
  material_id: string;
};

export type ProviderSortType = {
  orderBy: keyof Provider;
  order: SortEnum;
};

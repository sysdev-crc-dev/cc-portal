import { SortEnum } from "@/services/api/types/sort-type";
import { Material } from "@/services/api/types/material";

export type MaterialFilterType = {
  id: string;
  name: string;
  prefix: string;
  provider_id: string;
};

export type MaterialSortType = {
  orderBy: keyof Material;
  order: SortEnum;
};

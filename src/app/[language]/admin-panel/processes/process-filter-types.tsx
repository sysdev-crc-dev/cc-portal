import { SortEnum } from "@/services/api/types/sort-type";
import { Process } from "@/services/api/types/process";

export type ProcessFilterType = {
  id: string;
  name: string;
  type: string;
};

export type ProcessSortType = {
  orderBy: keyof Process;
  order: SortEnum;
};

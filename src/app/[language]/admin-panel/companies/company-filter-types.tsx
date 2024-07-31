import { SortEnum } from "@/services/api/types/sort-type";
import { Company } from "@/services/api/types/company";

export type CompanyFilterType = {
  name: string;
  type: string;
};

export type CompanySortType = {
  orderBy: keyof Company;
  order: SortEnum;
};

import { SortEnum } from "@/services/api/types/sort-type";
import { Project, ProjectStatus } from "@/services/api/types/project";

export type ProjectFilterType = {
  name: string;
  status: ProjectStatus | "";
  estimated_delivery_date: string;
  customer_id: string;
};

export type ProjectSortType = {
  orderBy: keyof Project;
  order: SortEnum;
};

import { SortEnum } from "@/services/api/types/sort-type";
import { Employee } from "@/services/api/types/employee";

export type EmployeeFilterType = {
  name: string;
  last_name: string;
  cell_phone: string;
};

export type EmployeeSortType = {
  orderBy: keyof Employee;
  order: SortEnum;
};

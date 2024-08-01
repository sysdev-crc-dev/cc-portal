import { SortEnum } from "@/services/api/types/sort-type";
import { Invoice } from "@/services/api/types/invoice";

export type InvoiceFilterType = {
  rfc: string;
};

export type InvoiceSortType = {
  orderBy: keyof Invoice;
  order: SortEnum;
};

import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { InvoiceFilterType } from "../../../app/[language]/admin-panel/invoices/invoice-filter-types";
import { Invoice } from "../types/invoice";

export type InvoicesRequest = {
  page: number;
  pageSize: number;
  filters?: Partial<InvoiceFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Invoice;
    order: SortEnum;
  }>;
};

export type InvoicesResponse = {
  data: InfinityPaginationType<Invoice>;
};

export function useGetInvoicesService() {
  const fetch = useFetch();

  return useCallback(
    (data: InvoicesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/invoices`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("pageSize", data.pageSize.toString());
      if (data.filters) {
        if (data.filters.rfc) {
          requestUrl.searchParams.append("rfc", `${data.filters.rfc}`);
        }
      }
      if (data.sort) {
        const sortString = data.sort
          .map((value) => `${value.order === "asc" ? "" : "!"}${value.orderBy}`)
          .join("");
        requestUrl.searchParams.append("sort", sortString);
      }

      return fetch(requestUrl, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InvoicesResponse>);
    },
    [fetch]
  );
}

export type InvoiceRequest = {
  id: Invoice["id"];
};

export type InvoiceResponse = {
  data: Invoice;
};

export function useGetInvoiceService() {
  const fetch = useFetch();

  return useCallback(
    (data: InvoiceRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/invoices/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InvoiceResponse>);
    },
    [fetch]
  );
}

export type InvoicePostRequest = Pick<
  Invoice,
  "name" | "rfc" | "postal_code" | "customer_id" | "email" | "invoice_use"
>;

export type InvoicePostResponse = Invoice;

export function usePostInvoiceService() {
  const fetch = useFetch();

  return useCallback(
    (data: InvoicePostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/invoices`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InvoicePostResponse>);
    },
    [fetch]
  );
}

export type InvoiceEditRequest = {
  id: Invoice["id"];
  data: Partial<
    Pick<
      Invoice,
      "name" | "rfc" | "postal_code" | "customer_id" | "email" | "invoice_use"
    >
  >;
};

export type InvoiceEditResponse = Invoice;

export function useEditInvoiceService() {
  const fetch = useFetch();

  return useCallback(
    (req: InvoiceEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/invoices/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InvoiceEditResponse>);
    },
    [fetch]
  );
}

// export type EmployeePatchRequest = {
//   id: Employee["id"];
//   data: {
//     password: string;
//   };
// };

// export type EmployeePatchResponse = Employee;

// export function usePatchUserService() {
//   const fetch = useFetch();

//   return useCallback(
//     (req: EmployeePatchRequest, requestConfig?: RequestConfigType) => {
//       return fetch(`${API_URL}/v1/users/${req.id}`, {
//         method: "PATCH",
//         body: JSON.stringify(req.data),
//         ...requestConfig,
//       }).then(wrapperFetchJsonResponse<UserResponse>);
//     },
//     [fetch]
//   );
// }

export type InvoiceDeleteRequest = {
  id: Invoice["id"];
};

export type InvoiceDeleteResponse = undefined;

export function useDeleteInvoiceService() {
  const fetch = useFetch();

  return useCallback(
    (req: InvoiceDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/invoices/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InvoiceDeleteResponse>);
    },
    [fetch]
  );
}

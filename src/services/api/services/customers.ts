import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Customer } from "../types/customer";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { CustomerFilterType } from "../../../app/[language]/admin-panel/customers/customer-filter-types";

export type CustomersRequest = {
  page: number;
  pageSize: number;
  filters?: Partial<CustomerFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Customer;
    order: SortEnum;
  }>;
};

export type CustomersResponse = {
  data: InfinityPaginationType<Customer>;
};

export function useGetCustomersService() {
  const fetch = useFetch();

  return useCallback(
    (data: CustomersRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/customers`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("pageSize", data.pageSize.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `${data.filters.name}`);
        }
        if (data.filters.last_name) {
          requestUrl.searchParams.append(
            "last_name",
            `${data.filters.last_name}`
          );
        }
        if (data.filters.cell_phone) {
          requestUrl.searchParams.append(
            "cell_phone",
            `${data.filters.cell_phone}`
          );
        }
        if (data.filters.email) {
          requestUrl.searchParams.append("email", `${data.filters.email}`);
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
      }).then(wrapperFetchJsonResponse<CustomersResponse>);
    },
    [fetch]
  );
}

export type CustomerRequest = {
  id: Customer["id"];
};

export type CustomerResponse = {
  data: Customer;
};

export function useGetCustomerService() {
  const fetch = useFetch();

  return useCallback(
    (data: CustomerRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customers/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerResponse>);
    },
    [fetch]
  );
}

export type CustomerPostRequest = Pick<
  Customer,
  | "name"
  | "cell_phone"
  | "company_id"
  | "last_name"
  | "email"
  | "tel"
  | "preferred_form_of_payment"
>;

export type CustomerPostResponse = Customer;

export function usePostCustomerService() {
  const fetch = useFetch();

  return useCallback(
    (data: CustomerPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customers`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerPostResponse>);
    },
    [fetch]
  );
}

export type CustomerEditRequest = {
  id: Customer["id"];
  data: Partial<
    Pick<
      Customer,
      | "name"
      | "cell_phone"
      | "company_id"
      | "last_name"
      | "email"
      | "tel"
      | "preferred_form_of_payment"
    >
  >;
};

export type CustomerEditResponse = Customer;

export function useEditCustomerService() {
  const fetch = useFetch();

  return useCallback(
    (req: CustomerEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customers/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomerEditResponse>);
    },
    [fetch]
  );
}

// export type CustomerPatchRequest = {
//   id: Customer["id"];
//   data: {
//     password: string;
//   };
// };

// export type CustomerPatchResponse = Customer;

// export function usePatchUserService() {
//   const fetch = useFetch();

//   return useCallback(
//     (req: CustomerPatchRequest, requestConfig?: RequestConfigType) => {
//       return fetch(`${API_URL}/v1/users/${req.id}`, {
//         method: "PATCH",
//         body: JSON.stringify(req.data),
//         ...requestConfig,
//       }).then(wrapperFetchJsonResponse<UserResponse>);
//     },
//     [fetch]
//   );
// }

export type CustomersDeleteRequest = {
  id: Customer["id"];
};

export type CustomersDeleteResponse = undefined;

export function useDeleteCustomerService() {
  const fetch = useFetch();

  return useCallback(
    (req: CustomersDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/customers/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CustomersDeleteResponse>);
    },
    [fetch]
  );
}

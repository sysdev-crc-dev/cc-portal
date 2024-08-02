import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { AddressFilterType } from "../../../app/[language]/admin-panel/addresses/address-filter-types";
import { Address } from "../types/address";

export type AddressesRequest = {
  page: number;
  limit: number;
  filters?: Partial<AddressFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Address;
    order: SortEnum;
  }>;
};

export type AddressesResponse = InfinityPaginationType<Address>;

export function useGetAddressesService() {
  const fetch = useFetch();

  return useCallback(
    (data: AddressesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/addresses`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.customer_id) {
          requestUrl.searchParams.append(
            "customer_id",
            `${data.filters.customer_id}`
          );
        }
        if (data.filters.provider_id) {
          requestUrl.searchParams.append(
            "provider_id",
            `${data.filters.provider_id}`
          );
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
      }).then(wrapperFetchJsonResponse<AddressesResponse>);
    },
    [fetch]
  );
}

export type AddressRequest = {
  id: Address["id"];
};

export type AddressResponse = {
  data: Address;
};

export function useGetAddressService() {
  const fetch = useFetch();

  return useCallback(
    (data: AddressRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/addresses/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AddressResponse>);
    },
    [fetch]
  );
}

export type AddressPostRequest = Pick<
  Address,
  | "street"
  | "neighborhood"
  | "no_ext"
  | "postal_code"
  | "no_int"
  | "state"
  | "town"
  | "extra_info"
  | "customer_id"
  | "provider_id"
>;

export type AddressPostResponse = Address;

export function usePostAddressService() {
  const fetch = useFetch();

  return useCallback(
    (data: AddressPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/addresses`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AddressPostResponse>);
    },
    [fetch]
  );
}

export type AddressEditRequest = {
  id: Address["id"];
  data: Partial<
    Pick<
      Address,
      | "street"
      | "neighborhood"
      | "no_ext"
      | "postal_code"
      | "no_int"
      | "state"
      | "town"
      | "extra_info"
      | "customer_id"
      | "provider_id"
    >
  >;
};

export type AddressEditResponse = Address;

export function useEditAddressService() {
  const fetch = useFetch();

  return useCallback(
    (req: AddressEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/addresses/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AddressEditResponse>);
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

export type AddressDeleteRequest = {
  id: Address["id"];
};

export type AddressDeleteResponse = undefined;

export function useDeleteAddressService() {
  const fetch = useFetch();

  return useCallback(
    (req: AddressDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/addresses/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<AddressDeleteResponse>);
    },
    [fetch]
  );
}

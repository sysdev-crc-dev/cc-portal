import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { SupplyFilterType } from "../../../app/[language]/admin-panel/supplies/supply-filter-types";
import { Supply } from "../types/supply";

export type SuppliesRequest = {
  page: number;
  limit: number;
  filters?: Partial<SupplyFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Supply;
    order: SortEnum;
  }>;
};

export type SuppliesResponse = InfinityPaginationType<Supply>;

export function useGetSuppliesService() {
  const fetch = useFetch();

  return useCallback(
    (data: SuppliesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/supplies`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
        }

        if (data.filters.id) {
          requestUrl.searchParams.append("id", `${data.filters.id}`);
        }

        if (data.filters.project_id) {
          requestUrl.searchParams.append(
            "project_id",
            `${data.filters.project_id}`
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
      }).then(wrapperFetchJsonResponse<SuppliesResponse>);
    },
    [fetch]
  );
}

export type SupplyRequest = {
  id: Supply["id"];
};

export type SupplyResponse = {
  data: Supply;
};

export function useGetSupplyService() {
  const fetch = useFetch();

  return useCallback(
    (data: SupplyRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/supplies/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SupplyResponse>);
    },
    [fetch]
  );
}

export type SupplyPostRequest = Pick<Supply, "name" | "stock">;

export type SupplyPostResponse = Supply;

export function usePostSupplyService() {
  const fetch = useFetch();

  return useCallback(
    (data: SupplyPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/supplies`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SupplyPostResponse>);
    },
    [fetch]
  );
}

export type SupplyEditRequest = {
  id: Supply["id"];
  data: Partial<Pick<Supply, "name" | "stock">>;
};

export type SupplyEditResponse = Supply;

export function useEditSupplyService() {
  const fetch = useFetch();

  return useCallback(
    (req: SupplyEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/supplies/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SupplyEditResponse>);
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

export type SupplyDeleteRequest = {
  id: Supply["id"];
};

export type SupplyDeleteResponse = undefined;

export function useDeleteSupplyService() {
  const fetch = useFetch();

  return useCallback(
    (req: SupplyDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/supplies/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<SupplyDeleteResponse>);
    },
    [fetch]
  );
}

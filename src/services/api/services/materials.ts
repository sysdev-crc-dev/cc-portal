import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { MaterialFilterType } from "../../../app/[language]/admin-panel/materials/material-filter-types";
import { Material } from "../types/material";

export type MaterialsRequest = {
  page: number;
  limit: number;
  filters?: Partial<MaterialFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Material;
    order: SortEnum;
  }>;
};

export type MaterialsResponse = InfinityPaginationType<Material>;

export function useGetMaterialsService() {
  const fetch = useFetch();

  return useCallback(
    (data: MaterialsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/materials`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
        }

        if (data.filters.id) {
          requestUrl.searchParams.append("id", `${data.filters.id}`);
        }

        if (data.filters.provider_id) {
          requestUrl.searchParams.append(
            "provider_id",
            `${data.filters.provider_id}`
          );
        }

        if (data.filters.project_id) {
          requestUrl.searchParams.append(
            "project_id",
            `${data.filters.project_id}`
          );
        }

        if (data.filters.prefix) {
          requestUrl.searchParams.append("prefix", `~${data.filters.prefix}`);
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
      }).then(wrapperFetchJsonResponse<MaterialsResponse>);
    },
    [fetch]
  );
}

export type MaterialRequest = {
  id: Material["id"];
};

export type MaterialResponse = {
  data: Material;
};

export function useGetMaterialService() {
  const fetch = useFetch();

  return useCallback(
    (data: MaterialRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/materials/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MaterialResponse>);
    },
    [fetch]
  );
}

export type MaterialPostRequest = Pick<
  Material,
  "name" | "prefix" | "stock" | "provider_id"
>;

export type MaterialPostResponse = Material;

export function usePostMaterialService() {
  const fetch = useFetch();

  return useCallback(
    (data: MaterialPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/materials`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MaterialPostResponse>);
    },
    [fetch]
  );
}

export type MaterialEditRequest = {
  id: Material["id"];
  data: Partial<Pick<Material, "name" | "prefix" | "stock" | "provider_id">>;
};

export type MaterialEditResponse = Material;

export function useEditMaterialService() {
  const fetch = useFetch();

  return useCallback(
    (req: MaterialEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/materials/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MaterialEditResponse>);
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

export type MaterialDeleteRequest = {
  id: Material["id"];
};

export type MaterialDeleteResponse = undefined;

export function useDeleteMaterialService() {
  const fetch = useFetch();

  return useCallback(
    (req: MaterialDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/materials/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MaterialDeleteResponse>);
    },
    [fetch]
  );
}

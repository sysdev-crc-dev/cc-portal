import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { ProcessFilterType } from "../../../app/[language]/admin-panel/processes/process-filter-types";
import { Process } from "../types/process";

export type ProcessesRequest = {
  page: number;
  limit: number;
  filters?: Partial<ProcessFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Process;
    order: SortEnum;
  }>;
};

export type ProcessesResponse = InfinityPaginationType<Process>;

export function useGetProcessesService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProcessesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/processes`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
        }

        if (data.filters.id) {
          requestUrl.searchParams.append("id", `${data.filters.id}`);
        }

        if (data.filters.type) {
          requestUrl.searchParams.append("type", `${data.filters.type}`);
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
      }).then(wrapperFetchJsonResponse<ProcessesResponse>);
    },
    [fetch]
  );
}

export type ProcessRequest = {
  id: Process["id"];
};

export type ProcessResponse = {
  data: Process;
};

export function useGetProcessService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProcessRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/processes/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProcessResponse>);
    },
    [fetch]
  );
}

export type ProcessPostRequest = Pick<Process, "name" | "file" | "type">;

export type ProcessPostResponse = Process;

export function usePostProcessService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProcessPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/processes`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProcessPostResponse>);
    },
    [fetch]
  );
}

export type ProcessEditRequest = {
  id: Process["id"];
  data: Partial<Pick<Process, "name" | "file" | "type">>;
};

export type ProcessEditResponse = Process;

export function useEditProcessService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProcessEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/processes/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProcessEditResponse>);
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

export type ProcessDeleteRequest = {
  id: Process["id"];
};

export type ProcessDeleteResponse = undefined;

export function useDeleteProcessService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProcessDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/processes/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProcessDeleteResponse>);
    },
    [fetch]
  );
}

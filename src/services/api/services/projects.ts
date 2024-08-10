import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { ProjectFilterType } from "../../../app/[language]/admin-panel/projects/project-filter-types";
import { Project } from "../types/project";

export type ProjectsRequest = {
  page: number;
  limit: number;
  filters?: Partial<ProjectFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Project;
    order: SortEnum;
  }>;
};

export type ProjectsResponse = InfinityPaginationType<Project>;

export function useGetProjectsService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProjectsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/projects`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
        }
        // if (data.filters.last_name) {
        //   requestUrl.searchParams.append(
        //     "last_name",
        //     `~${data.filters.last_name}`
        //   );
        // }
        // if (data.filters.cell_phone) {
        //   requestUrl.searchParams.append(
        //     "cell_phone",
        //     `~${data.filters.cell_phone}`
        //   );
        // }
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
      }).then(wrapperFetchJsonResponse<ProjectsResponse>);
    },
    [fetch]
  );
}

export type ProjectRequest = {
  id: Project["id"];
};

export type ProjectResponse = {
  data: Project;
};

export function useGetProjectService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProjectRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProjectResponse>);
    },
    [fetch]
  );
}

export type ProjectPostRequest = Pick<Project, "name" | "type" | "employees">;

export type ProjectPostResponse = Project;

export function usePostProjectService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProjectPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProjectPostResponse>);
    },
    [fetch]
  );
}

export type ProjectEditRequest = {
  id: Project["id"];
  data: Partial<Pick<Project, "name" | "type" | "employees">>;
};

export type ProjectEditResponse = Project;

export function useEditProjectService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProjectEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProjectEditResponse>);
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

export type ProjectDeleteRequest = {
  id: Project["id"];
};

export type ProjectDeleteResponse = undefined;

export function useDeleteProjectService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProjectDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProjectDeleteResponse>);
    },
    [fetch]
  );
}

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
  pageSize: number;
  filters?: Partial<ProjectFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Project;
    order: SortEnum;
  }>;
};

export type ProjectsResponse = {
  data: InfinityPaginationType<Project>;
};

export function useGetProjectsService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProjectsRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/projects`);

      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `${data.filters.name}`);
        }
        if (data.filters.status) {
          const arr = [data.filters.status];
          requestUrl.searchParams.append("status", JSON.stringify(arr));
        }
        if (data.filters.customer_id) {
          requestUrl.searchParams.append(
            "customer_id",
            `${data.filters.customer_id}`
          );
        }
        if (data.filters.estimated_delivery_date) {
          requestUrl.searchParams.append(
            "estimated_delivery_date",
            `${data.filters.estimated_delivery_date}`
          );
        }
      }
      if (data.sort) {
        const sortString = data.sort
          .map((value) => `${value.order === "asc" ? "" : "!"}${value.orderBy}`)
          .join("");
        requestUrl.searchParams.append("sort", sortString);
      }

      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("pageSize", data.pageSize.toString());

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

export type ProjectPostRequest = Pick<
  Project,
  | "name"
  | "file"
  | "customer_id"
  | "employee_in_charge_id"
  | "operator_id"
  | "est_cutting_time_in_hours"
  | "est_man_hours"
  | "estimated_delivery_date"
  | "est_dimensions"
  | "package_type"
  | "material_provided_by"
  | "delivery_type"
> & {
  materials: number[];
  supplies: number[];
  processes: number[];
};

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
  data: Partial<
    Pick<
      Project,
      | "name"
      | "file"
      | "customer_id"
      | "employee_in_charge_id"
      | "operator_id"
      | "est_cutting_time_in_hours"
      | "est_man_hours"
      | "est_dimensions"
      | "package_type"
      | "material_provided_by"
      | "delivery_type"
      | "estimated_delivery_date"
    > & {
      materials: number[];
      supplies: number[];
      processes: number[];
    }
  >;
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

export type StartedPatchRequest = {
  id: Project["id"];
};

export type StartedPatchResponse = Project;

export function useStartedPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: StartedPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/start`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<StartedPatchResponse>);
    },
    [fetch]
  );
}

export type ReadyForDeliveryPatchRequest = {
  id: Project["id"];
};

export type ReadyForDeliveryPatchResponse = Project;

export function useReadyForDeliveryPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: ReadyForDeliveryPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/ready-for-delivery`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ReadyForDeliveryPatchResponse>);
    },
    [fetch]
  );
}

export type CompletedPatchRequest = {
  id: Project["id"];
};

export type CompletedPatchResponse = Project;

export function useCompletedPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: CompletedPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/completed`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompletedPatchResponse>);
    },
    [fetch]
  );
}

export type ReadyForCuttingPatchRequest = {
  id: Project["id"];
  data: {
    cutting_note?: string;
  };
};

export type ReadyForCuttingPatchResponse = Project;

export function useReadyForCuttingPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: ReadyForCuttingPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/ready-for-cutting`, {
        method: "PATCH",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ReadyForCuttingPatchResponse>);
    },
    [fetch]
  );
}

export type ExternalDependencyPatchRequest = {
  id: Project["id"];
};

export type ExternalDependencyPatchResponse = Project;

export function useExternalDependencyPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (
      req: ExternalDependencyPatchRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/external-dependency`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ExternalDependencyPatchResponse>);
    },
    [fetch]
  );
}

export type CanceledPatchRequest = {
  id: Project["id"];
  data: {
    cancel_reason?: string;
  };
};

export type CanceledPatchResponse = Project;

export function useCanceledPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: CanceledPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CanceledPatchResponse>);
    },
    [fetch]
  );
}

export type MissingMaterialsPatchRequest = {
  id: Project["id"];
  data: {
    waiting_materials_note?: string;
  };
};

export type MissingMaterialsPatchResponse = Project;

export function useMissingMaterialsPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: MissingMaterialsPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/missing-material`, {
        method: "PATCH",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MissingMaterialsPatchResponse>);
    },
    [fetch]
  );
}

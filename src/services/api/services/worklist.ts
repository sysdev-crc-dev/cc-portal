import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { ProjectFilterType } from "../../../app/[language]/admin-panel/projects/project-filter-types";
import { Project, ProjectStatus } from "../types/project";

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
      requestUrl.searchParams.append(
        "status",
        JSON.stringify([
          ProjectStatus.ReadyForCutting,
          ProjectStatus.InProgress,
        ])
      );
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
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

export type InProgressPatchRequest = {
  id: Project["id"];
};

export type InProgressPatchResponse = Project;

export function useInProgressPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: InProgressPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/in-progress`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<InProgressPatchResponse>);
    },
    [fetch]
  );
}

export type QAPatchRequest = {
  id: Project["id"];
  data: {
    quality_assurance_note?: string;
  };
};

export type QAPatchResponse = Project;

export function useQAPatchRequest() {
  const fetch = useFetch();

  return useCallback(
    (req: QAPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/projects/${req.id}/qa`, {
        method: "PATCH",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<QAPatchResponse>);
    },
    [fetch]
  );
}

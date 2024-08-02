import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { ProviderFilterType } from "../../../app/[language]/admin-panel/providers/provider-filter-types";
import { Provider } from "../types/provider";

export type ProvidersRequest = {
  page: number;
  limit: number;
  filters?: Partial<ProviderFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Provider;
    order: SortEnum;
  }>;
};

export type ProvidersResponse = InfinityPaginationType<Provider>;

export function useGetProvidersService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProvidersRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/providers`);
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
      }).then(wrapperFetchJsonResponse<ProvidersResponse>);
    },
    [fetch]
  );
}

export type ProviderRequest = {
  id: Provider["id"];
};

export type ProviderResponse = {
  data: Provider;
};

export function useGetProviderService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProviderRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/providers/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProviderResponse>);
    },
    [fetch]
  );
}

export type ProviderPostRequest = Pick<Provider, "name" | "tag">;

export type ProviderPostResponse = Provider;

export function usePostProviderService() {
  const fetch = useFetch();

  return useCallback(
    (data: ProviderPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/providers`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProviderPostResponse>);
    },
    [fetch]
  );
}

export type ProviderEditRequest = {
  id: Provider["id"];
  data: Partial<Pick<Provider, "name" | "tag">>;
};

export type ProviderEditResponse = Provider;

export function useEditProviderService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProviderEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/providers/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProviderEditResponse>);
    },
    [fetch]
  );
}

export type ProviderDeleteRequest = {
  id: Provider["id"];
};

export type ProviderDeleteResponse = undefined;

export function useDeleteProviderService() {
  const fetch = useFetch();

  return useCallback(
    (req: ProviderDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/providers/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ProviderDeleteResponse>);
    },
    [fetch]
  );
}

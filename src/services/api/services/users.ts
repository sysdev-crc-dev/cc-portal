import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { User } from "../types/user";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";

export type UsersRequest = {
  page: number;
  limit: number;
  filters?: string | undefined;
  sort?: Array<{
    orderBy: keyof User;
    order: SortEnum;
  }>;
};

export type UsersResponse = InfinityPaginationType<User>;

export function useGetUsersService() {
  const fetch = useFetch();

  return useCallback(
    (data: UsersRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/users`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        requestUrl.searchParams.append("role", `$in${data.filters}`);
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
      }).then(wrapperFetchJsonResponse<UsersResponse>);
    },
    [fetch]
  );
}

export type UserRequest = {
  id: User["id"];
};

export type UserResponse = {
  data: User;
};

export function useGetUserService() {
  const fetch = useFetch();

  return useCallback(
    (data: UserRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserResponse>);
    },
    [fetch]
  );
}

export type UserPostRequest = Pick<User, "email" | "password" | "role"> & {
  password: string;
};

export type UserPostResponse = User;

export function usePostUserService() {
  const fetch = useFetch();

  return useCallback(
    (data: UserPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserPostResponse>);
    },
    [fetch]
  );
}

export type UserEditRequest = {
  id: User["id"];
  data: Partial<Pick<User, "email" | "role">>;
};

export type UserEditResponse = User;

export function useEditUserService() {
  const fetch = useFetch();

  return useCallback(
    (req: UserEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserResponse>);
    },
    [fetch]
  );
}

export type UserPatchRequest = {
  id: User["id"];
  data: {
    password: string;
  };
};

export type UserPatchResponse = User;

export function usePatchUserService() {
  const fetch = useFetch();

  return useCallback(
    (req: UserPatchRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users/${req.id}`, {
        method: "PATCH",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UserResponse>);
    },
    [fetch]
  );
}

export type UsersDeleteRequest = {
  id: User["id"];
};

export type UsersDeleteResponse = undefined;

export function useDeleteUsersService() {
  const fetch = useFetch();

  return useCallback(
    (req: UsersDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UsersDeleteResponse>);
    },
    [fetch]
  );
}

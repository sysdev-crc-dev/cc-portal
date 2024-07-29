import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Employee } from "../types/employee";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { EmployeeFilterType } from "../../../app/[language]/admin-panel/employees/employee-filter-types";

export type EmployeesRequest = {
  page: number;
  limit: number;
  filters?: Partial<EmployeeFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Employee;
    order: SortEnum;
  }>;
};

export type EmployeesResponse = InfinityPaginationType<Employee>;

export function useGetEmployeesService() {
  const fetch = useFetch();

  return useCallback(
    (data: EmployeesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/employees`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("limit", data.limit.toString());
      if (data.filters) {
        if (data.filters.name) {
          requestUrl.searchParams.append("name", `~${data.filters.name}`);
        }
        if (data.filters.last_name) {
          requestUrl.searchParams.append(
            "last_name",
            `~${data.filters.last_name}`
          );
        }
        if (data.filters.cell_phone) {
          requestUrl.searchParams.append(
            "cell_phone",
            `~${data.filters.cell_phone}`
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
      }).then(wrapperFetchJsonResponse<EmployeesResponse>);
    },
    [fetch]
  );
}

export type EmployeeRequest = {
  id: Employee["id"];
};

export type EmployeeResponse = {
  data: Employee;
};

export function useGetEmployeeService() {
  const fetch = useFetch();

  return useCallback(
    (data: EmployeeRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/employees/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EmployeeResponse>);
    },
    [fetch]
  );
}

export type EmployeePostRequest = Pick<
  Employee,
  "name" | "last_name" | "cell_phone" | "tel" | "user_id"
>;

export type EmployeePostResponse = Employee;

export function usePostEmployeeService() {
  const fetch = useFetch();

  return useCallback(
    (data: EmployeePostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/employees`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EmployeePostResponse>);
    },
    [fetch]
  );
}

export type EmployeeEditRequest = {
  id: Employee["id"];
  data: Partial<
    Pick<Employee, "name" | "last_name" | "cell_phone" | "tel" | "user_id">
  >;
};

export type EmployeeEditResponse = Employee;

export function useEditEmployeeService() {
  const fetch = useFetch();

  return useCallback(
    (req: EmployeeEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/employees/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EmployeeEditResponse>);
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

export type EmployeesDeleteRequest = {
  id: Employee["id"];
};

export type EmployeesDeleteResponse = undefined;

export function useDeleteEmployeeService() {
  const fetch = useFetch();

  return useCallback(
    (req: EmployeesDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/employees/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<EmployeesDeleteResponse>);
    },
    [fetch]
  );
}

import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { SortEnum } from "../types/sort-type";
import { RequestConfigType } from "./types/request-config";
import { CompanyFilterType } from "../../../app/[language]/admin-panel/companies/company-filter-types";
import { Company } from "../types/company";

export type CompaniesRequest = {
  page: number;
  pageSize: number;
  filters?: Partial<CompanyFilterType> | undefined;
  sort?: Array<{
    orderBy: keyof Company;
    order: SortEnum;
  }>;
};

export type CompaniesResponse = {
  data: InfinityPaginationType<Company>;
};

export function useGetCompaniesService() {
  const fetch = useFetch();

  return useCallback(
    (data: CompaniesRequest, requestConfig?: RequestConfigType) => {
      const requestUrl = new URL(`${API_URL}/v1/companies`);
      requestUrl.searchParams.append("page", data.page.toString());
      requestUrl.searchParams.append("pageSize", data.pageSize.toString());
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
      }).then(wrapperFetchJsonResponse<CompaniesResponse>);
    },
    [fetch]
  );
}

export type CompanyRequest = {
  id: Company["id"];
};

export type CompanyResponse = {
  data: Company;
};

export function useGetCompanyService() {
  const fetch = useFetch();

  return useCallback(
    (data: CompanyRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/companies/${data.id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompanyResponse>);
    },
    [fetch]
  );
}

export type CompanyPostRequest = Pick<Company, "name" | "type" | "customers">;

export type CompanyPostResponse = Company;

export function usePostCompanyService() {
  const fetch = useFetch();

  return useCallback(
    (data: CompanyPostRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/companies`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompanyPostResponse>);
    },
    [fetch]
  );
}

export type CompanyEditRequest = {
  id: Company["id"];
  data: Partial<Pick<Company, "name" | "type" | "customers">>;
};

export type CompanyEditResponse = Company;

export function useEditCompanyService() {
  const fetch = useFetch();

  return useCallback(
    (req: CompanyEditRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/companies/${req.id}`, {
        method: "PUT",
        body: JSON.stringify(req.data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompanyEditResponse>);
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

export type CompanyDeleteRequest = {
  id: Company["id"];
};

export type CompanyDeleteResponse = undefined;

export function useDeleteCompanyService() {
  const fetch = useFetch();

  return useCallback(
    (req: CompanyDeleteRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/companies/${req.id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<CompanyDeleteResponse>);
    },
    [fetch]
  );
}

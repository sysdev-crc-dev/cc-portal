import { useGetCompaniesService } from "@/services/api/services/companies";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CompanyFilterType, CompanySortType } from "../company-filter-types";

export const companiesQueryKeys = createQueryKeys(["companies"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<CompanyFilterType> | undefined;
        sort?: CompanySortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useCompanyListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<CompanyFilterType> | undefined;
  sort?: CompanySortType | undefined;
} = {}) => {
  const fetch = useGetCompaniesService();
  const query = useInfiniteQuery({
    queryKey: companiesQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { status, res } = await fetch(
        {
          page: pageParam,
          limit: 10,
          filters: filter,
          sort: sort ? [sort] : undefined,
        },
        {
          signal,
        }
      );

      if (status === HTTP_CODES_ENUM.OK) {
        return {
          data: res.data,
          //   nextPage: data.hasNextPage ? pageParam + 1 : undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage;
    },
    gcTime: 0,
  });

  return query;
};

import { useGetEmployeesService } from "@/services/api/services/employees";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EmployeeFilterType, EmployeeSortType } from "../employee-filter-types";

export const employeesQueryKeys = createQueryKeys(["employees"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<EmployeeFilterType> | undefined;
        sort?: EmployeeSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useEmployeeListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<EmployeeFilterType> | undefined;
  sort?: EmployeeSortType | undefined;
} = {}) => {
  const fetch = useGetEmployeesService();
  const query = useInfiniteQuery({
    queryKey: employeesQueryKeys.list().sub.by({ sort, filter }).key,
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

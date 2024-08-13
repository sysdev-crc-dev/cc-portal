import { useGetProcessesService } from "@/services/api/services/processes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProcessFilterType, ProcessSortType } from "../process-filter-types";

export const processesQueryKeys = createQueryKeys(["processes"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<ProcessFilterType> | undefined;
        sort?: ProcessSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useProcessListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<ProcessFilterType> | undefined;
  sort?: ProcessSortType | undefined;
} = {}) => {
  const fetch = useGetProcessesService();
  const query = useInfiniteQuery({
    queryKey: processesQueryKeys.list().sub.by({ sort, filter }).key,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { status, res } = await fetch(
        {
          page: pageParam,
          pageSize: 25,
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
          nextPage: res.data.hasNextPage ? pageParam + 1 : undefined,
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

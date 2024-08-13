import { useGetSuppliesService } from "@/services/api/services/supplies";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SupplyFilterType, SupplySortType } from "../supply-filter-types";

export const suppliesQueryKeys = createQueryKeys(["supplies"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<SupplyFilterType> | undefined;
        sort?: SupplySortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useSupplyListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<SupplyFilterType> | undefined;
  sort?: SupplySortType | undefined;
} = {}) => {
  const fetch = useGetSuppliesService();
  const query = useInfiniteQuery({
    queryKey: suppliesQueryKeys.list().sub.by({ sort, filter }).key,
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

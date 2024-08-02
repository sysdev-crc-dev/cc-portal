import { useGetProvidersService } from "@/services/api/services/providers";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProviderFilterType, ProviderSortType } from "../provider-filter-types";

export const providersQueryKeys = createQueryKeys(["providers"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<ProviderFilterType> | undefined;
        sort?: ProviderSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useProviderListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<ProviderFilterType> | undefined;
  sort?: ProviderSortType | undefined;
} = {}) => {
  const fetch = useGetProvidersService();
  const query = useInfiniteQuery({
    queryKey: providersQueryKeys.list().sub.by({ sort, filter }).key,
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

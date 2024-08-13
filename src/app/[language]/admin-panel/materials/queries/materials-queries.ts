import { useGetMaterialsService } from "@/services/api/services/materials";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MaterialFilterType, MaterialSortType } from "../material-filter-types";

export const materialsQueryKeys = createQueryKeys(["materials"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<MaterialFilterType> | undefined;
        sort?: MaterialSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useMaterialListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<MaterialFilterType> | undefined;
  sort?: MaterialSortType | undefined;
} = {}) => {
  const fetch = useGetMaterialsService();
  const query = useInfiniteQuery({
    queryKey: materialsQueryKeys.list().sub.by({ sort, filter }).key,
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

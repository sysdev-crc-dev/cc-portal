import { useGetAddressesService } from "@/services/api/services/addresses";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AddressFilterType, AddressSortType } from "../address-filter-types";

export const addressesQueryKeys = createQueryKeys(["addresses"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<AddressFilterType> | undefined;
        sort?: AddressSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useAddressListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<AddressFilterType> | undefined;
  sort?: AddressSortType | undefined;
} = {}) => {
  const fetch = useGetAddressesService();
  const query = useInfiniteQuery({
    queryKey: addressesQueryKeys.list().sub.by({ sort, filter }).key,
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

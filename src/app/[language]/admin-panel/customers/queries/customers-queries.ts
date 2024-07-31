import { useGetCustomersService } from "@/services/api/services/customers";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CustomerFilterType, CustomerSortType } from "../customer-filter-types";

export const customersQueryKeys = createQueryKeys(["customers"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<CustomerFilterType> | undefined;
        sort?: CustomerSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useCustomerListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<CustomerFilterType> | undefined;
  sort?: CustomerSortType | undefined;
} = {}) => {
  const fetch = useGetCustomersService();
  const query = useInfiniteQuery({
    queryKey: customersQueryKeys.list().sub.by({ sort, filter }).key,
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

import { useGetInvoicesService } from "@/services/api/services/invoices";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InvoiceFilterType, InvoiceSortType } from "../invoice-filter-types";

export const invoicesQueryKeys = createQueryKeys(["invoices"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<InvoiceFilterType> | undefined;
        sort?: InvoiceSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useInvoiceListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<InvoiceFilterType> | undefined;
  sort?: InvoiceSortType | undefined;
} = {}) => {
  const fetch = useGetInvoicesService();
  console.log(filter);
  const query = useInfiniteQuery({
    queryKey: invoicesQueryKeys.list().sub.by({ sort, filter }).key,
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

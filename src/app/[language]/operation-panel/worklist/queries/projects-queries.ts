import { useGetProjectsService } from "@/services/api/services/worklist";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectSortType } from "../../../admin-panel/projects/project-filter-types";

export const projectsQueryKeys = createQueryKeys(["projects"], {
  list: () => ({
    key: [],
    sub: {
      by: ({ sort }: { sort?: ProjectSortType | undefined }) => ({
        key: [sort],
      }),
    },
  }),
});

export const useProjectListQuery = ({
  sort,
}: {
  sort?: ProjectSortType | undefined;
} = {}) => {
  const fetch = useGetProjectsService();
  const query = useInfiniteQuery({
    queryKey: projectsQueryKeys.list().sub.by({ sort }).key,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { status, res } = await fetch(
        {
          page: pageParam,
          pageSize: 25,
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

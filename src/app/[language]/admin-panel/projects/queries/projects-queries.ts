import { useGetProjectsService } from "@/services/api/services/projects";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectFilterType, ProjectSortType } from "../project-filter-types";

export const projectsQueryKeys = createQueryKeys(["projects"], {
  list: () => ({
    key: [],
    sub: {
      by: ({
        sort,
        filter,
      }: {
        filter: Partial<ProjectFilterType> | undefined;
        sort?: ProjectSortType | undefined;
      }) => ({
        key: [sort, filter],
      }),
    },
  }),
});

export const useProjectListQuery = ({
  sort,
  filter,
}: {
  filter?: Partial<ProjectFilterType> | undefined;
  sort?: ProjectSortType | undefined;
} = {}) => {
  const fetch = useGetProjectsService();
  const query = useInfiniteQuery({
    queryKey: projectsQueryKeys.list().sub.by({ sort, filter }).key,
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

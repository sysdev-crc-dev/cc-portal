export type InfinityPaginationType<T> = {
  hasNextPage: boolean;
  items: T[];
  pages: number;
  total: number;
};

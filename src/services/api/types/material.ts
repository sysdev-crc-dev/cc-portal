import { Provider } from "./provider";

export type Material = {
  id: number;
  name: string;
  prefix: string;
  stock: number;
  provider_id: number;
  provider: Pick<Provider, "id" | "name">;
};

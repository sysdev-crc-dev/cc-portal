import { Material } from "./material";
import { Address } from "./address";

export type Provider = {
  id: number;
  name: string;
  tag: string;
  materials: Pick<Material, "id" | "name">[];
  address_id: number;
  address: Pick<Address, "id">;
};

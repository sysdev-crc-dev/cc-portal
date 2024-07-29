import { User } from "./user";

export type Employee = {
  id: number;
  name: string;
  last_name: string;
  tel: string;
  cell_phone: string;
  user_id: number;
  user?: Pick<User, "id" | "email">;
};

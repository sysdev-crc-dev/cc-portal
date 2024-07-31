import { Address } from "./address";
import { Company } from "./company";

export enum PreferredFormOfPayment {
  Cash = "cash",
  BankTransfer = "bank_transfer",
  CreditCar = "credit_car",
  PaymentLink = "payment_link",
  InHouseCredit = "in_house_credit",
}

export type Customer = {
  id: number;
  name: string;
  last_name: string;
  tel: string;
  cell_phone: string;
  email: string;
  preferred_form_of_payment: PreferredFormOfPayment;
  company_id: number;
  addresses: Pick<Address, "id">[];
  company?: Pick<Company, "id" | "name">;
};

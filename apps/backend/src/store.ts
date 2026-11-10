import type { MerchantOnboardingInput } from "./types.js";

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Reservation {
  id: string;
  businessId: string;
  customerId: string;
  productId: string;
  quantity: number;
  status: "requested" | "awaiting_confirmation" | "confirmed" | "cancelled";
}

const merchants: Array<MerchantOnboardingInput & { id: string }> = [];
const products: Product[] = [];
const reservations: Reservation[] = [];

export const db = {
  merchants,
  products,
  reservations
};

export type AppView = "intro" | "login" | "onboarding" | "merchant" | "customer";

export interface UserSession {
  role: "merchant" | "customer";
  userId: string;
  name: string;
  phone: string;
  storeName?: string;
  category?: string;
  location?: string;
  token?: string;
}

export interface ProductItem {
  id: string;
  businessId: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  availability?: string;
  storeName?: string;
  distance?: string;
}

export interface ReservationItem {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  status: "awaiting_confirmation" | "confirmed" | "cancelled";
  createdAt: string;
}

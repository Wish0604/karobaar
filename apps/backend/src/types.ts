export type UserRole = "customer" | "merchant" | "admin";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MerchantOnboardingInput {
  legalEntity: "individual" | "partnership" | "llp" | "private_limited" | "other";
  operatingModel: "home_based" | "physical_storefront" | "online_only" | "service_based";
  businessCategory: string;
  displayName: string;
  city: string;
}

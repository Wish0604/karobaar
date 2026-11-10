export type ReservationStatus =
  | "requested"
  | "awaiting_confirmation"
  | "confirmed"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled"
  | "expired";

export type MerchantActionPolicy =
  | "immediate"
  | "validate_and_confirm"
  | "merchant_approval"
  | "secure_authorization";

export interface ToolRegistryItem {
  name:
    | "get_merchant_sales"
    | "get_inventory"
    | "update_inventory"
    | "search_nearby_products"
    | "compare_prices"
    | "create_reservation"
    | "create_order"
    | "generate_offer";
  policy: MerchantActionPolicy;
}

export const DEFAULT_TOOL_REGISTRY: ToolRegistryItem[] = [
  { name: "get_merchant_sales", policy: "immediate" },
  { name: "get_inventory", policy: "immediate" },
  { name: "update_inventory", policy: "validate_and_confirm" },
  { name: "search_nearby_products", policy: "immediate" },
  { name: "compare_prices", policy: "immediate" },
  { name: "create_reservation", policy: "validate_and_confirm" },
  { name: "create_order", policy: "secure_authorization" },
  { name: "generate_offer", policy: "merchant_approval" }
];

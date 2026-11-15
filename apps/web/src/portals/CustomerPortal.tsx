import React, { useState } from "react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:4000";
import "./CustomerPortal.css";
import { Icon } from "../components/icons";
import { AIMascot, type MascotState } from "../components/AIMascot";
import type { UserSession } from "../types";

export interface CustomerPortalProps {
  session: UserSession;
  onLogout: () => void;
  onReplayIntro: () => void;
  onSwitchToMerchant?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CustomerTab = "home" | "map" | "ai" | "orders" | "profile";

export interface MerchantStore {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  hours: string;
  address: string;
  deliveryTime: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  icon: string;
  posX: number; // Percentage on visual map (0-100)
  posY: number; // Percentage on visual map (0-100)
  popularProducts: string[];
}

export interface CustomerProduct {
  id: string;
  businessId?: string;
  storeId: string;
  storeName: string;
  distance: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  discountPct: number;
  quantity: number;
  availability: string;
  icon: string;
  unit: string;
}

export interface CartItem {
  product: CustomerProduct;
  qty: number;
}

export interface CustomerOrder {
  id: string;
  storeId: string;
  storeName: string;
  items: { name: string; qty: number; price: number; icon: string }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  orderDate: string;
  deliveryAddress: string;
  deliveryType: "delivery" | "pickup";
  paymentMethod: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL LOCAL COMMERCE DATA (Bengaluru Neighborhood Ecosystem)
// ─────────────────────────────────────────────────────────────────────────────

const NEARBY_MERCHANTS: MerchantStore[] = [
  {
    id: "biz_1",
    name: "Rajesh Kirana & Store",
    category: "Grocery & Staples",
    distance: "350m away",
    rating: 4.8,
    reviewCount: 124,
    isOpen: true,
    hours: "8:00 AM – 10:00 PM",
    address: "Shop 4, 12th Main, Indiranagar, Bengaluru",
    deliveryTime: "15–25 mins",
    deliveryFee: 30,
    freeDeliveryThreshold: 499,
    icon: "🏪",
    posX: 46,
    posY: 38,
    popularProducts: ["Aashirvaad Atta", "Tata Salt", "Fortune Oil", "Maggi Noodles"],
  },
  {
    id: "biz_2",
    name: "Sri Krishna Dairy & Bakery",
    category: "Dairy & Bakery",
    distance: "500m away",
    rating: 4.9,
    reviewCount: 210,
    isOpen: true,
    hours: "6:30 AM – 9:30 PM",
    address: "88, 100ft Road, Indiranagar, Bengaluru",
    deliveryTime: "10–20 mins",
    deliveryFee: 20,
    freeDeliveryThreshold: 299,
    icon: "🥛",
    posX: 64,
    posY: 30,
    popularProducts: ["Amul Milk 500ml", "Fresh Paneer", "Whole Wheat Bread"],
  },
  {
    id: "biz_3",
    name: "Gupta Supermarket",
    category: "Supermarket & FMCG",
    distance: "800m away",
    rating: 4.5,
    reviewCount: 88,
    isOpen: true,
    hours: "9:00 AM – 10:30 PM",
    address: "HAL 2nd Stage, Indiranagar, Bengaluru",
    deliveryTime: "25–35 mins",
    deliveryFee: 40,
    freeDeliveryThreshold: 699,
    icon: "🏬",
    posX: 70,
    posY: 60,
    popularProducts: ["Basmati Rice 5kg", "Surf Excel", "Good Day Biscuits"],
  },
  {
    id: "biz_4",
    name: "Balaji Traders & Spices",
    category: "Grains & Spices",
    distance: "1.1km away",
    rating: 4.3,
    reviewCount: 45,
    isOpen: true,
    hours: "9:30 AM – 8:30 PM",
    address: "Old Airport Road, Bengaluru",
    deliveryTime: "30–40 mins",
    deliveryFee: 35,
    freeDeliveryThreshold: 599,
    icon: "🌾",
    posX: 32,
    posY: 65,
    popularProducts: ["Toor Dal Premium", "Gemini Sunflower Oil", "Kashmiri Chilli"],
  },
  {
    id: "biz_5",
    name: "Apollo Local Care Pharmacy",
    category: "Pharmacy & Wellness",
    distance: "650m away",
    rating: 4.7,
    reviewCount: 156,
    isOpen: true,
    hours: "Open 24 Hours",
    address: "Defence Colony, Indiranagar, Bengaluru",
    deliveryTime: "15–20 mins",
    deliveryFee: 25,
    freeDeliveryThreshold: 399,
    icon: "💊",
    posX: 36,
    posY: 24,
    popularProducts: ["Dolo 650", "Dettol Antiseptic", "Electral ORS"],
  },
];

const LOCAL_PRODUCTS_CATALOG: CustomerProduct[] = [
  {
    id: "cp_1",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    distance: "350m",
    name: "Tata Salt Vacuum Evaporated",
    category: "Grocery",
    price: 28,
    mrp: 30,
    discountPct: 7,
    quantity: 48,
    availability: "In Stock",
    icon: "🧂",
    unit: "1 kg",
  },
  {
    id: "cp_2",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    distance: "350m",
    name: "Aashirvaad Shudh Chakki Atta",
    category: "Flour",
    price: 275,
    mrp: 295,
    discountPct: 7,
    quantity: 6,
    availability: "Only 6 Left",
    icon: "🌾",
    unit: "5 kg",
  },
  {
    id: "cp_3",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    distance: "350m",
    name: "Fortune Sunlite Refined Sunflower Oil",
    category: "Edible Oil",
    price: 145,
    mrp: 160,
    discountPct: 9,
    quantity: 32,
    availability: "In Stock",
    icon: "🌻",
    unit: "1 L",
  },
  {
    id: "cp_4",
    storeId: "biz_2",
    storeName: "Sri Krishna Dairy & Bakery",
    distance: "500m",
    name: "Amul Taaza Homogenised Toned Milk",
    category: "Dairy",
    price: 28,
    mrp: 28,
    discountPct: 0,
    quantity: 40,
    availability: "Fresh Morning Batch",
    icon: "🥛",
    unit: "500 ml",
  },
  {
    id: "cp_5",
    storeId: "biz_2",
    storeName: "Sri Krishna Dairy & Bakery",
    distance: "500m",
    name: "Malai Fresh Paneer Vacuum Pack",
    category: "Dairy",
    price: 110,
    mrp: 120,
    discountPct: 8,
    quantity: 15,
    availability: "In Stock",
    icon: "🧀",
    unit: "200 g",
  },
  {
    id: "cp_6",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    distance: "350m",
    name: "Maggi 2-Minute Masala Instant Noodles",
    category: "Snacks",
    price: 14,
    mrp: 14,
    discountPct: 0,
    quantity: 60,
    availability: "In Stock",
    icon: "🍜",
    unit: "70 g",
  },
  {
    id: "cp_7",
    storeId: "biz_3",
    storeName: "Gupta Supermarket",
    distance: "800m",
    name: "India Gate Basmati Rice Feast",
    category: "Staples",
    price: 499,
    mrp: 540,
    discountPct: 8,
    quantity: 18,
    availability: "In Stock",
    icon: "🍚",
    unit: "5 kg",
  },
  {
    id: "cp_8",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    distance: "350m",
    name: "Rozana Basmati Premium Daily Rice",
    category: "Staples",
    price: 480,
    mrp: 520,
    discountPct: 8,
    quantity: 9,
    availability: "In Stock",
    icon: "🍚",
    unit: "5 kg",
  },
  {
    id: "cp_9",
    storeId: "biz_4",
    storeName: "Balaji Traders & Spices",
    distance: "1.1km",
    name: "Gemini Pure Sunflower Edible Oil",
    category: "Edible Oil",
    price: 142,
    mrp: 155,
    discountPct: 8,
    quantity: 25,
    availability: "In Stock",
    icon: "🌻",
    unit: "1 L",
  },
  {
    id: "cp_10",
    storeId: "biz_5",
    storeName: "Apollo Local Care Pharmacy",
    distance: "650m",
    name: "Dettol Antiseptic Liquid Disinfectant",
    category: "Pharmacy",
    price: 85,
    mrp: 92,
    discountPct: 8,
    quantity: 30,
    availability: "In Stock",
    icon: "🧴",
    unit: "250 ml",
  },
];

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "KB-ORD-90214",
    storeId: "biz_1",
    storeName: "Rajesh Kirana & Store",
    items: [
      { name: "Tata Salt Vacuum Evaporated (1kg)", qty: 2, price: 28, icon: "🧂" },
      { name: "Aashirvaad Chakki Atta (5kg)", qty: 1, price: 275, icon: "🌾" },
    ],
    subtotal: 331,
    deliveryFee: 30,
    discount: 30,
    total: 331,
    status: "out_for_delivery",
    orderDate: "Today, 12:15 PM",
    deliveryAddress: "Flat 402, Royal Palms, Indiranagar, Bengaluru",
    deliveryType: "delivery",
    paymentMethod: "Paytm UPI (Paid)",
  },
  {
    id: "KB-ORD-88120",
    storeId: "biz_2",
    storeName: "Sri Krishna Dairy & Bakery",
    items: [
      { name: "Amul Taaza Milk (500ml)", qty: 2, price: 28, icon: "🥛" },
      { name: "Malai Fresh Paneer (200g)", qty: 1, price: 110, icon: "🧀" },
    ],
    subtotal: 166,
    deliveryFee: 0,
    discount: 0,
    total: 166,
    status: "delivered",
    orderDate: "Yesterday, 8:30 AM",
    deliveryAddress: "Storefront Pickup",
    deliveryType: "pickup",
    paymentMethod: "Cash on Counter",
  },
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  session,
  onLogout,
  onReplayIntro,
  onSwitchToMerchant,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<CustomerTab>("home");

  // Location State
  const [currentLocation, setCurrentLocation] = useState(
    session.location || "Indiranagar, Bengaluru"
  );
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Map Filter States
  const [mapRadius, setMapRadius] = useState<"1km" | "2km" | "5km">("2km");
  const [mapCategory, setMapCategory] = useState<string>("All");
  const [selectedStore, setSelectedStore] = useState<MerchantStore | null>(NEARBY_MERCHANTS[0]);
  const [activeStorefront, setActiveStorefront] = useState<MerchantStore | null>(null);

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: LOCAL_PRODUCTS_CATALOG[0], qty: 1 },
  ]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDeliveryType, setCheckoutDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [checkoutAddress, setCheckoutAddress] = useState(
    "Flat 402, Royal Palms, 12th Main, Indiranagar, Bengaluru"
  );
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Paytm UPI");
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [trackingOrder, setTrackingOrder] = useState<CustomerOrder | null>(null);

  // Product Details Modal
  const [selectedProduct, setSelectedProduct] = useState<CustomerProduct | null>(null);

  // AI Assistant State
  const [isAiListening, setIsAiListening] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<MascotState>("idle");
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Namaste! I'm your KAROBAAR Local Shopping Assistant. Speak or ask: 'Find grocery shops near me', 'Compare Basmati rice prices', or 'Order milk from Krishna Dairy'.",
    },
  ]);
  const [aiInputText, setAiInputText] = useState("");

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3200);
  };

  // Cart operations
  const addToCart = (product: CustomerProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, qty: newQty } : i))
      );
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + i.product.price * i.qty, 0);

  // Group items by merchant (Multi-merchant cart rule)
  const cartGroupedByStore = cartItems.reduce((acc, item) => {
    const storeId = item.product.storeId;
    if (!acc[storeId]) {
      acc[storeId] = {
        storeName: item.product.storeName,
        distance: item.product.distance,
        items: [],
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string; distance: string; items: CartItem[] }>);

  // Handle Checkout & Order Placement
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const newPlacedOrders: CustomerOrder[] = Object.entries(cartGroupedByStore).map(
      ([storeId, group], idx) => {
        const sub = group.items.reduce((s, it) => s + it.product.price * it.qty, 0);
        const fee = checkoutDeliveryType === "delivery" ? 30 : 0;
        return {
          id: `KB-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          storeId,
          storeName: group.storeName,
          items: group.items.map((it) => ({
            name: it.product.name,
            qty: it.qty,
            price: it.product.price,
            icon: it.product.icon,
          })),
          subtotal: sub,
          deliveryFee: fee,
          discount: idx === 0 ? discountApplied : 0,
          total: sub + fee - (idx === 0 ? discountApplied : 0),
          status: "placed",
          orderDate: "Just now",
          deliveryAddress: checkoutDeliveryType === "delivery" ? checkoutAddress : "Storefront Counter Pickup",
          deliveryType: checkoutDeliveryType,
          paymentMethod: `${selectedPaymentMethod} (Verified)`,
        };
      }
    );

    setOrders((prev) => [...newPlacedOrders, ...prev]);
    setCartItems([]);
    setShowCheckoutModal(false);
    setShowCartDrawer(false);
    setTrackingOrder(newPlacedOrders[0]);
    showToast("🎉 Order placed successfully with local merchants!");
  };

  // AI Assistant Chat
  const handleSendAiMessage = async (queryText?: string) => {
    const q = (queryText || aiInputText).trim();
    if (!q) return;

    setAiInputText("");
    setMascotEmotion("thinking");
    setAiChatMessages((prev) => [...prev, { sender: "user", text: q }]);
    try {
      const response = await fetch(`${API_ORIGIN}/api/v1/ai/assistant/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "customer", message: q, language: "en" }),
      });
      const body = await response.json();
      if (!response.ok || !body?.success) throw new Error(body?.error?.message || "Assistant request failed");
      setAiChatMessages((prev) => [...prev, { sender: "ai", text: body.data.response }]);
      setMascotEmotion("speaking");
    } catch {
      setAiChatMessages((prev) => [...prev, { sender: "ai", text: "I could not reach the assistant right now. Please try again in a moment." }]);
      setMascotEmotion("idle");
    }
    window.setTimeout(() => setMascotEmotion("idle"), 2500);
  };

  const handleToggleVoiceMic = () => {
    if (!isAiListening) {
      setIsAiListening(true);
      setMascotEmotion("listening");
      showToast("🎙️ Listening... Speak your shopping request in Hindi or English");
      window.setTimeout(() => {
        setIsAiListening(false);
        handleSendAiMessage("Mere aas paas grocery shops aur rice prices dikhao");
      }, 3500);
    } else {
      setIsAiListening(false);
      setMascotEmotion("idle");
    }
  };

  // Filtered Products
  const filteredProducts = LOCAL_PRODUCTS_CATALOG.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="customer-portal-root">
      {/* ─────────────────────────────────────────────────────────────
         TOP NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="cp-navbar">
        <div className="cp-navbar-container">
          {/* Logo & Location */}
          <div className="cp-brand-location">
            <div className="cp-logo-badge" onClick={() => setActiveTab("home")}>
              <div className="cp-logo-icon">K</div>
              <div className="cp-logo-text">
                <span className="cp-logo-title">कारोबार</span>
                <span className="cp-logo-tagline">Local Commerce</span>
              </div>
            </div>

            <div
              className="cp-location-pill"
              onClick={() => setShowLocationModal(true)}
              title="Change Delivery Location"
            >
              <Icon name="pin" size={13} strokeWidth={1.8} />
              <span>{currentLocation}</span>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>▼</span>
            </div>
          </div>

          {/* Search Bar with Voice Mic */}
          <div className="cp-search-box">
            <span className="cp-search-lens">
              <Icon name="search" size={15} strokeWidth={1.8} />
            </span>
            <input
              type="text"
              className="cp-search-input"
              placeholder="Search products, groceries or nearby shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="cp-search-mic-btn"
              onClick={() => {
                setActiveTab("ai");
                handleToggleVoiceMic();
              }}
              title="Voice Search"
            >
              <Icon name="mic" size={15} strokeWidth={2} />
            </button>
          </div>

          {/* Desktop Nav Tabs & Cart */}
          <div className="cp-nav-actions">
            <nav className="cp-desktop-nav-tabs">
              <button
                type="button"
                className={`cp-tab-link ${activeTab === "home" ? "active" : ""}`}
                onClick={() => setActiveTab("home")}
              >
                Home
              </button>
              <button
                type="button"
                className={`cp-tab-link ${activeTab === "map" ? "active" : ""}`}
                onClick={() => setActiveTab("map")}
              >
                <Icon name="pin" size={14} strokeWidth={1.8} /> Nearby Shops
              </button>
              <button
                type="button"
                className={`cp-tab-link ${activeTab === "ai" ? "active" : ""}`}
                onClick={() => setActiveTab("ai")}
              >
                <Icon name="sparkle" size={14} strokeWidth={1.8} /> AI Assistant
              </button>
              <button
                type="button"
                className={`cp-tab-link ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <Icon name="bag" size={14} strokeWidth={1.8} /> My Orders
              </button>
              <button
                type="button"
                className={`cp-tab-link ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <Icon name="user" size={14} strokeWidth={1.8} /> Profile
              </button>
            </nav>

            {/* Cart Trigger */}
            <button
              type="button"
              className="cp-cart-btn"
              onClick={() => setShowCartDrawer(true)}
            >
              <Icon name="cart" size={15} strokeWidth={1.8} />
              <span>₹{totalCartPrice}</span>
              {totalCartCount > 0 && (
                <span className="cp-cart-count">{totalCartCount}</span>
              )}
            </button>

            {/* Merchant Switch Shortcut */}
            {onSwitchToMerchant && (
              <button
                type="button"
                className="mp-btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700 }}
                onClick={onSwitchToMerchant}
                title="Switch to Merchant Cockpit"
              >
                <Icon name="store" size={13} strokeWidth={1.8} /> Merchant Mode
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         MAIN CONTENT AREA
         ───────────────────────────────────────────────────────────── */}
      <main className="cp-main-content">
        {/* =========================================================
           01. HOME DASHBOARD MODULE
           ========================================================= */}
        {activeTab === "home" && (
          <div>
            {/* Hero Banner */}
            <div className="cp-hero-banner">
              <div className="cp-hero-content">
                <span className="cp-hero-badge">
                  <Icon name="zap" size={12} strokeWidth={2} /> Hyperlocal Neighborhood Delivery
                </span>
                <h1 className="cp-hero-title">
                  Shop From Your Local Dukaan, Delivered in 15 Mins.
                </h1>
                <p className="cp-hero-subtitle">
                  Compare prices, find fresh essentials, and support physical businesses around {currentLocation.split(",")[0]}.
                </p>
                <div className="cp-hero-actions">
                  <button
                    type="button"
                    className="mp-btn-primary"
                    style={{ padding: "12px 22px", fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("map")}
                  >
                    <Icon name="pin" size={15} strokeWidth={2} /> Explore Nearby Shops Map →
                  </button>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    style={{ padding: "12px 18px", fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("ai")}
                  >
                    <Icon name="mic" size={15} strokeWidth={2} /> Shop with Voice AI
                  </button>
                </div>
              </div>
              <div className="cp-hero-illustration">
                <AIMascot state="hover" size={110} />
              </div>
            </div>

            {/* Categories Scroll */}
            <div className="cp-section-header">
              <span className="cp-section-title">Explore Categories</span>
              <button
                type="button"
                className="cp-section-link"
                onClick={() => setSelectedCategory("All")}
              >
                View All
              </button>
            </div>

            <div className="cp-categories-scroll">
              {[
                { label: "All Items", icon: "✨", cat: "All" },
                { label: "Grocery & Staples", icon: "🌾", cat: "Grocery" },
                { label: "Dairy & Milk", icon: "🥛", cat: "Dairy" },
                { label: "Edible Oils", icon: "🌻", cat: "Edible Oil" },
                { label: "Flour & Atta", icon: "🥖", cat: "Flour" },
                { label: "Snacks & Maggi", icon: "🍜", cat: "Snacks" },
                { label: "Daily Essentials", icon: "🧂", cat: "Staples" },
                { label: "Pharmacy Care", icon: "💊", cat: "Pharmacy" },
              ].map((c) => (
                <div
                  key={c.cat}
                  className={`cp-cat-card ${selectedCategory === c.cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(c.cat)}
                >
                  <span className="cp-cat-icon">{c.icon}</span>
                  <span className="cp-cat-label">{c.label}</span>
                </div>
              ))}
            </div>

            {/* Map Preview Teaser Card */}
            <div className="cp-map-teaser-card">
              <div className="cp-map-teaser-header">
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>
                    <Icon name="pin" size={14} strokeWidth={2} /> 5 Local Shops Open Near You
                  </strong>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Verified physical stores within 1.5 km of {currentLocation}
                  </div>
                </div>
                <button
                  type="button"
                  className="mp-btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.84rem" }}
                  onClick={() => setActiveTab("map")}
                >
                  Open Full Map Discovery ➔
                </button>
              </div>

              <div
                className="cp-map-canvas-preview"
                onClick={() => setActiveTab("map")}
              >
                <div className="cp-vector-map" style={{ pointerEvents: "none" }}>
                  <div className="map-road-h" />
                  <div className="map-road-v" />
                  <div className="map-park-zone">🌳 Indiranagar Park</div>

                  {/* User Pin */}
                  <div className="map-user-pin">
                    <div className="user-pulse-dot" />
                    <span className="user-pin-label">You</span>
                  </div>

                  {/* Merchant Pins */}
                  {NEARBY_MERCHANTS.map((m) => (
                    <div
                      key={m.id}
                      className="map-merchant-pin"
                      style={{ left: `${m.posX}%`, top: `${m.posY}%` }}
                    >
                      <div className="pin-bubble">
                        <span>{m.icon}</span>
                        <span>{m.name.split(" ")[0]} ({m.distance})</span>
                      </div>
                      <div className="pin-arrow" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Local Products */}
            <div className="cp-section-header">
              <span className="cp-section-title">
                Popular Essentials in {currentLocation.split(",")[0]}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                {filteredProducts.length} items available now
              </span>
            </div>

            <div className="cp-products-grid">
              {filteredProducts.map((p) => (
                <div key={p.id} className="cp-product-card">
                  <div>
                    <div
                      className="cp-prod-image-box"
                      onClick={() => setSelectedProduct(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{p.icon}</span>
                      {p.discountPct > 0 && (
                        <span className="cp-prod-discount-badge">{p.discountPct}% OFF</span>
                      )}
                    </div>

                    <div
                      className="cp-prod-store-badge"
                      onClick={() => {
                        const store = NEARBY_MERCHANTS.find((m) => m.id === p.storeId);
                        if (store) setActiveStorefront(store);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <Icon name="store" size={11} strokeWidth={1.8} /> {p.storeName} ({p.distance})
                    </div>

                    <h3
                      className="cp-prod-title"
                      onClick={() => setSelectedProduct(p)}
                      style={{ cursor: "pointer" }}
                    >
                      {p.name} ({p.unit})
                    </h3>

                    <div className="cp-prod-price-row">
                      <span className="cp-prod-price">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <span className="cp-prod-mrp">₹{p.mrp}</span>
                      )}
                    </div>
                  </div>

                  <div className="cp-prod-actions">
                    <button
                      type="button"
                      className="mp-btn-primary"
                      style={{ flex: 1, padding: "8px 12px", fontSize: "0.84rem" }}
                      onClick={() => addToCart(p)}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
           02. NEARBY SHOPS & INTERACTIVE MAP MODULE (Core USP)
           ========================================================= */}
        {activeTab === "map" && (
          <div>
            <div className="cp-section-header" style={{ marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>
                  Neighborhood Shops & Discovery Map
                </h1>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                  Real physical merchants located around {currentLocation}. Click any shop pin to explore.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className={`map-pill ${mapRadius === "1km" ? "active" : ""}`}
                  onClick={() => setMapRadius("1km")}
                >
                  Within 1 km
                </button>
                <button
                  type="button"
                  className={`map-pill ${mapRadius === "2km" ? "active" : ""}`}
                  onClick={() => setMapRadius("2km")}
                >
                  Within 2 km
                </button>
                <button
                  type="button"
                  className={`map-pill ${mapRadius === "5km" ? "active" : ""}`}
                  onClick={() => setMapRadius("5km")}
                >
                  Within 5 km
                </button>
              </div>
            </div>

            <div className="cp-map-module-layout">
              {/* Interactive Vector Map Viewport */}
              <div className="cp-map-viewport">
                <div className="cp-vector-map">
                  {/* Floating Filter Pills */}
                  <div className="map-floating-controls">
                    <div className="map-filter-pills">
                      {["All", "Grocery", "Dairy", "Pharmacy"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`map-pill ${mapCategory === cat ? "active" : ""}`}
                          onClick={() => setMapCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="mp-btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "0.82rem", pointerEvents: "auto", background: "#ffffff" }}
                      onClick={() => showToast("Re-centering on your GPS location...")}
                    >
                      🎯 My Location
                    </button>
                  </div>

                  {/* Roads & Landmarks */}
                  <div className="map-road-h" />
                  <div className="map-road-v" />
                  <div className="map-park-zone">🌳 100ft Road Park</div>

                  {/* Customer Marker */}
                  <div className="map-user-pin">
                    <div className="user-pulse-dot" />
                    <span className="user-pin-label">📍 You ({currentLocation.split(",")[0]})</span>
                  </div>

                  {/* Merchant Pins */}
                  {NEARBY_MERCHANTS.map((m) => {
                    const isSelected = selectedStore?.id === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`map-merchant-pin ${isSelected ? "active" : ""}`}
                        style={{ left: `${m.posX}%`, top: `${m.posY}%` }}
                        onClick={() => setSelectedStore(m)}
                      >
                        <div className="pin-bubble">
                          <span>{m.icon}</span>
                          <span>{m.name}</span>
                          <span style={{ color: "#d97706" }}>★{m.rating}</span>
                        </div>
                        <div className="pin-arrow" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Shop Details & List */}
              <div className="cp-map-sidebar">
                <div className="cp-map-sidebar-header">
                  <strong style={{ fontSize: "1rem" }}>
                    Nearby Local Stores ({NEARBY_MERCHANTS.length})
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 700 }}>
                    ● All Open Now
                  </span>
                </div>

                <div className="cp-map-shops-list">
                  {selectedStore && (
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: "#fefce8",
                        border: "2px solid #facc15",
                        borderRadius: 14,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.72rem", background: "#000", color: "#facc15", padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>
                          Selected on Map
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0284c7" }}>
                          {selectedStore.distance}
                        </span>
                      </div>

                      <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 800 }}>
                        {selectedStore.name}
                      </h3>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "#475569" }}>
                        {selectedStore.address}
                      </p>

                      <div style={{ display: "flex", gap: 12, fontSize: "0.78rem", marginBottom: 12 }}>
                        <span>⭐ <strong>{selectedStore.rating}</strong> ({selectedStore.reviewCount} reviews)</span>
                        <span>⚡ <strong>{selectedStore.deliveryTime}</strong> delivery</span>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="mp-btn-primary"
                          style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem" }}
                          onClick={() => setActiveStorefront(selectedStore)}
                        >
                          <Icon name="store" size={13} strokeWidth={1.8} /> View Storefront & Catalogue →
                        </button>
                      </div>
                    </div>
                  )}

                  {NEARBY_MERCHANTS.map((store) => (
                    <div
                      key={store.id}
                      className={`cp-shop-list-card ${selectedStore?.id === store.id ? "selected" : ""}`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="cp-shop-card-top">
                        <span className="cp-shop-name">{store.name}</span>
                        <span className="cp-shop-distance">{store.distance}</span>
                      </div>

                      <div className="cp-shop-meta-row">
                        <span>⭐ {store.rating} ({store.reviewCount})</span>
                        <span>•</span>
                        <span>{store.category}</span>
                        <span>•</span>
                        <span style={{ color: "#10b981" }}>Open Now</span>
                      </div>

                      <div className="cp-shop-products-preview">
                        <strong>Top items:</strong> {store.popularProducts.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
           03. AI ASSISTANT SIGNATURE MODULE
           ========================================================= */}
        {activeTab === "ai" && (
          <div className="cp-ai-container">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <AIMascot state={mascotEmotion} size={110} />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "0 0 6px 0" }}>
              KAROBAAR Shopping Copilot
            </h1>
            <p style={{ color: "#64748b", margin: "0 0 20px 0", fontSize: "0.92rem" }}>
              Ask in Hindi or English to discover neighborhood stores, compare prices, or add items to cart.
            </p>

            {/* Conversation Thread */}
            <div className="cp-ai-chat-thread">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`cp-ai-bubble ${msg.sender === "user" ? "user" : "ai"}`}
                >
                  <strong>{msg.sender === "user" ? "You: " : "🤖 Karobaar AI: "}</strong>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Big Microphone Button */}
            <button
              type="button"
              className={`cp-ai-voice-btn ${isAiListening ? "listening" : ""}`}
              onClick={handleToggleVoiceMic}
              title="Click to speak"
            >
              <Icon name="mic" size={26} strokeWidth={2} />
            </button>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 20 }}>
              {isAiListening ? "Listening... Boliye!" : "Tap microphone to speak"}
            </div>

            {/* Text Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              style={{ display: "flex", gap: 10, marginBottom: 20 }}
            >
              <input
                type="text"
                placeholder="e.g. Find 5kg rice under ₹500 near me..."
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "1.5px solid #cbd5e1",
                  fontSize: "0.92rem",
                }}
              />
              <button
                type="submit"
                className="mp-btn-primary"
                style={{ padding: "0 22px", borderRadius: 999 }}
              >
                Send
              </button>
            </form>

            {/* Suggested Prompts */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {[
                "Mere aas paas grocery shops dikhao",
                "Find 5kg basmati rice under 500",
                "Compare sunflower oil prices nearby",
                "Mera order kab aayega?",
                "Krishna Dairy se doodh order karo",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="mp-btn-secondary"
                  style={{ borderRadius: 999, fontSize: "0.78rem", padding: "6px 14px" }}
                  onClick={() => handleSendAiMessage(suggestion)}
                >
                  ✦ {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
           04. MY ORDERS MODULE
           ========================================================= */}
        {activeTab === "orders" && (
          <div>
            <div className="cp-section-header">
              <div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>
                  My Purchases & Order Tracking
                </h1>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                  Live status updates from your neighborhood merchants
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div
                className="mp-card"
                style={{ textAlign: "center", padding: "48px 24px" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛍️</div>
                <h3 style={{ margin: "0 0 6px 0" }}>No purchases yet</h3>
                <p style={{ color: "#64748b", marginBottom: 18 }}>
                  Support your neighborhood dukaan and order local essentials today!
                </p>
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => setActiveTab("home")}
                >
                  Start Shopping Local →
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="cp-order-card">
                  <div className="cp-order-header">
                    <div>
                      <strong style={{ fontSize: "1.05rem" }}>Order {ord.id}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        🏪 {ord.storeName} • {ord.orderDate}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="mp-badge success" style={{ textTransform: "uppercase" }}>
                        {ord.status.replace("_", " ")}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>
                        ₹{ord.total}
                      </div>
                    </div>
                  </div>

                  {/* Order Tracking Stepper */}
                  <div className="cp-order-stepper">
                    {[
                      { key: "placed", label: "Placed" },
                      { key: "confirmed", label: "Confirmed" },
                      { key: "preparing", label: "Packed" },
                      { key: "out_for_delivery", label: "Out for Delivery" },
                      { key: "delivered", label: "Delivered" },
                    ].map((step, idx) => {
                      const stages = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
                      const currentIdx = stages.indexOf(ord.status);
                      const isDone = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      return (
                        <div
                          key={step.key}
                          className={`cp-step-item ${isDone ? "done" : ""} ${isCurrent ? "active" : ""}`}
                        >
                          <div className="cp-step-dot">{isDone ? "✓" : idx + 1}</div>
                          <span className="cp-step-name">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items Summary */}
                  <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10, margin: "14px 0", fontSize: "0.84rem" }}>
                    {ord.items.map((it, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span>{it.icon} {it.name} × {it.qty}</span>
                        <strong>₹{it.price * it.qty}</strong>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 6, display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <span>Payment: {ord.paymentMethod} • Mode: {ord.deliveryType.toUpperCase()}</span>
                      <span>Delivery: ₹{ord.deliveryFee}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="mp-btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      onClick={() => setTrackingOrder(ord)}
                    >
                      Track Live Delivery ➔
                    </button>
                    <button
                      type="button"
                      className="mp-btn-primary"
                      style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      onClick={() => {
                        ord.items.forEach((item) => {
                          const prod = LOCAL_PRODUCTS_CATALOG.find((p) => p.name.includes(item.name));
                          if (prod) addToCart(prod);
                        });
                        showToast(`Re-added items from ${ord.storeName} to cart!`);
                      }}
                    >
                      🔄 Reorder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================================
           05. MY PROFILE & SETTINGS MODULE
           ========================================================= */}
        {activeTab === "profile" && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div className="cp-section-header">
              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>
                My Customer Account
              </h1>
            </div>

            <div className="mp-card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fde047", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 900 }}>
                  {session.name ? session.name[0] : "P"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{session.name || "Priya Sharma"}</h3>
                  <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                    {session.phone || "+91 9123456780"} • Verified Local Shopper
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                  <small style={{ color: "#64748b" }}>Primary Delivery Address</small>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", marginTop: 2 }}>
                    Flat 402, Royal Palms, Indiranagar, Bengaluru
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10 }}>
                  <small style={{ color: "#64748b" }}>Payment Preferences</small>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", marginTop: 2 }}>
                    Paytm UPI (Auto-verified)
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Action Tiles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                className="shop-nav-tile"
                onClick={() => setShowLocationModal(true)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="tile-icon-box">📍</div>
                  <div>
                    <strong>Saved Delivery Addresses</strong>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Manage Home, Office and Other locations</div>
                  </div>
                </div>
                <span>→</span>
              </div>

              <div
                className="shop-nav-tile"
                onClick={() => showToast("Language preference: Hindi (हिंदी) & English active")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="tile-icon-box">🌐</div>
                  <div>
                    <strong>Language & Voice Preferences</strong>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>English, Hindi (हिंदी), Marathi (मराठी)</div>
                  </div>
                </div>
                <span>→</span>
              </div>

              <div
                className="shop-nav-tile"
                onClick={() => showToast("Help & Support Helpline: 1800-KAROBAAR (toll-free)")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="tile-icon-box">💬</div>
                  <div>
                    <strong>Help & Customer Support</strong>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>24/7 Local commerce assistance & refunds</div>
                  </div>
                </div>
                <span>→</span>
              </div>

              {onSwitchToMerchant && (
                <div
                  className="shop-nav-tile"
                  style={{ backgroundColor: "#fef9c3", borderColor: "#facc15" }}
                  onClick={onSwitchToMerchant}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="tile-icon-box" style={{ background: "#facc15" }}>🏪</div>
                    <div>
                      <strong style={{ color: "#854d0e" }}>Switch to Merchant Cockpit</strong>
                      <div style={{ fontSize: "0.78rem", color: "#a16207" }}>Manage store orders, products & payments</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800 }}>→</span>
                </div>
              )}

              <div
                className="shop-nav-tile"
                onClick={onReplayIntro}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="tile-icon-box">🎬</div>
                  <div>
                    <strong>Replay Intro Story</strong>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Watch Karobaar launch video film</div>
                  </div>
                </div>
                <span>→</span>
              </div>

              <div
                className="shop-nav-tile"
                style={{ borderColor: "#fecaca" }}
                onClick={onLogout}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="tile-icon-box" style={{ background: "#fee2e2", color: "#dc2626" }}>🚪</div>
                  <div>
                    <strong style={{ color: "#dc2626" }}>Logout</strong>
                    <div style={{ fontSize: "0.78rem", color: "#ef4444" }}>Sign out of Karobaar Customer Portal</div>
                  </div>
                </div>
                <span>→</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
         PERSISTENT FLOATING AI MASCOT BUTTON
         ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        className="cp-floating-ai-mascot"
        onClick={() => {
          if (activeTab !== "ai") {
            setActiveTab("ai");
          }
          handleToggleVoiceMic();
        }}
        title="Tap to speak with KAROBAAR Shopping Copilot"
      >
        <AIMascot state={mascotEmotion} size={48} headOnly={true} />
      </button>

      {/* ─────────────────────────────────────────────────────────────
         MOBILE BOTTOM NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <nav className="cp-mobile-nav">
        <button
          type="button"
          className={`cp-mobile-btn ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <Icon name="store" size={18} strokeWidth={1.8} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`cp-mobile-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <Icon name="pin" size={18} strokeWidth={1.8} />
          <span>Nearby</span>
        </button>

        <button
          type="button"
          className="cp-mobile-center-ai"
          onClick={() => {
            setActiveTab("ai");
            handleToggleVoiceMic();
          }}
          title="KAROBAAR AI"
        >
          <AIMascot state={mascotEmotion} size={36} headOnly={true} />
        </button>

        <button
          type="button"
          className={`cp-mobile-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <Icon name="bag" size={18} strokeWidth={1.8} />
          <span>Orders</span>
        </button>

        <button
          type="button"
          className={`cp-mobile-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <Icon name="user" size={18} strokeWidth={1.8} />
          <span>Profile</span>
        </button>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 1: MERCHANT STOREFRONT MODAL / VIEW
         ───────────────────────────────────────────────────────────── */}
      {activeStorefront && (
        <div className="cp-modal-backdrop" onClick={() => setActiveStorefront(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="cp-modal-header" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2rem" }}>{activeStorefront.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900 }}>
                    {activeStorefront.name}
                  </h3>
                  <small style={{ color: "#64748b" }}>
                    ⭐ {activeStorefront.rating} ({activeStorefront.reviewCount} reviews) • {activeStorefront.distance}
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setActiveStorefront(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body" style={{ padding: "16px 20px" }}>
              {/* Storefront Info Card */}
              <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 6 }}>
                  <span>📍 {activeStorefront.address}</span>
                  <strong style={{ color: "#10b981" }}>● Open ({activeStorefront.hours})</strong>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                  ⚡ Delivery: <strong>{activeStorefront.deliveryTime}</strong> (₹{activeStorefront.deliveryFee} fee, Free above ₹{activeStorefront.freeDeliveryThreshold})
                </div>
              </div>

              {/* Products in this Store */}
              <strong style={{ fontSize: "0.95rem", display: "block", marginBottom: 12 }}>
                Products Available at {activeStorefront.name}
              </strong>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LOCAL_PRODUCTS_CATALOG.filter((p) => p.storeId === activeStorefront.id).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: "1.8rem" }}>{p.icon}</span>
                      <div>
                        <strong style={{ fontSize: "0.9rem", display: "block" }}>{p.name}</strong>
                        <small style={{ color: "#64748b" }}>{p.unit} • {p.availability}</small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "1rem" }}>₹{p.price}</div>
                      <button
                        type="button"
                        className="mp-btn-primary"
                        style={{ padding: "4px 10px", fontSize: "0.76rem", marginTop: 4 }}
                        onClick={() => addToCart(p)}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setActiveStorefront(null)}
              >
                Close Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 2: PRODUCT DETAILS MODAL
         ───────────────────────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="cp-modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="cp-modal-header">
              <h3 className="mp-modal-title">Product Details</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setSelectedProduct(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body">
              <div style={{ height: 160, background: "#f8fafc", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", marginBottom: 16 }}>
                {selectedProduct.icon}
              </div>

              <div style={{ fontSize: "0.82rem", color: "#0284c7", fontWeight: 700, marginBottom: 4 }}>
                Sold by: 🏪 {selectedProduct.storeName} ({selectedProduct.distance})
              </div>

              <h2 style={{ fontSize: "1.25rem", fontWeight: 900, margin: "0 0 8px 0" }}>
                {selectedProduct.name}
              </h2>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "1.6rem", fontWeight: 900 }}>₹{selectedProduct.price}</span>
                {selectedProduct.mrp > selectedProduct.price && (
                  <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>₹{selectedProduct.mrp}</span>
                )}
                {selectedProduct.discountPct > 0 && (
                  <span className="mp-badge success">{selectedProduct.discountPct}% OFF</span>
                )}
              </div>

              <div style={{ padding: "10px 14px", background: "#f1f5f9", borderRadius: 10, fontSize: "0.84rem", marginBottom: 16 }}>
                <strong>Stock Status:</strong> {selectedProduct.availability} ({selectedProduct.quantity} units available)<br />
                <strong>Pack Size:</strong> {selectedProduct.unit}
              </div>

              <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                100% Genuine product sourced directly from your verified neighborhood merchant. Eligible for 15-min instant doorstep delivery or self-pickup.
              </p>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="mp-btn-primary"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                + Add to Cart (₹{selectedProduct.price})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 3: CART DRAWER & CONSOLIDATED MULTI-MERCHANT CHECKOUT
         ───────────────────────────────────────────────────────────── */}
      {showCartDrawer && (
        <div className="cp-modal-backdrop" onClick={() => setShowCartDrawer(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="cp-modal-header">
              <div>
                <h3 className="mp-modal-title">Shopping Cart ({totalCartCount} items)</h3>
                <small style={{ color: "#64748b" }}>Consolidated multi-merchant local checkout</small>
              </div>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowCartDrawer(false)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body">
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 8 }}>🛒</div>
                  <strong>Your cart is empty</strong>
                  <p style={{ color: "#64748b", fontSize: "0.84rem" }}>Add items from local stores to start checkout.</p>
                </div>
              ) : (
                <div>
                  {/* Grouped by Merchant */}
                  {Object.entries(cartGroupedByStore).map(([sId, grp]) => {
                    const groupSubtotal = grp.items.reduce(
                      (s, it) => s + it.product.price * it.qty,
                      0
                    );
                    return (
                      <div
                        key={sId}
                        style={{
                          border: "1.5px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 16,
                          background: "#ffffff",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: "1px dashed #e2e8f0" }}>
                          <div>
                            <strong style={{ fontSize: "0.92rem" }}>🏪 {grp.storeName}</strong>
                            <div style={{ fontSize: "0.74rem", color: "#0284c7" }}>{grp.distance}</div>
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>
                            Subtotal: ₹{groupSubtotal}
                          </span>
                        </div>

                        {grp.items.map((it) => (
                          <div
                            key={it.product.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: "1.3rem" }}>{it.product.icon}</span>
                              <div>
                                <strong style={{ fontSize: "0.86rem", display: "block" }}>{it.product.name}</strong>
                                <small style={{ color: "#64748b" }}>₹{it.product.price} / unit</small>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button
                                type="button"
                                style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}
                                onClick={() => updateCartQty(it.product.id, it.qty - 1)}
                              >
                                -
                              </button>
                              <strong style={{ minWidth: 16, textAlign: "center" }}>{it.qty}</strong>
                              <button
                                type="button"
                                style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}
                                onClick={() => updateCartQty(it.product.id, it.qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.88rem" }}>
                      <span>Items Total:</span>
                      <strong>₹{totalCartPrice}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.88rem" }}>
                      <span>Estimated Delivery Fee:</span>
                      <strong style={{ color: "#10b981" }}>₹30 (Free above ₹499)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 900, borderTop: "1.5px solid #e2e8f0", paddingTop: 8 }}>
                      <span>To Pay:</span>
                      <span>₹{totalCartPrice + (totalCartPrice >= 499 ? 0 : 30)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setShowCartDrawer(false)}
              >
                Continue Shopping
              </button>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => {
                    setShowCartDrawer(false);
                    setShowCheckoutModal(true);
                  }}
                >
                  Proceed to Checkout →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 4: CHECKOUT & PAYMENT INTEGRATION (Paytm Gateway)
         ───────────────────────────────────────────────────────────── */}
      {showCheckoutModal && (
        <div className="cp-modal-backdrop" onClick={() => setShowCheckoutModal(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="cp-modal-header">
              <h3 className="mp-modal-title">Complete Your Local Order</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowCheckoutModal(false)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body">
              {/* Delivery vs Pickup Toggle */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  className={`mp-btn-${checkoutDeliveryType === "delivery" ? "primary" : "secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setCheckoutDeliveryType("delivery")}
                >
                  <Icon name="truck" size={14} strokeWidth={1.8} /> Doorstep Delivery (15-25 min)
                </button>
                <button
                  type="button"
                  className={`mp-btn-${checkoutDeliveryType === "pickup" ? "primary" : "secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setCheckoutDeliveryType("pickup")}
                >
                  <Icon name="store" size={14} strokeWidth={1.8} /> Self Pickup at Dukaan
                </button>
              </div>

              {/* Address input */}
              {checkoutDeliveryType === "delivery" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              )}

              {/* Promo Coupon */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. DAILY10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", textTransform: "uppercase" }}
                />
                <button
                  type="button"
                  className="mp-btn-secondary"
                  onClick={() => {
                    if (couponCode.toUpperCase() === "DAILY10" || couponCode.toUpperCase() === "WEEKEND50") {
                      setDiscountApplied(30);
                      showToast("Coupon applied! ₹30 saved.");
                    } else {
                      showToast("Invalid promo code");
                    }
                  }}
                >
                  Apply
                </button>
              </div>

              {/* Payment Method Selector */}
              <strong style={{ fontSize: "0.88rem", display: "block", marginBottom: 8 }}>
                Select Payment Method
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  { name: "Paytm UPI", icon: "📱", badge: "Instant • Fast" },
                  { name: "Google Pay / PhonePe UPI", icon: "⚡", badge: "Zero Fee" },
                  { name: "Credit / Debit Card", icon: "💳", badge: "All Banks" },
                  { name: "Cash on Delivery / Pickup", icon: "💵", badge: "Pay at counter" },
                ].map((pm) => (
                  <div
                    key={pm.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${selectedPaymentMethod === pm.name ? "#000" : "#e2e8f0"}`,
                      background: selectedPaymentMethod === pm.name ? "#fef9c3" : "#fff",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedPaymentMethod(pm.name)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span>{pm.icon}</span>
                      <strong>{pm.name}</strong>
                    </div>
                    <span className="mp-badge info">{pm.badge}</span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Item Subtotal:</span>
                  <strong>₹{totalCartPrice}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Delivery Charge:</span>
                  <strong>{checkoutDeliveryType === "delivery" ? "₹30" : "FREE (Pickup)"}</strong>
                </div>
                {discountApplied > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#10b981" }}>
                    <span>Coupon Discount:</span>
                    <strong>- ₹{discountApplied}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 900, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                  <span>Grand Total:</span>
                  <span>
                    ₹{totalCartPrice + (checkoutDeliveryType === "delivery" ? 30 : 0) - discountApplied}
                  </span>
                </div>
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setShowCheckoutModal(false)}
              >
                Back to Cart
              </button>
              <button
                type="button"
                className="mp-btn-primary"
                onClick={handlePlaceOrder}
              >
                Pay & Confirm Order (₹{totalCartPrice + (checkoutDeliveryType === "delivery" ? 30 : 0) - discountApplied}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 5: ORDER TRACKING MODAL (Live Stepper & Digital Receipt)
         ───────────────────────────────────────────────────────────── */}
      {trackingOrder && (
        <div className="cp-modal-backdrop" onClick={() => setTrackingOrder(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="cp-modal-header">
              <div>
                <h3 className="mp-modal-title">Live Tracking {trackingOrder.id}</h3>
                <small style={{ color: "#64748b" }}>🏪 {trackingOrder.storeName}</small>
              </div>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setTrackingOrder(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body">
              {/* Stepper */}
              <div className="cp-order-stepper">
                {[
                  { key: "placed", label: "Placed" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "preparing", label: "Packed" },
                  { key: "out_for_delivery", label: "On The Way" },
                  { key: "delivered", label: "Delivered" },
                ].map((st, idx) => {
                  const stages = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
                  const cur = stages.indexOf(trackingOrder.status);
                  const isDone = cur >= idx;
                  const isCur = cur === idx;
                  return (
                    <div key={st.key} className={`cp-step-item ${isDone ? "done" : ""} ${isCur ? "active" : ""}`}>
                      <div className="cp-step-dot">{isDone ? "✓" : idx + 1}</div>
                      <span className="cp-step-name">{st.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", padding: "16px 0", background: "#fef9c3", borderRadius: 12, marginBottom: 16 }}>
                <span style={{ fontSize: "2rem" }}>🛵</span>
                <h4 style={{ margin: "4px 0", fontWeight: 800 }}>Delivery Hero Assigned!</h4>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#854d0e" }}>
                  Estimated Arrival: <strong>12-18 mins</strong> at {trackingOrder.deliveryAddress}
                </p>
              </div>

              {/* Items summary */}
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, fontSize: "0.84rem" }}>
                <strong>Ordered Products:</strong>
                {trackingOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span>{it.icon} {it.name} × {it.qty}</span>
                    <strong>₹{it.price * it.qty}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="cp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => {
                  window.print();
                  showToast("Digital receipt ready for download!");
                }}
              >
                <Icon name="receipt" size={14} strokeWidth={1.8} /> Digital Receipt
              </button>
              <button
                type="button"
                className="mp-btn-primary"
                onClick={() => setTrackingOrder(null)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODAL 6: LOCATION SELECTOR MODAL
         ───────────────────────────────────────────────────────────── */}
      {showLocationModal && (
        <div className="cp-modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="cp-modal-header">
              <h3 className="mp-modal-title">Select Delivery Neighborhood</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowLocationModal(false)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="cp-modal-body">
              <p style={{ color: "#64748b", fontSize: "0.86rem", marginTop: 0 }}>
                Choose your local area to find nearby physical stores and calculate accurate 15-minute delivery times.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Indiranagar, Bengaluru",
                  "HAL 2nd Stage, Bengaluru",
                  "Defence Colony, Bengaluru",
                  "Koramangala 4th Block, Bengaluru",
                  "Domlur Layout, Bengaluru",
                ].map((loc) => (
                  <div
                    key={loc}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${currentLocation === loc ? "#000" : "#e2e8f0"}`,
                      background: currentLocation === loc ? "#fef9c3" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      setCurrentLocation(loc);
                      setShowLocationModal(false);
                      showToast(`Delivery location set to ${loc}`);
                    }}
                  >
                    <span>📍 {loc}</span>
                    {currentLocation === loc && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         GLOBAL TOAST FEEDBACK
         ───────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="mp-toast-container">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;

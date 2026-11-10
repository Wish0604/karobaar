import React, { useState } from "react";
import type { UserSession, ProductItem } from "../types";

interface CustomerPortalProps {
  session: UserSession;
  onLogout: () => void;
  onReplayIntro: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

interface LocalStoreListing extends ProductItem {
  storeName: string;
  distance: string;
  rating: number;
}

const NEIGHBORHOOD_CATALOG: LocalStoreListing[] = [
  {
    id: "c_prd_1",
    businessId: "biz_1",
    name: "Basmati Rice 5kg Premium",
    category: "Staples",
    price: 480,
    quantity: 24,
    availability: "In Stock",
    storeName: "Rajesh Kirana & Store",
    distance: "350m away",
    rating: 4.8,
  },
  {
    id: "c_prd_2",
    businessId: "biz_2",
    name: "India Gate Basmati Rice 5kg Feast",
    category: "Staples",
    price: 510,
    quantity: 12,
    availability: "In Stock",
    storeName: "Gupta Supermarket",
    distance: "800m away",
    rating: 4.5,
  },
  {
    id: "c_prd_3",
    businessId: "biz_1",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    category: "Edible Oil",
    price: 145,
    quantity: 40,
    availability: "In Stock",
    storeName: "Rajesh Kirana & Store",
    distance: "350m away",
    rating: 4.8,
  },
  {
    id: "c_prd_4",
    businessId: "biz_3",
    name: "Gemini Pure Sunflower Oil 1L",
    category: "Edible Oil",
    price: 142,
    quantity: 8,
    availability: "In Stock",
    storeName: "Balaji Traders",
    distance: "1.1km away",
    rating: 4.3,
  },
  {
    id: "c_prd_5",
    businessId: "biz_1",
    name: "Madhur Pure & Hygienic Sugar 1kg",
    category: "Essentials",
    price: 46,
    quantity: 3,
    availability: "Only 3 Left",
    storeName: "Rajesh Kirana & Store",
    distance: "350m away",
    rating: 4.8,
  },
  {
    id: "c_prd_6",
    businessId: "biz_1",
    name: "Aashirvaad Shudh Chakki Atta 10kg",
    category: "Flour",
    price: 425,
    quantity: 18,
    availability: "In Stock",
    storeName: "Rajesh Kirana & Store",
    distance: "350m away",
    rating: 4.8,
  },
  {
    id: "c_prd_7",
    businessId: "biz_2",
    name: "Fortune Chakki Fresh Atta 10kg",
    category: "Flour",
    price: 399,
    quantity: 15,
    availability: "In Stock",
    storeName: "Gupta Supermarket",
    distance: "800m away",
    rating: 4.5,
  },
  {
    id: "c_prd_8",
    businessId: "biz_1",
    name: "Tata Salt Vacuum Evaporated 1kg",
    category: "Essentials",
    price: 28,
    quantity: 55,
    availability: "In Stock",
    storeName: "Rajesh Kirana & Store",
    distance: "350m away",
    rating: 4.8,
  },
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  session,
  onLogout,
  onReplayIntro,
}) => {
  const [searchQuery, setSearchQuery] = useState("rice");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<Array<{ product: LocalStoreListing; qty: number }>>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Voice AI Assistant State
  const [aiQuery, setAiQuery] = useState("Find 5kg basmati rice under 500 near me");
  const [aiAnswer, setAiAnswer] = useState(
    "Found 2 nearby stores with Basmati Rice 5kg: Rajesh Kirana (350m away) has it at ₹480 (In Stock). Gupta Supermarket (800m away) has it at ₹510. Rajesh Kirana offers the best price and fastest pickup!"
  );
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filterCategories = ["All", "Staples", "Edible Oil", "Flour", "Essentials"];

  const handleAskAssistant = async (queryText?: string) => {
    const q = queryText || aiQuery;
    setIsAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/assistant/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          message: q,
          language: "en",
        }),
      });
      const data = await res.json();
      if (data?.data?.response) {
        setAiAnswer(data.data.response);
      } else {
        generateLocalCustomerAi(q);
      }
    } catch {
      generateLocalCustomerAi(q);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateLocalCustomerAi = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes("rice")) {
      setAiAnswer(
        "🍚 Best Match: Rajesh Kirana (350m away) has 'Basmati Rice 5kg Premium' at ₹480 (₹30 cheaper than Gupta Supermarket). 24 units in stock for instant pickup or 20-min delivery."
      );
    } else if (lower.includes("oil")) {
      setAiAnswer(
        "🌻 Edible Oil Comparison: Rajesh Kirana offers 'Fortune Sunlite 1L' for ₹145 (350m away). Balaji Traders has 'Gemini Oil 1L' for ₹142 (1.1km away)."
      );
    } else if (lower.includes("sugar")) {
      setAiAnswer(
        "⚠️ Alert: Rajesh Kirana has 'Madhur Sugar 1kg' at ₹46, but only 3 packs are left in stock! Reserve now to avoid missing out."
      );
    } else {
      setAiAnswer(
        `🛍️ Customer Copilot: Searching neighborhood stores around ${session.location || "Indiranagar"} for "${q}". Found relevant matches nearby with verified stock.`
      );
    }
  };

  const filteredProducts = NEIGHBORHOOD_CATALOG.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: LocalStoreListing) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setShowCartDrawer(true);
  };

  const handleReserveItem = (product: LocalStoreListing) => {
    alert(`✅ Reservation confirmed at ${product.storeName}!\n1 unit of "${product.name}" held for you. Pickup anytime today.`);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    const orderId = `ORD-PAYTM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderSuccess(orderId);
    setCartItems([]);
  };

  return (
    <div className="portal-container customer-theme">
      {/* Top Customer Navbar */}
      <nav className="portal-navbar customer-nav">
        <div className="portal-nav-content">
          <div className="portal-brand-group">
            <span className="portal-badge customer-badge">Customer Portal</span>
            <div>
              <h2 className="portal-store-name">Karobaar Hyperlocal</h2>
              <span className="portal-store-meta">
                📍 {session.location || "Indiranagar, Bengaluru"} • Welcome, <strong>{session.name}</strong>
              </span>
            </div>
          </div>

          <div className="portal-nav-actions">
            <button
              type="button"
              className="btn-cart-toggle"
              onClick={() => setShowCartDrawer(true)}
            >
              🛒 Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)}) • ₹{cartTotal}
            </button>

            <button
              type="button"
              className="btn-portal-logout"
              onClick={onLogout}
              title="Switch to Merchant Portal or Logout"
            >
              🚪 Switch Portal / Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Customer Shopping View */}
      <main className="portal-main">
        {/* Voice AI Assistant Section */}
        <section className="portal-card customer-ai-hero">
          <div className="card-top-bar">
            <div>
              <h3 className="card-heading">🎙️ Voice-First Hyperlocal AI Shopper</h3>
              <p className="card-subheading">Ask for items, compare nearby dukaan prices, and verify live stock</p>
            </div>
            <span className="badge-ai-online">Nearby Kiranas Synced</span>
          </div>

          <div className="query-pills-row">
            {[
              "Find 5kg basmati rice under 500 near me",
              "Which nearby store has sunflower oil in stock?",
              "Compare chakki atta prices within 1km",
              "Check sugar price at Rajesh Kirana",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="pill-query-btn customer-pill"
                onClick={() => {
                  setAiQuery(chip);
                  handleAskAssistant(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="copilot-input-bar">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask: Find 5kg basmati rice under 500 near me"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAskAssistant();
              }}
            />
            <button
              type="button"
              className="btn-ask-ai customer-btn"
              onClick={() => handleAskAssistant()}
              disabled={isAiLoading}
            >
              {isAiLoading ? "Searching..." : "Find Nearby →"}
            </button>
          </div>

          <div className="copilot-output-card customer-output">
            <div className="output-card-header">
              <span>🛍️ AI Smart Recommendation</span>
              <span className="tag-best-price">Best Value Highlight</span>
            </div>
            <pre className="copilot-text">{aiAnswer}</pre>
          </div>
        </section>

        {/* Hyperlocal Catalog & Search Section */}
        <section className="portal-card catalog-section">
          <div className="catalog-search-header">
            <div>
              <h3 className="card-heading">🏪 Neighborhood Store Listings & Price Comparison</h3>
              <p className="card-subheading">Compare genuine rates across neighborhood kirana shops</p>
            </div>

            <div className="search-box-large">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products (e.g. rice, atta, oil, sugar)..."
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="category-filters-row">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-filter-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="products-card-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-results-box">
                <p>No neighborhood products matched your search. Try searching for "rice", "oil", or "atta".</p>
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div key={prod.id} className="customer-product-card">
                  <div className="card-badge-row">
                    <span className="store-distance-badge">📍 {prod.distance}</span>
                    <span className="rating-badge">★ {prod.rating}</span>
                  </div>

                  <h4 className="prod-title">{prod.name}</h4>
                  <div className="prod-store-name">Sold by <strong>{prod.storeName}</strong></div>

                  <div className="prod-pricing-row">
                    <span className="prod-price">₹{prod.price}</span>
                    <span className="prod-stock-status">{prod.availability}</span>
                  </div>

                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="btn-reserve-item"
                      onClick={() => handleReserveItem(prod)}
                      title="Hold stock for direct store pickup"
                    >
                      Reserve Item
                    </button>
                    <button
                      type="button"
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(prod)}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Cart & Checkout Drawer */}
      {showCartDrawer && (
        <div className="cart-drawer-backdrop" onClick={() => setShowCartDrawer(false)}>
          <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h3>Your Neighborhood Cart ({cartItems.length})</h3>
              <button
                type="button"
                className="btn-close-drawer"
                onClick={() => setShowCartDrawer(false)}
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="order-success-banner">
                <div className="success-icon">🎉</div>
                <h4>Order Placed Successfully!</h4>
                <p>Tracking ID: <strong>{orderSuccess}</strong></p>
                <p className="success-meta">
                  Your local merchant (Rajesh Kirana) has received your order and is packing it now.
                </p>
                <button
                  type="button"
                  className="btn-done-order"
                  onClick={() => {
                    setOrderSuccess(null);
                    setShowCartDrawer(false);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="cart-empty-message">
                <p>Your cart is empty. Add items from nearby stores above!</p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="cart-item-row">
                      <div className="cart-item-desc">
                        <strong>{item.product.name}</strong>
                        <span>From: {item.product.storeName}</span>
                        <span className="cart-item-price">₹{item.product.price} × {item.qty} = ₹{item.product.price * item.qty}</span>
                      </div>
                      <div className="cart-item-qty-ctrl">
                        <button
                          type="button"
                          onClick={() => {
                            setCartItems((prev) =>
                              prev
                                .map((i) =>
                                  i.product.id === item.product.id
                                    ? { ...i, qty: i.qty - 1 }
                                    : i
                                )
                                .filter((i) => i.qty > 0)
                            );
                          }}
                        >
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCartItems((prev) =>
                              prev.map((i) =>
                                i.product.id === item.product.id
                                  ? { ...i, qty: i.qty + 1 }
                                  : i
                              )
                            );
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-summary-row">
                    <span>Subtotal:</span>
                    <strong>₹{cartTotal}</strong>
                  </div>
                  <div className="cart-summary-row">
                    <span>Neighborhood Delivery:</span>
                    <strong className="text-green">FREE (Within 1km)</strong>
                  </div>
                  <div className="cart-summary-total">
                    <span>Total Amount:</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-pay-order"
                    onClick={handlePlaceOrder}
                  >
                    Pay ₹{cartTotal} via Paytm / UPI →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import type { UserSession, ProductItem, ReservationItem } from "../types";

interface MerchantPortalProps {
  session: UserSession;
  onLogout: () => void;
  onReplayIntro: () => void;
  onOpenOnboarding?: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const INITIAL_MERCHANT_PRODUCTS: ProductItem[] = [
  { id: "prd_1", businessId: "biz_1", name: "Basmati Rice 5kg Premium", category: "Staples", price: 480, quantity: 24, availability: "confirmed" },
  { id: "prd_2", businessId: "biz_1", name: "Fortune Sunlite Oil 1L", category: "Edible Oil", price: 145, quantity: 40, availability: "confirmed" },
  { id: "prd_3", businessId: "biz_1", name: "Tata Salt Vacuum Evaporated 1kg", category: "Essentials", price: 28, quantity: 55, availability: "confirmed" },
  { id: "prd_4", businessId: "biz_1", name: "Madhur Pure & Hygienic Sugar 1kg", category: "Essentials", price: 46, quantity: 3, availability: "low_stock" },
  { id: "prd_5", businessId: "biz_1", name: "Aashirvaad Shudh Chakki Atta 10kg", category: "Flour", price: 425, quantity: 18, availability: "confirmed" },
  { id: "prd_6", businessId: "biz_1", name: "Taj Mahal Tea 500g", category: "Beverages", price: 295, quantity: 0, availability: "out_of_stock" },
];

const INITIAL_RESERVATIONS: ReservationItem[] = [
  {
    id: "res_101",
    productId: "prd_1",
    productName: "Basmati Rice 5kg Premium",
    customerName: "Priya Sharma (+91 9123456780)",
    quantity: 1,
    totalPrice: 480,
    status: "awaiting_confirmation",
    createdAt: "10 mins ago",
  },
  {
    id: "res_102",
    productId: "prd_2",
    productName: "Fortune Sunlite Oil 1L",
    customerName: "Amit Verma (+91 9811223344)",
    quantity: 2,
    totalPrice: 290,
    status: "awaiting_confirmation",
    createdAt: "25 mins ago",
  },
];

export const MerchantPortal: React.FC<MerchantPortalProps> = ({
  session,
  onLogout,
  onReplayIntro,
  onOpenOnboarding,
}) => {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_MERCHANT_PRODUCTS);
  const [reservations, setReservations] = useState<ReservationItem[]>(INITIAL_RESERVATIONS);

  // Copilot state
  const [copilotPrompt, setCopilotPrompt] = useState("How much did I sell today?");
  const [copilotResponse, setCopilotResponse] = useState(
    "Namaste Rajesh ji! Today's counter sales stand at ₹14,850 across 34 customer orders. Your top-moving item is Basmati Rice 5kg (12 packs sold). Madhur Sugar is down to 3 packs—consider restocking today!"
  );
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  // Add Product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Staples");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdQty, setNewProdQty] = useState("");

  const sampleCopilotQueries = [
    "How much did I sell today?",
    "Create a weekend WhatsApp offer for Basmati Rice",
    "Which products are running low on stock?",
    "Suggest combo discount for tea and sugar",
  ];

  // Fetch live products from backend if running
  useEffect(() => {
    fetch(`${API_BASE}/merchant/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {
        // Fallback to initial seed products
      });
  }, []);

  const runMerchantCopilot = async (queryText?: string) => {
    const q = queryText || copilotPrompt;
    setIsLoadingCopilot(true);
    try {
      const res = await fetch(`${API_BASE}/ai/assistant/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "merchant",
          message: q,
          language: "en",
        }),
      });
      const json = await res.json();
      if (json?.data?.response) {
        setCopilotResponse(json.data.response);
      } else {
        generateLocalCopilotInsight(q);
      }
    } catch {
      generateLocalCopilotInsight(q);
    } finally {
      setIsLoadingCopilot(false);
    }
  };

  const generateLocalCopilotInsight = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes("offer") || lower.includes("whatsapp")) {
      setCopilotResponse(
        `📢 *Weekend Special at ${session.storeName || "Rajesh Kirana"}!*\nGet 5kg Basmati Rice + 1L Oil combo at ₹599 (Flat ₹26 OFF)! Valid till Sunday. Send 'ORDER' to reserve your pack now.`
      );
    } else if (lower.includes("stock") || lower.includes("low")) {
      const lowStock = products.filter((p) => p.quantity <= 5);
      setCopilotResponse(
        `⚠️ Stock Alert: ${lowStock.length} items require attention:\n` +
          lowStock.map((p) => `• ${p.name}: ${p.quantity} left (${p.quantity === 0 ? "Out of Stock" : "Low Stock"})`).join("\n")
      );
    } else if (lower.includes("sell") || lower.includes("today")) {
      setCopilotResponse(
        `📊 Sales Overview for ${session.storeName || "Rajesh Kirana"}:\n• Total Revenue: ₹14,850\n• Orders: 34 counter & 8 hyperlocal online reservations\n• Top Category: Staples & Edible Oils (+22% vs yesterday)`
      );
    } else {
      setCopilotResponse(
        `🤖 Merchant Copilot: Recommendation for "${q}"\nBased on your neighborhood demand in ${session.location || "Indiranagar"}, weekend evening footfalls spike between 6 PM - 9 PM. We recommend keeping 20 pre-packed 5kg rice bags near the checkout counter.`
      );
    }
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            availability: newQty > 5 ? "confirmed" : newQty > 0 ? "low_stock" : "out_of_stock",
          };
        }
        return item;
      })
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const priceNum = parseFloat(newProdPrice);
    const qtyNum = parseInt(newProdQty, 10) || 10;

    const newProd: ProductItem = {
      id: `prd_${Date.now()}`,
      businessId: session.userId,
      name: newProdName,
      category: newProdCategory,
      price: priceNum,
      quantity: qtyNum,
      availability: qtyNum > 5 ? "confirmed" : "low_stock",
    };

    setProducts((prev) => [newProd, ...prev]);

    // Try posting to backend
    fetch(`${API_BASE}/merchant/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: session.userId,
        name: newProdName,
        price: priceNum,
        quantity: qtyNum,
      }),
    }).catch(() => {});

    setNewProdName("");
    setNewProdPrice("");
    setNewProdQty("");
    setShowAddModal(false);
  };

  const handleConfirmReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r))
    );
    // Notify user with audio/visual feedback
    alert("Reservation Confirmed! Customer has been notified for in-store pickup.");
  };

  const totalRevenue = 14850;
  const pendingReservationsCount = reservations.filter((r) => r.status === "awaiting_confirmation").length;

  return (
    <div className="portal-container merchant-theme">
      {/* Top Merchant Navbar */}
      <nav className="portal-navbar merchant-nav">
        <div className="portal-nav-content">
          <div className="portal-brand-group">
            <span className="portal-badge merchant-badge">Merchant Portal</span>
            <div>
              <h2 className="portal-store-name">{session.storeName || "Rajesh Kirana & Store"}</h2>
              <span className="portal-store-meta">
                {session.location || "Indiranagar, Bengaluru"} • <strong className="text-green">🟢 Live on Karobaar</strong>
              </span>
            </div>
          </div>

          <div className="portal-nav-actions">
            {onOpenOnboarding && (
              <button
                type="button"
                className="btn-portal-logout"
                style={{ background: "#fef08a", color: "#854d0e", borderColor: "#facc15" }}
                onClick={onOpenOnboarding}
                title="View Business Verification & Onboarding status"
              >
                📋 Business Verification
              </button>
            )}
            <button
              type="button"
              className="btn-portal-logout"
              onClick={onLogout}
              title="Switch to Customer Portal or Logout"
            >
              🚪 Switch Portal / Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Merchant Portal Content */}
      <main className="portal-main">
        {/* Metric Cards Row */}
        <section className="metric-cards-grid">
          <div className="metric-card card-revenue">
            <div className="metric-header">
              <span className="metric-label">Today's Total Sales</span>
              <span className="metric-icon">💰</span>
            </div>
            <div className="metric-value">₹{totalRevenue.toLocaleString()}</div>
            <div className="metric-footer text-positive">↑ +18% compared to yesterday</div>
          </div>

          <div className="metric-card card-inventory">
            <div className="metric-header">
              <span className="metric-label">Active Dukaan Products</span>
              <span className="metric-icon">📦</span>
            </div>
            <div className="metric-value">{products.length} Items</div>
            <div className="metric-footer">{products.filter((p) => p.quantity <= 5).length} low stock alerts</div>
          </div>

          <div className="metric-card card-reservations">
            <div className="metric-header">
              <span className="metric-label">Customer Reservations</span>
              <span className="metric-icon">🔔</span>
            </div>
            <div className="metric-value">{pendingReservationsCount} Pending</div>
            <div className="metric-footer text-accent">Awaiting confirmation</div>
          </div>

          <div className="metric-card card-copilot-status">
            <div className="metric-header">
              <span className="metric-label">Voice AI Copilot</span>
              <span className="metric-icon">🎙️</span>
            </div>
            <div className="metric-value">Ready</div>
            <div className="metric-footer">Hindi, Hinglish & English</div>
          </div>
        </section>

        {/* Two-Column Operations Layout */}
        <div className="portal-grid-two">
          {/* LEFT: Merchant Copilot */}
          <section className="portal-card copilot-section">
            <div className="card-top-bar">
              <div>
                <h3 className="card-heading">🏪 Merchant Growth AI Copilot</h3>
                <p className="card-subheading">Ask anything about daily sales, offer drafting, or inventory restock</p>
              </div>
              <span className="ai-pulse-pill">Voice AI Live</span>
            </div>

            {/* Quick Query Pills */}
            <div className="query-pills-row">
              {sampleCopilotQueries.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="pill-query-btn"
                  onClick={() => {
                    setCopilotPrompt(pill);
                    runMerchantCopilot(pill);
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <div className="copilot-input-bar">
              <input
                type="text"
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                placeholder="Ask: Create a weekend WhatsApp offer for my top product"
                onKeyDown={(e) => {
                  if (e.key === "Enter") runMerchantCopilot();
                }}
              />
              <button
                type="button"
                className="btn-ask-ai"
                onClick={() => runMerchantCopilot()}
                disabled={isLoadingCopilot}
              >
                {isLoadingCopilot ? "Thinking..." : "Ask Copilot →"}
              </button>
            </div>

            {/* Copilot Response Box */}
            <div className="copilot-output-card">
              <div className="output-card-header">
                <span>🤖 Copilot Recommendation</span>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(copilotResponse);
                    alert("Copied to clipboard! Ready to paste into WhatsApp.");
                  }}
                >
                  📋 Copy to WhatsApp
                </button>
              </div>
              <pre className="copilot-text">{copilotResponse}</pre>
            </div>
          </section>

          {/* RIGHT: Customer Reservation Requests */}
          <section className="portal-card reservations-section">
            <div className="card-top-bar">
              <div>
                <h3 className="card-heading">🔔 Live Neighborhood Reservations</h3>
                <p className="card-subheading">Customers holding stock for pickup or quick delivery</p>
              </div>
              <span className="count-badge">{reservations.length} Requests</span>
            </div>

            <div className="reservations-list">
              {reservations.map((res) => (
                <div key={res.id} className={`reservation-card status-${res.status}`}>
                  <div className="res-top">
                    <strong className="res-item-title">{res.productName}</strong>
                    <span className="res-price">₹{res.totalPrice}</span>
                  </div>
                  <div className="res-details">
                    <span>Qty: <strong>{res.quantity}</strong></span>
                    <span>Customer: {res.customerName}</span>
                    <span className="res-time">{res.createdAt}</span>
                  </div>

                  <div className="res-action-bar">
                    {res.status === "awaiting_confirmation" ? (
                      <button
                        type="button"
                        className="btn-confirm-res"
                        onClick={() => handleConfirmReservation(res.id)}
                      >
                        ✅ Confirm & Hold Stock
                      </button>
                    ) : (
                      <span className="badge-confirmed">✓ Confirmed & Packed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* BOTTOM: Full Inventory & Catalog Table */}
        <section className="portal-card inventory-table-section">
          <div className="card-top-bar">
            <div>
              <h3 className="card-heading">📦 Dukaan Inventory & Stock Control</h3>
              <p className="card-subheading">Manage your shelf prices and instant live availability for nearby customers</p>
            </div>
            <button
              type="button"
              className="btn-add-product"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add New Product
            </button>
          </div>

          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Quick Stock Adjust</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td><strong>{prod.name}</strong></td>
                    <td><span className="cat-tag">{prod.category || "General"}</span></td>
                    <td><strong>₹{prod.price}</strong></td>
                    <td>
                      <span className="stock-number">{prod.quantity} units</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          prod.quantity > 5
                            ? "pill-green"
                            : prod.quantity > 0
                            ? "pill-amber"
                            : "pill-red"
                        }`}
                      >
                        {prod.quantity > 5
                          ? "In Stock"
                          : prod.quantity > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="stock-adjust-btns">
                        <button
                          type="button"
                          className="btn-stock-mod"
                          onClick={() => handleUpdateStock(prod.id, -1)}
                          title="Decrease 1"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          className="btn-stock-mod"
                          onClick={() => handleUpdateStock(prod.id, 5)}
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          className="btn-stock-mod"
                          onClick={() => handleUpdateStock(prod.id, 10)}
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Product to Store Catalog</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Daawat Rozana Basmati Rice 1kg"
                  required
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                  >
                    <option value="Staples">Staples</option>
                    <option value="Edible Oil">Edible Oil</option>
                    <option value="Spices & Masala">Spices & Masala</option>
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Snacks & Biscuits">Snacks & Biscuits</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. 120"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Initial Physical Stock (Units)</label>
                <input
                  type="number"
                  value={newProdQty}
                  onChange={(e) => setNewProdQty(e.target.value)}
                  placeholder="e.g. 25"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-prod">
                  Save Product to Dukaan →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

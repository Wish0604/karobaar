import React, { useState, useEffect, useRef } from "react";
import { Icon, type IconName } from "../components/icons";
import { AIMascot } from "../components/AIMascot";
import "./MerchantPortal.css";
import { AiAssistantWidget } from "../components/AiAssistantWidget";
import type { UserSession, ProductItem } from "../types";

export interface MerchantPortalProps {
  session: UserSession;
  onLogout: () => void;
  onReplayIntro: () => void;
  onOpenOnboarding?: () => void;
  onSwitchToCustomer?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES & SCHEMAS FOR ALL 9 MODULES
// ─────────────────────────────────────────────────────────────────────────────

export type MerchantModule =
  | "dashboard"
  | "products"
  | "orders"
  | "inventory"
  | "payments"
  | "customers"
  | "shop"
  | "settings";

export type OrderStatus =
  | "all"
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsCount: number;
  items: { name: string; qty: number; price: number; icon: string }[];
  totalAmount: number;
  paymentMethod: "UPI" | "Paytm" | "Card" | "COD";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "new" | "accepted" | "preparing" | "ready" | "dispatched" | "delivered" | "cancelled";
  createdAt: string;
  deliveryType: "delivery" | "pickup";
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  type: "Frequent" | "Repeat" | "Regular" | "New";
  rating?: number;
  review?: string;
}

export interface StockHistoryRecord {
  id: string;
  productName: string;
  change: string;
  reason: string;
  date: string;
  by: string;
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: string;
  date: string;
  status: "Success" | "Pending" | "Failed";
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL MOCK DATA (Grounded in Authentic Indian Kirana & Retail Scenario)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS = [
  { id: "prd_1", name: "Tata Salt Vacuum Evaporated (1kg)", category: "Grocery", price: 28, mrp: 30, quantity: 48, threshold: 10, status: "Active", icon: "salt" },
  { id: "prd_2", name: "Aashirvaad Shudh Chakki Atta (5kg)", category: "Grocery", price: 275, mrp: 295, quantity: 6, threshold: 10, status: "Low Stock", icon: "wheat" },
  { id: "prd_3", name: "Fortune Sunlite Oil (1L)", category: "Grocery", price: 145, mrp: 160, quantity: 32, threshold: 10, status: "Active", icon: "droplet" },
  { id: "prd_4", name: "Amul Taaza Homogenised Milk (500ml)", category: "Dairy", price: 28, mrp: 28, quantity: 0, threshold: 5, status: "Out of Stock", icon: "milk" },
  { id: "prd_5", name: "Maggi 2-Minute Masala Noodles (70g)", category: "Snacks", price: 14, mrp: 14, quantity: 60, threshold: 15, status: "Active", icon: "noodle" },
  { id: "prd_6", name: "Basmati Rice Rozana Premium (5kg)", category: "Grocery", price: 480, mrp: 520, quantity: 9, threshold: 10, status: "Low Stock", icon: "bowl" },
  { id: "prd_7", name: "Parle-G Gold Glucose Biscuits (250g)", category: "Snacks", price: 25, mrp: 25, quantity: 80, threshold: 20, status: "Active", icon: "cookie" },
  { id: "prd_8", name: "Surf Excel Easy Wash Detergent (1kg)", category: "Cleaning", price: 140, mrp: 155, quantity: 22, threshold: 8, status: "Active", icon: "soap" },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "#KB1024",
    customerName: "Rahul Verma",
    customerPhone: "+91 98765 43210",
    customerAddress: "Flat 402, Royal Palms, Indiranagar, Bengaluru",
    itemsCount: 3,
    items: [
      { name: "Tata Salt (1kg)", qty: 2, price: 28, icon: "salt" },
      { name: "Aashirvaad Atta (5kg)", qty: 1, price: 275, icon: "wheat" },
      { name: "Fortune Oil (1L)", qty: 1, price: 145, icon: "droplet" },
    ],
    totalAmount: 476,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "new",
    createdAt: "10 mins ago",
    deliveryType: "delivery",
  },
  {
    id: "#KB1025",
    customerName: "Priya Sharma",
    customerPhone: "+91 91234 56780",
    customerAddress: "12, 100ft Road, Indiranagar, Bengaluru",
    itemsCount: 5,
    items: [
      { name: "Basmati Rice (5kg)", qty: 1, price: 480, icon: "bowl" },
      { name: "Fortune Oil (1L)", qty: 2, price: 145, icon: "droplet" },
      { name: "Maggi Noodles (70g)", qty: 6, price: 14, icon: "noodle" },
    ],
    totalAmount: 854,
    paymentMethod: "Paytm",
    paymentStatus: "Paid",
    status: "new",
    createdAt: "22 mins ago",
    deliveryType: "delivery",
  },
  {
    id: "#KB1026",
    customerName: "Amit Kumar",
    customerPhone: "+91 98987 66554",
    customerAddress: "Counter Pickup at Store",
    itemsCount: 2,
    items: [
      { name: "Parle-G Biscuits", qty: 4, price: 25, icon: "cookie" },
      { name: "Tata Salt (1kg)", qty: 1, price: 28, icon: "salt" },
    ],
    totalAmount: 128,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    status: "accepted",
    createdAt: "45 mins ago",
    deliveryType: "pickup",
  },
  {
    id: "#KB1027",
    customerName: "Neha Joshi",
    customerPhone: "+91 98223 34455",
    customerAddress: "House 55, 4th Cross, HAL 2nd Stage, Bengaluru",
    itemsCount: 4,
    items: [
      { name: "Surf Excel (1kg)", qty: 2, price: 140, icon: "soap" },
      { name: "Basmati Rice (5kg)", qty: 1, price: 480, icon: "bowl" },
    ],
    totalAmount: 760,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "preparing",
    createdAt: "1 hour ago",
    deliveryType: "delivery",
  },
  {
    id: "#KB1028",
    customerName: "Vikram Singh",
    customerPhone: "+91 98334 55667",
    customerAddress: "77 Defence Colony, Indiranagar",
    itemsCount: 1,
    items: [{ name: "Basmati Rice (5kg)", qty: 1, price: 480, icon: "bowl" }],
    totalAmount: 480,
    paymentMethod: "Card",
    paymentStatus: "Paid",
    status: "ready",
    createdAt: "2 hours ago",
    deliveryType: "pickup",
  },
  {
    id: "#KB1029",
    customerName: "Pooja Patel",
    customerPhone: "+91 98445 66778",
    customerAddress: "Apartment 101, BDA Layout, Bengaluru",
    itemsCount: 6,
    items: [
      { name: "Aashirvaad Atta (5kg)", qty: 2, price: 275, icon: "wheat" },
      { name: "Fortune Oil (1L)", qty: 2, price: 145, icon: "droplet" },
    ],
    totalAmount: 840,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "dispatched",
    createdAt: "3 hours ago",
    deliveryType: "delivery",
  },
  {
    id: "#KB1030",
    customerName: "Rajesh Gupta",
    customerPhone: "+91 98112 23344",
    customerAddress: "Storefront Walk-in Customer",
    itemsCount: 2,
    items: [{ name: "Tata Salt (1kg)", qty: 1, price: 28, icon: "salt" }],
    totalAmount: 28,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "delivered",
    createdAt: "Yesterday",
    deliveryType: "pickup",
  },
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  { id: "c_1", name: "Rahul Verma", phone: "+91 98765 43210", address: "Indiranagar, Bengaluru", totalOrders: 12, totalSpend: 8450, lastOrderDate: "22 Jan 2025", type: "Frequent", rating: 5, review: "Always fresh goods and very fast 15-min delivery!" },
  { id: "c_2", name: "Priya Sharma", phone: "+91 91234 56780", address: "100ft Road, Indiranagar", totalOrders: 7, totalSpend: 4320, lastOrderDate: "21 Jan 2025", type: "Repeat", rating: 5, review: "Great WhatsApp order support, very helpful dukaan." },
  { id: "c_3", name: "Amit Kumar", phone: "+91 98987 66554", address: "Old Airport Road, Bengaluru", totalOrders: 3, totalSpend: 1760, lastOrderDate: "20 Jan 2025", type: "Regular", rating: 4, review: "Fair prices and original branded products." },
  { id: "c_4", name: "Neha Joshi", phone: "+91 98223 34455", address: "HAL 2nd Stage, Bengaluru", totalOrders: 5, totalSpend: 3890, lastOrderDate: "19 Jan 2025", type: "Repeat", rating: 5, review: "Super easy to pay via Paytm QR and get items quickly." },
  { id: "c_5", name: "Vikram Singh", phone: "+91 98334 55667", address: "Defence Colony, Bengaluru", totalOrders: 1, totalSpend: 480, lastOrderDate: "18 Jan 2025", type: "New" },
];

const INITIAL_STOCK_HISTORY: StockHistoryRecord[] = [
  { id: "sh_1", productName: "Tata Salt (1kg)", change: "+50 Units", reason: "Wholesale Restock", date: "22 Jan, 10:30 AM", by: "Rajesh (Owner)" },
  { id: "sh_2", productName: "Aashirvaad Atta (5kg)", change: "-4 Units", reason: "Order #KB1024 Fulfillment", date: "22 Jan, 11:15 AM", by: "POS System" },
  { id: "sh_3", productName: "Amul Milk (500ml)", change: "-20 Units", reason: "Sold Out (Daily Morning Run)", date: "22 Jan, 08:45 AM", by: "POS System" },
  { id: "sh_4", productName: "Fortune Oil (1L)", change: "+40 Units", reason: "Direct Distributor Inward", date: "21 Jan, 04:20 PM", by: "Rajesh (Owner)" },
];

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  { id: "TXN784521", orderId: "#KB1024", customer: "Rahul Verma", amount: 476, method: "UPI", date: "22 Jan, 11:24 AM", status: "Success" },
  { id: "TXN784520", orderId: "#KB1025", customer: "Priya Sharma", amount: 854, method: "Paytm", date: "22 Jan, 10:05 AM", status: "Success" },
  { id: "TXN784519", orderId: "#KB1027", customer: "Neha Joshi", amount: 760, method: "UPI", date: "21 Jan, 06:10 PM", status: "Success" },
  { id: "TXN784518", orderId: "#KB1028", customer: "Vikram Singh", amount: 480, method: "Card", date: "21 Jan, 04:12 PM", status: "Success" },
  { id: "TXN784517", orderId: "#KB1029", customer: "Pooja Patel", amount: 840, method: "UPI", date: "20 Jan, 02:40 PM", status: "Success" },
];

export const MerchantPortal: React.FC<MerchantPortalProps> = ({
  session,
  onLogout,
  onReplayIntro,
  onOpenOnboarding,
  onSwitchToCustomer,
}) => {
  // Navigation State
  const [activeModule, setActiveModule] = useState<MerchantModule>("dashboard");

  // Core Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [stockHistory, setStockHistory] = useState<StockHistoryRecord[]>(INITIAL_STOCK_HISTORY);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Global UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof INITIAL_PRODUCTS[0] | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<OrderRecord | null>(null);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState<typeof INITIAL_PRODUCTS[0] | null>(null);

  // Orders Sub-Filter
  const [orderFilter, setOrderFilter] = useState<OrderStatus>("all");

  // AI Assistant Interaction State
  const [isAiListening, setIsAiListening] = useState(false);
  const [aiSpeechState, setAiSpeechState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; action?: string }>>([
    {
      sender: "ai",
      text: "Namaste Rajesh ji! I'm your KAROBAAR AI Copilot. How can I help your business today? You can ask me to add products, check stock, or create discounts.",
    },
  ]);
  const [aiInputText, setAiInputText] = useState("");
  const [pendingAiAction, setPendingAiAction] = useState<{ title: string; desc: string; apply: () => void } | null>(null);
  const [aiWidgetOpen, setAiWidgetOpen] = useState(false);
  const [aiWidgetExpanded, setAiWidgetExpanded] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiVoiceMuted, setAiVoiceMuted] = useState(false);
  // null = still checking, true = Sarvam key configured on ai-service, false = browser voice fallback
  const [sarvamVoiceReady, setSarvamVoiceReady] = useState<boolean | null>(null);

  // Stock Adjustment Form State
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<"add" | "reduce" | "damaged">("add");
  const [stockAdjReason, setStockAdjReason] = useState("Distributor Restock");

  // Add Product Form State
  const [addProductMode, setAddProductMode] = useState<"manual" | "camera" | "voice">("manual");
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("Grocery");
  const [newProdPrice, setNewProdPrice] = useState(100);
  const [newProdMrp, setNewProdMrp] = useState(110);
  const [newProdQty, setNewProdQty] = useState(20);

  // Shop Settings State
  const [shopName, setShopName] = useState(session?.storeName || "Rajesh Kirana & Store");
  const [shopPhone, setShopPhone] = useState(session?.phone || "+91 9876543210");
  const [shopAddress, setShopAddress] = useState(session?.location || "Indiranagar, Bengaluru");
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(499);

  // Helper toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3200);
  };

  // Order state transitions
  const updateOrderStatus = (orderId: string, newStatus: OrderRecord["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order ${orderId} moved to "${newStatus.toUpperCase()}"`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Stock update submission
  const handleStockUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUpdateStockModal) return;

    const delta = stockAdjType === "add" ? Number(stockAdjQty) : -Number(stockAdjQty);
    const updatedQty = Math.max(0, showUpdateStockModal.quantity + delta);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === showUpdateStockModal.id
          ? {
              ...p,
              quantity: updatedQty,
              status: updatedQty === 0 ? "Out of Stock" : updatedQty <= p.threshold ? "Low Stock" : "Active",
            }
          : p
      )
    );

    setStockHistory((prev) => [
      {
        id: `sh_${Date.now()}`,
        productName: showUpdateStockModal.name,
        change: `${delta > 0 ? "+" : ""}${delta} Units`,
        reason: stockAdjReason,
        date: "Just now",
        by: session.name || "Rajesh (Owner)",
      },
      ...prev,
    ]);

    showToast(`Stock updated for ${showUpdateStockModal.name} (${updatedQty} left)`);
    setShowUpdateStockModal(null);
  };

  // Add Product submission
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProd = {
      id: `prd_${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCat,
      price: Number(newProdPrice),
      mrp: Number(newProdMrp),
      quantity: Number(newProdQty),
      threshold: 10,
      status: Number(newProdQty) > 0 ? "Active" : "Out of Stock",
      icon: newProdCat === "Dairy" ? "milk" : newProdCat === "Snacks" ? "noodle" : "package",
    };

    setProducts((prev) => [newProd, ...prev]);
    showToast(`"${newProd.name}" added to catalogue!`);
    setShowAddProductModal(false);
    setNewProdName("");
  };

  // AI Assistant Chat & Voice Simulation
  const handleSendAiMessage = (queryText?: string) => {
    const q = (queryText || aiInputText).trim();
    if (!q) return;

    setAiInputText("");
    setAiSpeechState("processing");
    setAiChatHistory((prev) => [...prev, { sender: "user", text: q }]);

    window.setTimeout(() => {
      let aiReply = "Bilkul! I have analyzed that for your store.";
      let actionObj: { title: string; desc: string; apply: () => void } | null = null;

      const lower = q.toLowerCase();
      if (lower.includes("sales") || lower.includes("bikri") || lower.includes("earning")) {
        aiReply = "Namaste Rajesh ji! Today's sales stand at ₹12,450 across 24 orders. Top selling item: Maggi Noodles (18 packs). Sales are up by 12% compared to yesterday!";
      } else if (lower.includes("stock") || lower.includes("tata salt") || lower.includes("rice")) {
        aiReply = "Tata Salt has 48 units in stock (Healthy). However, Aashirvaad Atta 5kg has only 6 units remaining (Below threshold). Would you like me to create an order restock draft?";
        actionObj = {
          title: "Restock Aashirvaad Atta 5kg (+30 Units)",
          desc: "Add 30 units from wholesale distributor into inventory",
          apply: () => {
            setProducts((prev) =>
              prev.map((p) => (p.id === "prd_2" ? { ...p, quantity: p.quantity + 30, status: "Active" } : p))
            );
            showToast("Aashirvaad Atta restocked with +30 units!");
          },
        };
      } else if (lower.includes("offer") || lower.includes("discount") || lower.includes("weekend")) {
        aiReply = "Great idea! I recommend creating a 10% weekend discount on Daily Essentials for orders above ₹399. Shall I apply code 'WEEKEND10'?";
        actionObj = {
          title: "Launch 'WEEKEND10' (10% Off above ₹399)",
          desc: "Create and broadcast promo to 52 repeat customers on WhatsApp",
          apply: () => {
            showToast("Promo 'WEEKEND10' activated!");
          },
        };
      } else if (lower.includes("order") || lower.includes("pending")) {
        aiReply = `You have 2 pending orders waiting for approval: #KB1024 from Rahul Verma (₹476) and #KB1025 from Priya Sharma (₹854). Shall I accept all new orders?`;
        actionObj = {
          title: "Accept All New Orders (2 Orders)",
          desc: "Move #KB1024 and #KB1025 to Accepted & notify customers",
          apply: () => {
            setOrders((prev) =>
              prev.map((o) => (o.status === "new" ? { ...o, status: "accepted" } : o))
            );
            showToast("Accepted all pending orders!");
          },
        };
      } else {
        aiReply = `Samajh gaya! I've noted: "${q}". You can ask me to update stock, check settlements, or view customer insights anytime.`;
      }

      setAiChatHistory((prev) => [...prev, { sender: "ai", text: aiReply }]);
      setPendingAiAction(actionObj);
      setAiSpeechState("idle");
      // The assistant talks back — voice guidance for the merchant (Sarvam TTS)
      speakAiReply(aiReply);
    }, 700);
  };

  // ─────────────────────────────────────────────────────────────────
  // Sarvam AI voice pipeline:
  //   Mic → MediaRecorder → /api/v1/ai/voice/stt (Sarvam Saaras STT)
  //   Reply → /api/v1/ai/voice/tts (Sarvam Bulbul TTS) → spoken aloud
  // Fallback chain: Sarvam STT → browser SpeechRecognition → demo voice.
  // Fallback for speech: Sarvam TTS → browser speechSynthesis.
  // ─────────────────────────────────────────────────────────────────
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceMaxTimerRef = useRef<number | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const sarvamReadyRef = useRef<boolean | null>(null);
  const aiVoiceMutedRef = useRef(false);

  // Ask the ai-service (via backend proxy) whether the Sarvam key is configured
  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/ai/voice/config")
      .then((r) => r.json())
      .then((j) => {
        const ready = !!(j?.success && j?.data?.sarvamConfigured);
        if (!cancelled) {
          sarvamReadyRef.current = ready;
          setSarvamVoiceReady(ready);
        }
      })
      .catch(() => {
        if (!cancelled) {
          sarvamReadyRef.current = false;
          setSarvamVoiceReady(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const detectVoiceLanguage = (text: string) => (/[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN");

  const stopAiSpeaking = () => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* speechSynthesis unavailable */
    }
    setIsAiSpeaking(false);
  };

  // Browser built-in speech engine — always available fallback for TTS
  const browserSpeak = (text: string) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) {
        setIsAiSpeaking(false);
        return;
      }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = detectVoiceLanguage(text);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      synth.speak(utterance);
    } catch {
      setIsAiSpeaking(false);
    }
  };

  // Speak a reply aloud: Sarvam Bulbul voice first, browser TTS as fallback
  const speakAiReply = async (text: string) => {
    if (aiVoiceMutedRef.current) return;
    stopAiSpeaking();
    setIsAiSpeaking(true);

    if (sarvamReadyRef.current === true) {
      try {
        const res = await fetch("/api/v1/ai/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, languageCode: detectVoiceLanguage(text) }),
        });
        const json = await res.json();
        const audioBase64 = json?.success ? (json?.data?.audioBase64 as string | undefined) : undefined;
        if (audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
          ttsAudioRef.current = audio;
          audio.onended = () => setIsAiSpeaking(false);
          audio.onerror = () => {
            ttsAudioRef.current = null;
            browserSpeak(text);
          };
          try {
            await audio.play();
            return;
          } catch {
            // autoplay blocked or decode failure → browser TTS
          }
        }
      } catch {
        // Sarvam TTS unreachable → browser TTS fallback
      }
    }
    browserSpeak(text);
  };

  const handleToggleAiMute = () => {
    const next = !aiVoiceMuted;
    setAiVoiceMuted(next);
    aiVoiceMutedRef.current = next;
    if (next) stopAiSpeaking();
    showToast(next ? "AI voice muted" : "AI voice on — main aapko guide karunga!");
  };

  const clearVoiceTimers = () => {
    if (voiceMaxTimerRef.current) {
      window.clearTimeout(voiceMaxTimerRef.current);
      voiceMaxTimerRef.current = null;
    }
  };

  const releaseMic = () => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  };

  const stopSarvamRecording = () => {
    clearVoiceTimers();
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      releaseMic();
    }
    mediaRecorderRef.current = null;
  };

  // Browser SpeechRecognition fallback (Chrome/Edge; no server key needed)
  const startBrowserRecognition = () => {
    setIsAiListening(true);
    setAiSpeechState("listening");

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      // Demo voice simulation for environments without mic/speech APIs
      showToast("Listening... Speak in Hindi or English");
      voiceMaxTimerRef.current = window.setTimeout(() => {
        voiceMaxTimerRef.current = null;
        setIsAiListening(false);
        handleSendAiMessage("Aaj ki sales aur low stock items batao");
      }, 3500);
      return;
    }

    const recognition = new (SpeechRecognitionCtor as new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      start: () => void;
      stop: () => void;
      onresult: ((event: { results?: Array<Array<{ transcript?: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    })();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      setIsAiListening(false);
      speechRecognitionRef.current = null;
      if (transcript) {
        handleSendAiMessage(transcript);
      } else {
        setAiSpeechState("idle");
        showToast("Kuch sunayi nahi diya — try typing instead");
      }
    };

    recognition.onerror = () => {
      // Microphone unavailable or permission denied: use the demo voice flow
      setIsAiListening(false);
      speechRecognitionRef.current = null;
      showToast("Mic unavailable here — running demo voice");
      voiceMaxTimerRef.current = window.setTimeout(() => {
        voiceMaxTimerRef.current = null;
        handleSendAiMessage("Aaj ki sales aur low stock items batao");
      }, 1200);
    };

    recognition.onend = () => setIsAiListening(false);
    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognition.onerror?.();
    }
  };

  // Real mic recording → Sarvam Saaras STT (Hindi/English/Indic auto-detect)
  const startSarvamRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        clearVoiceTimers();
        releaseMic();
        mediaRecorderRef.current = null;

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size < 1200) {
          setIsAiListening(false);
          setAiSpeechState("idle");
          showToast("Kuch sunayi nahi diya — phir se boliye ya type karein");
          return;
        }

        setAiSpeechState("processing");
        try {
          const formData = new FormData();
          formData.append("file", blob, "voice.webm");
          const res = await fetch("/api/v1/ai/voice/stt", { method: "POST", body: formData });
          const json = await res.json();
          const transcript = json?.success ? ((json?.data?.transcript as string) || "").trim() : "";

          setIsAiListening(false);
          if (transcript) {
            handleSendAiMessage(transcript);
          } else if (json?.error?.code === "sarvam_not_configured") {
            sarvamReadyRef.current = false;
            setSarvamVoiceReady(false);
            showToast("Sarvam voice off — browser voice se boliye");
            startBrowserRecognition();
          } else {
            setAiSpeechState("idle");
            showToast("Samajh nahi aaya — phir se boliye ya type karein");
          }
        } catch {
          setIsAiListening(false);
          setAiSpeechState("idle");
          showToast("Voice service unreachable — try typing instead");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      // Safety cap: automatically stop after 10 seconds
      voiceMaxTimerRef.current = window.setTimeout(() => stopSarvamRecording(), 10000);
    } catch {
      // No microphone / permission denied → browser SR → demo
      setIsAiListening(false);
      startBrowserRecognition();
    }
  };

  const handleToggleVoiceMic = () => {
    // Barge-in: tapping the mic while the AI talks interrupts the speech
    if (isAiSpeaking) stopAiSpeaking();

    if (isAiListening) {
      setIsAiListening(false);
      setAiSpeechState("idle");
      if (mediaRecorderRef.current) {
        stopSarvamRecording();
      } else {
        speechRecognitionRef.current?.stop();
        speechRecognitionRef.current = null;
        clearVoiceTimers();
      }
      return;
    }

    setIsAiListening(true);
    setAiSpeechState("listening");
    setAiWidgetOpen(true);

    if (sarvamReadyRef.current === true && !!navigator.mediaDevices?.getUserMedia) {
      startSarvamRecording();
    } else {
      startBrowserRecognition();
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== "all" && o.status !== orderFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.totalAmount.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="merchant-portal-root">
      {/* ─────────────────────────────────────────────────────────────
         LEFT YELLOW NAVIGATION SIDEBAR (Modules 01 - 10)
         ───────────────────────────────────────────────────────────── */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-header">
          <div className="mp-brand-logo-badge">K</div>
          <div className="mp-brand-title">
            <span className="mp-brand-name">KAROBAAR</span>
            <span className="mp-portal-tag">Merchant Portal</span>
          </div>
        </div>

        <nav className="mp-sidebar-nav">
          <button
            type="button"
            className={`mp-nav-item ${activeModule === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveModule("dashboard")}
          >
            <span className="mp-nav-num">01</span>
            <span className="mp-nav-icon"><Icon name="chart" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "products" ? "active" : ""}`}
            onClick={() => setActiveModule("products")}
          >
            <span className="mp-nav-num">02</span>
            <span className="mp-nav-icon"><Icon name="package" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Products</span>
            <span className="mp-nav-badge">{products.length}</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "orders" ? "active" : ""}`}
            onClick={() => setActiveModule("orders")}
          >
            <span className="mp-nav-num">03</span>
            <span className="mp-nav-icon"><Icon name="bag" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Orders</span>
            <span className="mp-nav-badge">
              {orders.filter((o) => o.status === "new").length}
            </span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "inventory" ? "active" : ""}`}
            onClick={() => setActiveModule("inventory")}
          >
            <span className="mp-nav-num">04</span>
            <span className="mp-nav-icon"><Icon name="clipboard" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Inventory</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "payments" ? "active" : ""}`}
            onClick={() => setActiveModule("payments")}
          >
            <span className="mp-nav-num">05</span>
            <span className="mp-nav-icon"><Icon name="card" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Payments</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "customers" ? "active" : ""}`}
            onClick={() => setActiveModule("customers")}
          >
            <span className="mp-nav-num">06</span>
            <span className="mp-nav-icon"><Icon name="users" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Customers</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "shop" ? "active" : ""}`}
            onClick={() => setActiveModule("shop")}
          >
            <span className="mp-nav-num">07</span>
            <span className="mp-nav-icon"><Icon name="store" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Shop Management</span>
          </button>

          <button
            type="button"
            className={`mp-nav-item ${activeModule === "settings" ? "active" : ""}`}
            onClick={() => setActiveModule("settings")}
          >
            <span className="mp-nav-num">08</span>
            <span className="mp-nav-icon"><Icon name="settings" size={19} strokeWidth={1.8} /></span>
            <span className="mp-nav-label">Settings</span>
          </button>
        </nav>

        <div className="mp-sidebar-footer">
          <div className="mp-store-mini-card">
            <span className="mp-store-dot" />
            <div className="mp-store-mini-info">
              <span className="mp-store-mini-name">{shopName}</span>
              <span className="mp-store-mini-status">Store Active • Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
         MAIN PORTAL CONTAINER & TOP HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="mp-main-container">
        {/* Top Header */}
        <header className="mp-top-header">
          <div className="mp-header-left">
            <div className="mp-search-container">
              <span className="mp-search-icon"><Icon name="search" size={16} strokeWidth={1.8} /></span>
              <input
                type="text"
                placeholder="Search anything across products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mp-search-input"
              />
            </div>
          </div>

          <div className="mp-header-right">
            <div className="mp-date-pill">
              <span><Icon name="calendar" size={13} strokeWidth={1.8} /> Today</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="mp-header-btn-icon"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Icon name="bell" size={20} strokeWidth={1.8} />
              <span className="mp-notif-dot" />
            </button>

            {/* Merchant Profile Badge */}
            <div
              className="mp-merchant-profile-chip"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="mp-profile-avatar">
                {session.name ? session.name[0] : "R"}
              </div>
              <div className="mp-profile-text">
                <span className="mp-profile-name">{session.name || "Rajesh Kumar"}</span>
                <span className="mp-profile-store">{shopName}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>▼</span>
            </div>
          </div>
        </header>

        {/* Notifications Popover Dropdown */}
        {showNotifications && (
          <div
            className="mp-card"
            style={{
              position: "fixed",
              top: 75,
              right: 80,
              width: 320,
              zIndex: 80,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong style={{ fontSize: "0.95rem" }}>Recent Alerts</strong>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Mark read</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: "8px 10px", background: "#fef9c3", borderRadius: 8, fontSize: "0.82rem" }}>
                <Icon name="bag" size={15} strokeWidth={1.8} /> <strong>New Order #KB1024</strong> from Rahul Verma (₹476).
              </div>
              <div style={{ padding: "8px 10px", background: "#fee2e2", borderRadius: 8, fontSize: "0.82rem" }}>
                <Icon name="alert" size={15} strokeWidth={1.8} /> <strong>Low Stock Alert:</strong> Aashirvaad Atta (5kg) has only 6 left.
              </div>
              <div style={{ padding: "8px 10px", background: "#ecfdf5", borderRadius: 8, fontSize: "0.82rem" }}>
                <Icon name="wallet" size={15} strokeWidth={1.8} /> <strong>Settlement Completed:</strong> ₹18,450 deposited into HDFC account.
              </div>
            </div>
          </div>
        )}

        {/* Profile Menu Popover */}
        {showProfileMenu && (
          <div
            className="mp-card"
            style={{
              position: "fixed",
              top: 75,
              right: 28,
              width: 220,
              zIndex: 80,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              padding: 12,
            }}
          >
            <div style={{ padding: "6px 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 8 }}>
              <strong style={{ fontSize: "0.88rem", display: "block" }}>{session.name || "Rajesh Kumar"}</strong>
              <small style={{ color: "#64748b" }}>{session.phone || "+91 9876543210"}</small>
            </div>
            <button
              type="button"
              className="mp-btn-secondary"
              style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
              onClick={() => {
                setShowProfileMenu(false);
                setActiveModule("settings");
              }}
            >
              <Icon name="settings" size={15} strokeWidth={1.8} /> Account Settings
            </button>
            {onOpenOnboarding && (
              <button
                type="button"
                className="mp-btn-secondary"
                style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenOnboarding();
                }}
              >
                <Icon name="clipboard" size={15} strokeWidth={1.8} /> Review Onboarding
              </button>
            )}
            {onSwitchToCustomer && (
              <button
                type="button"
                className="mp-btn-secondary"
                style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
                onClick={() => {
                  setShowProfileMenu(false);
                  onSwitchToCustomer();
                }}
              >
                <Icon name="cart" size={15} strokeWidth={1.8} /> Switch to Customer Mode
              </button>
            )}
            <button
              type="button"
              className="mp-btn-secondary"
              style={{ width: "100%", justifyContent: "flex-start", color: "#dc2626", borderColor: "#fecaca" }}
              onClick={onLogout}
            >
              <Icon name="logout" size={15} strokeWidth={1.8} /> Logout
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
           MODULE CONTENT ROUTING (01 to 10)
           ───────────────────────────────────────────────────────────── */}
        <main className="mp-content-view">
          {/* =========================================================
             MODULE 01: DASHBOARD
             ========================================================= */}
          {activeModule === "dashboard" && (
            <div>
              <div className="dash-header-row">
                <div className="dash-greeting-box">
                  <h1>Namaste, {session.name ? session.name.split(" ")[0] : "Rajesh"}!</h1>
                  <p>Here's what's happening with your business today.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    onClick={() => setActiveModule("orders")}
                  >
                    View All Orders →
                  </button>
                  <button
                    type="button"
                    className="mp-btn-primary"
                    onClick={() => setShowAddProductModal(true)}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="dash-kpis-grid">
                <div className="dash-kpi-card highlight">
                  <div className="dash-kpi-icon-box">₹</div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">₹12,450</div>
                    <div className="dash-kpi-label">
                      <span>Today's Sales</span>
                      <span className="dash-kpi-growth">↑ 12%</span>
                    </div>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box" style={{ background: "#ecfdf5", color: "#059669" }}>
                    <Icon name="bag" size={24} strokeWidth={1.8} />
                  </div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">{orders.length}</div>
                    <div className="dash-kpi-label">
                      <span>Total Orders</span>
                      <span className="dash-kpi-growth">↑ 8%</span>
                    </div>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box" style={{ background: "#f0f9ff", color: "#0284c7" }}>
                    <Icon name="users" size={24} strokeWidth={1.8} />
                  </div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">86</div>
                    <div className="dash-kpi-label">
                      <span>Customers</span>
                      <span className="dash-kpi-growth">↑ 5%</span>
                    </div>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box" style={{ background: "#fef3c7", color: "#b45309" }}>
                    <Icon name="package" size={24} strokeWidth={1.8} />
                  </div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">{products.length}</div>
                    <div className="dash-kpi-label">
                      <span>Active Products</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Chart + AI Insights Row */}
              <div className="dash-charts-row">
                {/* Sales Chart */}
                <div className="mp-card dash-sales-card">
                  <div className="dash-card-header">
                    <span className="dash-card-title">Sales Overview</span>
                    <span className="mp-badge yellow">Weekly Trend</span>
                  </div>

                  <div className="sales-chart-wrapper">
                    {[
                      { day: "Mon", val: 8200, pct: 45 },
                      { day: "Tue", val: 9400, pct: 52 },
                      { day: "Wed", val: 11100, pct: 65 },
                      { day: "Thu", val: 10500, pct: 60 },
                      { day: "Fri", val: 13200, pct: 75 },
                      { day: "Sat", val: 15400, pct: 88 },
                      { day: "Sun", val: 12450, pct: 70, active: true },
                    ].map((col) => (
                      <div key={col.day} className="chart-bar-col">
                        <div
                          className={`chart-bar-fill ${col.active ? "active" : ""}`}
                          style={{ height: `${col.pct}%` }}
                          title={`${col.day}: ₹${col.val.toLocaleString()}`}
                        />
                        <span className="chart-bar-day">{col.day}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#64748b" }}>
                    <span>Avg Order Value: <strong>₹518</strong></span>
                    <span>Growth: <strong style={{ color: "#10b981" }}>+12.4% vs last week</strong></span>
                  </div>
                </div>

                {/* AI Insights Card */}
                <div className="dash-ai-card">
                  <div>
                    <span className="dash-ai-badge"><Icon name="sparkle" size={12} strokeWidth={2} /> KAROBAAR AI Insights</span>
                    <p className="dash-ai-text">
                      <Icon name="wheat" size={14} strokeWidth={1.8} /> <strong>Atta (5kg)</strong> is running low (6 left).<br /><br />
                      <Icon name="trendingUp" size={14} strokeWidth={1.8} /> Sales are up by <strong>12% this week</strong>.<br /><br />
                      <Icon name="lightbulb" size={14} strokeWidth={1.8} /> Consider a 10% weekend offer on daily essentials to boost repeat orders!
                    </p>
                  </div>
                  <button
                    type="button"
                    className="dash-ai-action-btn"
                  onClick={() => {
                    setAiWidgetOpen(true);
                    setAiWidgetExpanded(true);
                    handleSendAiMessage("What should I do to boost weekend sales?");
                  }}
                  >
                    <span><AIMascot headOnly size={17} /></span> Ask AI for Action →
                  </button>
                </div>
              </div>

              {/* Recent Orders Table & Low Stock Alerts */}
              <div className="dash-bottom-grid">
                <div className="mp-card">
                  <div className="dash-card-header">
                    <span className="dash-card-title">Recent Orders</span>
                    <button
                      type="button"
                      className="mp-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      onClick={() => setActiveModule("orders")}
                    >
                      View All
                    </button>
                  </div>

                  <div className="mp-table-wrapper">
                    <table className="mp-data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 4).map((ord) => (
                          <tr key={ord.id}>
                            <td style={{ fontWeight: 700 }}>{ord.id}</td>
                            <td>{ord.customerName}</td>
                            <td>{ord.itemsCount} items</td>
                            <td style={{ fontWeight: 800 }}>₹{ord.totalAmount}</td>
                            <td>
                              <span className={`mp-badge ${ord.paymentStatus === "Paid" ? "success" : "warning"}`}>
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`mp-badge ${
                                  ord.status === "new"
                                    ? "yellow"
                                    : ord.status === "delivered"
                                    ? "success"
                                    : "info"
                                }`}
                              >
                                {ord.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {ord.status === "new" ? (
                                <button
                                  type="button"
                                  className="mp-btn-primary"
                                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                                  onClick={() => updateOrderStatus(ord.id, "accepted")}
                                >
                                  Accept
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="mp-btn-secondary"
                                  style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                                  onClick={() => setSelectedOrder(ord)}
                                >
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inventory Alerts Box */}
                <div className="mp-card">
                  <div className="dash-card-header">
                    <span className="dash-card-title">Inventory Alerts</span>
                    <span className="mp-badge danger">Low Stock</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {products
                      .filter((p) => p.quantity <= p.threshold)
                      .map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            backgroundColor: "#fef2f2",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "1.3rem" }}><Icon name={p.icon as IconName} size={22} strokeWidth={1.7} /></span>
                            <div>
                              <strong style={{ fontSize: "0.85rem", display: "block" }}>{p.name}</strong>
                              <small style={{ color: "#dc2626", fontWeight: 700 }}>
                                {p.quantity === 0 ? "Out of Stock" : `Only ${p.quantity} units left`}
                              </small>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="mp-btn-primary"
                            style={{ padding: "6px 10px", fontSize: "0.76rem" }}
                            onClick={() => setShowUpdateStockModal(p)}
                          >
                            Restock
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 02: PRODUCTS
             ========================================================= */}
          {activeModule === "products" && (
            <div>
              <div className="module-toolbar">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Product Catalogue</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Total {products.length} products listed in your digital storefront
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    onClick={() => {
                      showToast("Bulk Excel template downloaded!");
                    }}
                  >
                    <Icon name="upload" size={15} strokeWidth={1.8} /> Bulk Import
                  </button>
                  <button
                    type="button"
                    className="mp-btn-primary"
                    onClick={() => setShowAddProductModal(true)}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {/* Table of Products */}
              <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="mp-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>MRP</th>
                      <th>Stock Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="product-name-col">
                            <span className="product-thumb"><Icon name={item.icon as IconName} size={22} strokeWidth={1.7} /></span>
                            <div>
                              <span className="product-item-title">{item.name}</span>
                              <span className="product-item-sku">SKU: {item.id.toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="mp-badge info">{item.category}</span>
                        </td>
                        <td style={{ fontWeight: 800 }}>₹{item.price}</td>
                        <td style={{ color: "#94a3b8", textDecoration: "line-through" }}>₹{item.mrp}</td>
                        <td>
                          <strong style={{ color: item.quantity <= item.threshold ? "#dc2626" : "#0f172a" }}>
                            {item.quantity} units
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`mp-badge ${
                              item.status === "Active"
                                ? "success"
                                : item.status === "Low Stock"
                                ? "warning"
                                : "danger"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="mp-btn-secondary"
                              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                              onClick={() => setSelectedProduct(item)}
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              className="mp-btn-primary"
                              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                              onClick={() => setShowUpdateStockModal(item)}
                            >
                              Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 03: ORDERS
             ========================================================= */}
          {activeModule === "orders" && (
            <div>
              <div className="module-toolbar">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Customer Orders</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Manage live orders from placement to final doorstep delivery
                  </p>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="order-status-tabs">
                {[
                  { key: "all", label: `All (${orders.length})` },
                  { key: "new", label: `New (${orders.filter((o) => o.status === "new").length})` },
                  { key: "accepted", label: `Accepted (${orders.filter((o) => o.status === "accepted").length})` },
                  { key: "preparing", label: `Preparing (${orders.filter((o) => o.status === "preparing").length})` },
                  { key: "ready", label: `Ready for Pickup (${orders.filter((o) => o.status === "ready").length})` },
                  { key: "dispatched", label: `Dispatched (${orders.filter((o) => o.status === "dispatched").length})` },
                  { key: "delivered", label: `Delivered (${orders.filter((o) => o.status === "delivered").length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`order-tab-btn ${orderFilter === tab.key ? "active" : ""}`}
                    onClick={() => setOrderFilter(tab.key as OrderStatus)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="mp-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer & Address</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Delivery Type</th>
                      <th>Stage Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: 800 }}>{ord.id}</td>
                        <td>
                          <div>
                            <strong>{ord.customerName}</strong>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{ord.customerAddress}</div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{ord.itemsCount} items</span>
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            {ord.items.map((i) => i.name).slice(0, 2).join(", ")}
                            {ord.items.length > 2 ? "..." : ""}
                          </div>
                        </td>
                        <td style={{ fontWeight: 800 }}>₹{ord.totalAmount}</td>
                        <td>
                          <span className={`mp-badge ${ord.paymentStatus === "Paid" ? "success" : "warning"}`}>
                            {ord.paymentMethod} • {ord.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className="mp-badge info">{ord.deliveryType.toUpperCase()}</span>
                        </td>
                        <td>
                          <span
                            className={`mp-badge ${
                              ord.status === "new"
                                ? "yellow"
                                : ord.status === "delivered"
                                ? "success"
                                : "info"
                            }`}
                          >
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="mp-btn-secondary"
                              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                              onClick={() => setSelectedOrder(ord)}
                            >
                              Track
                            </button>
                            {ord.status === "new" && (
                              <button
                                type="button"
                                className="mp-btn-primary"
                                style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                                onClick={() => updateOrderStatus(ord.id, "accepted")}
                              >
                                Accept
                              </button>
                            )}
                            {ord.status === "accepted" && (
                              <button
                                type="button"
                                className="mp-btn-primary"
                                style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                                onClick={() => updateOrderStatus(ord.id, "preparing")}
                              >
                                Pack
                              </button>
                            )}
                            {ord.status === "preparing" && (
                              <button
                                type="button"
                                className="mp-btn-primary"
                                style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                                onClick={() => updateOrderStatus(ord.id, "dispatched")}
                              >
                                Dispatch
                              </button>
                            )}
                            {ord.status === "dispatched" && (
                              <button
                                type="button"
                                className="mp-btn-primary"
                                style={{ padding: "6px 12px", fontSize: "0.78rem", backgroundColor: "#10b981", color: "#fff" }}
                                onClick={() => updateOrderStatus(ord.id, "delivered")}
                              >
                                Deliver ✓
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 04: INVENTORY
             ========================================================= */}
          {activeModule === "inventory" && (
            <div>
              <div className="dash-header-row">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Stock & Inventory Management</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Monitor inventory levels, record restocks, and avoid stock-outs
                  </p>
                </div>
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => {
                    setAiWidgetOpen(true);
                    setAiWidgetExpanded(true);
                    handleSendAiMessage("Show products with less than 10 units in stock");
                  }}
                >
                  <AIMascot headOnly size={17} /> AI Stock Audit
                </button>
              </div>

              {/* 4 Stats Cards */}
              <div className="inventory-stats-bar">
                <div className="inv-stat-card">
                  <div style={{ fontSize: "1.8rem" }}><Icon name="package" size={26} strokeWidth={1.8} /></div>
                  <div>
                    <div className="inv-stat-num">{products.reduce((acc, p) => acc + p.quantity, 0)}</div>
                    <div className="inv-stat-label">Total Stock Units</div>
                  </div>
                </div>

                <div className="inv-stat-card">
                  <div style={{ fontSize: "1.8rem" }}><Icon name="checkCircle" size={26} strokeWidth={1.8} /></div>
                  <div>
                    <div className="inv-stat-num">{products.filter((p) => p.quantity > p.threshold).length}</div>
                    <div className="inv-stat-label">In-Stock Products</div>
                  </div>
                </div>

                <div className="inv-stat-card" style={{ borderColor: "#fde047", background: "#fefce8" }}>
                  <div style={{ fontSize: "1.8rem" }}><Icon name="alert" size={26} strokeWidth={1.8} /></div>
                  <div>
                    <div className="inv-stat-num" style={{ color: "#d97706" }}>
                      {products.filter((p) => p.quantity <= p.threshold && p.quantity > 0).length}
                    </div>
                    <div className="inv-stat-label">Low Stock Alerts</div>
                  </div>
                </div>

                <div className="inv-stat-card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
                  <div style={{ fontSize: "1.8rem" }}><Icon name="ban" size={26} strokeWidth={1.8} /></div>
                  <div>
                    <div className="inv-stat-num" style={{ color: "#dc2626" }}>
                      {products.filter((p) => p.quantity === 0).length}
                    </div>
                    <div className="inv-stat-label">Out of Stock</div>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="mp-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
                <table className="mp-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Available Stock</th>
                      <th>Minimum Threshold</th>
                      <th>Stock Health Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-name-col">
                            <span className="product-thumb"><Icon name={p.icon as IconName} size={22} strokeWidth={1.7} /></span>
                            <div>
                              <strong className="product-item-title">{p.name}</strong>
                              <span className="product-item-sku">₹{p.price} / unit</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "1.05rem", fontWeight: 800 }}>{p.quantity} units</span>
                        </td>
                        <td>{p.threshold} units</td>
                        <td>
                          <span
                            className={`mp-badge ${
                              p.quantity > p.threshold ? "success" : p.quantity === 0 ? "danger" : "warning"
                            }`}
                          >
                            {p.quantity > p.threshold
                              ? "Normal"
                              : p.quantity === 0
                              ? "Out of Stock"
                              : "Low Stock"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="mp-btn-primary"
                            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                            onClick={() => setShowUpdateStockModal(p)}
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stock Movement History */}
              <div className="mp-card">
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginTop: 0, marginBottom: 14 }}>
                  Recent Stock Adjustments & Audit Trail
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stockHistory.map((sh) => (
                    <div
                      key={sh.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div>
                        <strong>{sh.productName}</strong>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          Reason: {sh.reason} • Recorded by {sh.by}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong
                          style={{
                            color: sh.change.startsWith("+") ? "#10b981" : "#ef4444",
                            fontSize: "0.95rem",
                          }}
                        >
                          {sh.change}
                        </strong>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{sh.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 05: PAYMENTS
             ========================================================= */}
          {activeModule === "payments" && (
            <div>
              <div className="dash-header-row">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Earnings, Settlements & Paytm QR</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Track all customer collections, gateway settlements, and payouts
                  </p>
                </div>
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => showToast("Settlement initiated to HDFC Bank!")}
                >
                  <Icon name="zap" size={15} strokeWidth={1.8} /> Instant Bank Payout
                </button>
              </div>

              <div className="payments-banner-grid">
                <div className="pay-card">
                  <div className="pay-title">Total Sales (Gross)</div>
                  <div className="pay-amount">₹1,24,500</div>
                  <span className="mp-badge success">↑ 18% this month</span>
                </div>

                <div className="pay-card" style={{ borderColor: "#fde047", background: "#fefce8" }}>
                  <div className="pay-title">Received (Settled)</div>
                  <div className="pay-amount" style={{ color: "#854d0e" }}>₹1,18,760</div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Transferred to Bank</span>
                </div>

                <div className="pay-card">
                  <div className="pay-title">Pending Settlement</div>
                  <div className="pay-amount" style={{ color: "#0284c7" }}>₹5,740</div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Next payout tomorrow</span>
                </div>

                <div className="pay-card">
                  <div className="pay-title">Total Refunds</div>
                  <div className="pay-amount" style={{ color: "#64748b" }}>₹1,200</div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>2 order cancellations</span>
                </div>
              </div>

              {/* Paytm All-in-One QR Banner */}
              <div
                className="mp-card"
                style={{
                  background: "linear-gradient(135deg, #002e6e 0%, #00b9f1 100%)",
                  color: "#ffffff",
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 24,
                }}
              >
                <div>
                  <span style={{ background: "#ffffff", color: "#002e6e", padding: "4px 10px", borderRadius: 999, fontWeight: 800, fontSize: "0.76rem" }}>
                    Paytm Business Verified
                  </span>
                  <h3 style={{ fontSize: "1.3rem", margin: "10px 0 4px 0", fontWeight: 800 }}>
                    Paytm All-In-One QR Integration Active
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: "0.88rem" }}>
                    Merchant VPA: <strong>rajesh.kirana@paytm</strong> • Bank Account: <strong>HDFC Bank •••• 4821</strong>
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    backgroundColor: "#facc15",
                    color: "#000000",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                  onClick={() => showToast("Paytm Soundbox status: Active & Online")}
                >
                  <Icon name="speaker" size={16} strokeWidth={1.8} /> Soundbox Status
                </button>
              </div>

              {/* Transaction Table */}
              <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
                  <strong style={{ fontSize: "1.05rem" }}>Recent Customer Transactions</strong>
                </div>
                <table className="mp-data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700 }}>{t.id}</td>
                        <td>{t.orderId}</td>
                        <td>{t.customer}</td>
                        <td style={{ fontWeight: 800 }}>₹{t.amount}</td>
                        <td>
                          <span className="mp-badge info">{t.method}</span>
                        </td>
                        <td style={{ color: "#64748b" }}>{t.date}</td>
                        <td>
                          <span className="mp-badge success">{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 06: CUSTOMERS
             ========================================================= */}
          {activeModule === "customers" && (
            <div>
              <div className="dash-header-row">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Customer Profiles & Loyalty</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    View repeat shoppers, customer spending history, and ratings
                  </p>
                </div>
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => {
                    showToast("Opening WhatsApp Offer Creator for loyal customers");
                  }}
                >
                  <Icon name="megaphone" size={15} strokeWidth={1.8} /> Broadcast WhatsApp Offer
                </button>
              </div>

              {/* 4 Customer Stats */}
              <div className="cust-metrics-grid">
                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box"><Icon name="users" size={24} strokeWidth={1.8} /></div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">{customers.length + 81}</div>
                    <div className="dash-kpi-label">Total Customers</div>
                  </div>
                </div>

                <div className="dash-kpi-card highlight">
                  <div className="dash-kpi-icon-box" style={{ background: "#ecfdf5", color: "#059669" }}><Icon name="star" size={24} strokeWidth={1.8} /></div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">52</div>
                    <div className="dash-kpi-label">Repeat Buyers (68%)</div>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box" style={{ background: "#fef3c7", color: "#b45309" }}><Icon name="bag" size={24} strokeWidth={1.8} /></div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">₹1,446</div>
                    <div className="dash-kpi-label">Avg Order Value</div>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="dash-kpi-icon-box" style={{ background: "#f0f9ff", color: "#0284c7" }}><Icon name="heart" size={24} strokeWidth={1.8} /></div>
                  <div className="dash-kpi-body">
                    <div className="dash-kpi-value">4.9 / 5</div>
                    <div className="dash-kpi-label">Merchant Rating</div>
                  </div>
                </div>
              </div>

              {/* Customer Directory Table */}
              <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="mp-data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Total Orders</th>
                      <th>Total Spend</th>
                      <th>Last Order Date</th>
                      <th>Customer Type</th>
                      <th>Customer Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              {c.phone} • {c.address}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{c.totalOrders} orders</td>
                        <td style={{ fontWeight: 800 }}>₹{c.totalSpend.toLocaleString()}</td>
                        <td style={{ color: "#64748b" }}>{c.lastOrderDate}</td>
                        <td>
                          <span
                            className={`mp-badge ${
                              c.type === "Frequent"
                                ? "yellow"
                                : c.type === "Repeat"
                                ? "success"
                                : "info"
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td>
                          {c.review ? (
                            <div style={{ fontSize: "0.78rem" }}>
                              <span style={{ color: "#eab308" }}>{"★".repeat(c.rating || 5)}</span>
                              <span style={{ color: "#475569", marginLeft: 4 }}>"{c.review}"</span>
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>No review yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 07: SHOP MANAGEMENT
             ========================================================= */}
          {activeModule === "shop" && (
            <div>
              <div className="dash-header-row">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Digital Storefront & Shop Settings</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Customize your public shop page in the KAROBAAR Customer App
                  </p>
                </div>
                {onSwitchToCustomer && (
                  <button
                    type="button"
                    className="mp-btn-primary"
                    onClick={onSwitchToCustomer}
                  >
                    <Icon name="eye" size={15} strokeWidth={1.8} /> Preview Customer View
                  </button>
                )}
              </div>

              {/* Storefront Visual Banner Card */}
              <div className="shop-banner-card">
                <div className="shop-cover-photo">
                  <Icon name="store" size={56} strokeWidth={1.2} />
                </div>
                <div className="shop-profile-body">
                  <div className="shop-meta-left">
                    <div className="shop-avatar-large"><Icon name="cart" size={26} strokeWidth={1.8} /></div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>{shopName}</h2>
                        <span className="mp-badge success">Active Store</span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                        Grocery • Daily Essentials • Indiranagar, Bengaluru
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="mp-btn-secondary"
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://karobaar.in/shop/${session.userId || "rajesh-kirana"}`);
                        showToast("Public store link copied to clipboard!");
                      }}
                    >
                      <Icon name="link" size={15} strokeWidth={1.8} /> Copy Link
                    </button>
                    <button
                      type="button"
                      className="mp-btn-primary"
                      onClick={() => showToast("Store QR Code generated & downloaded!")}
                    >
                      <Icon name="qr" size={15} strokeWidth={1.8} /> Download QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Store Configuration Tiles */}
              <div className="shop-settings-grid">
                <div
                  className="shop-nav-tile"
                  onClick={() => showToast("Opening Store Profile Editor")}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="tile-icon-box"><Icon name="store" size={22} strokeWidth={1.8} /></div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>Shop Profile</strong>
                      <small style={{ color: "#64748b" }}>Store name, description, address, category</small>
                    </div>
                  </div>
                  <span><Icon name="arrowRight" size={15} strokeWidth={1.8} /></span>
                </div>

                <div
                  className="shop-nav-tile"
                  onClick={() => showToast("Opening Storefront Customizer")}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="tile-icon-box"><Icon name="palette" size={22} strokeWidth={1.8} /></div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>Storefront Customization</strong>
                      <small style={{ color: "#64748b" }}>Upload store logo, hero banner, featured shelves</small>
                    </div>
                  </div>
                  <span><Icon name="arrowRight" size={15} strokeWidth={1.8} /></span>
                </div>

                <div
                  className="shop-nav-tile"
                  onClick={() => showToast("Operating Hours: Mon - Sun (8:00 AM - 10:00 PM)")}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="tile-icon-box"><Icon name="clock" size={22} /></div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>Business Operating Hours</strong>
                      <small style={{ color: "#64748b" }}>Open daily: 8:00 AM – 10:00 PM</small>
                    </div>
                  </div>
                  <span><Icon name="arrowRight" size={15} strokeWidth={1.8} /></span>
                </div>

                <div
                  className="shop-nav-tile"
                  onClick={() => showToast(`Delivery: ₹${deliveryFee} | Free above ₹${freeDeliveryAbove}`)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="tile-icon-box"><Icon name="truck" size={22} strokeWidth={1.8} /></div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>Delivery & Pickup Policies</strong>
                      <small style={{ color: "#64748b" }}>Doorstep delivery & Counter pickup enabled</small>
                    </div>
                  </div>
                  <span><Icon name="arrowRight" size={15} strokeWidth={1.8} /></span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             MODULE 08: SETTINGS (Matching Screen 10 in image)
             ========================================================= */}
          {activeModule === "settings" && (
            <div>
              <div className="dash-header-row">
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Account, Preferences & Support</h1>
                  <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.88rem" }}>
                    Manage merchant account profile, business documents, and app settings
                  </p>
                </div>
              </div>

              <div className="settings-grid">
                {/* 1. Account Settings */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Account: Rajesh Kumar • +91 9876543210")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="user" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Account Settings</span>
                  </div>
                  <p className="setting-card-desc">Profile, mobile number, email, password</p>
                </div>

                {/* 2. Business Account */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Business Account: GSTIN & Verification Verified")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="clipboard" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Business Account</span>
                  </div>
                  <p className="setting-card-desc">Business details, GSTIN, verified credentials</p>
                </div>

                {/* 3. Notifications */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Push, SMS & WhatsApp notifications enabled")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="bell" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Notifications</span>
                  </div>
                  <p className="setting-card-desc">Order, payment alerts, and soundbox settings</p>
                </div>

                {/* 4. Language & Accessibility */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Language: English, Hindi (हिंदी), Marathi (मराठी) supported")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="globe" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Language & Accessibility</span>
                  </div>
                  <p className="setting-card-desc">English, Hindi, Marathi, text & voice accents</p>
                </div>

                {/* 5. Security & Privacy */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Active Sessions: 1 device • Encrypted 256-bit")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="lock" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Security & Privacy</span>
                  </div>
                  <p className="setting-card-desc">Login, devices, 2FA, data privacy</p>
                </div>

                {/* 6. Help & Support */}
                <div
                  className="setting-card"
                  onClick={() => showToast("Calling Helpline: 1800-KAROBAAR (toll-free)")}
                >
                  <div className="setting-card-header">
                    <div className="setting-icon-box"><Icon name="message" size={21} strokeWidth={1.8} /></div>
                    <span className="setting-card-title">Help & Support</span>
                  </div>
                  <p className="setting-card-desc">FAQs, contact helpline, raise tickets</p>
                </div>
              </div>

              {/* Account Actions Section */}
              <div className="mp-card" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginTop: 0, marginBottom: 14 }}>
                  Account Actions
                </h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {onSwitchToCustomer && (
                    <button
                      type="button"
                      className="mp-btn-primary"
                      onClick={onSwitchToCustomer}
                    >
                      <Icon name="cart" size={15} strokeWidth={1.8} /> Switch to Customer Mode
                    </button>
                  )}
                  {onOpenOnboarding && (
                    <button
                      type="button"
                      className="mp-btn-secondary"
                      onClick={onOpenOnboarding}
                    >
                      <Icon name="clipboard" size={15} strokeWidth={1.8} /> Re-run Merchant Onboarding
                    </button>
                  )}
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    onClick={onReplayIntro}
                  >
                    <Icon name="zap" size={15} strokeWidth={1.8} /> Replay Intro Film
                  </button>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    style={{ color: "#dc2626", borderColor: "#fecaca" }}
                    onClick={onLogout}
                  >
                    <Icon name="logout" size={15} strokeWidth={1.8} /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         PERSISTENT FLOATING AI ASSISTANT (available on every screen)
         Collapsed: robot FAB → Open: popup chat → Expanded: side panel
         ───────────────────────────────────────────────────────────── */}
      <AiAssistantWidget
        open={aiWidgetOpen}
        expanded={aiWidgetExpanded}
        chatHistory={aiChatHistory}
        inputText={aiInputText}
        isListening={isAiListening}
        speechState={aiSpeechState}
        isSpeaking={isAiSpeaking}
        voiceMuted={aiVoiceMuted}
        pendingAction={pendingAiAction}
        onOpenChange={(next) => {
          setAiWidgetOpen(next);
          if (!next) stopAiSpeaking();
        }}
        onExpandedChange={setAiWidgetExpanded}
        onInputChange={setAiInputText}
        onSend={handleSendAiMessage}
        onToggleMic={handleToggleVoiceMic}
        onToggleMute={handleToggleAiMute}
        onStopSpeaking={stopAiSpeaking}
        onConfirmAction={() => {
          if (pendingAiAction) {
            pendingAiAction.apply();
            setPendingAiAction(null);
          }
        }}
        onDismissAction={() => setPendingAiAction(null)}
      />

      {/* ─────────────────────────────────────────────────────────────
         MOBILE BOTTOM NAVIGATION (Matching Reference Blueprint)
         ───────────────────────────────────────────────────────────── */}
      <nav className="mp-mobile-bottom-nav">
        <button
          type="button"
          className={`mp-mobile-nav-btn ${activeModule === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveModule("dashboard")}
        >
          <span className="mobile-icon"><Icon name="chart" size={18} strokeWidth={1.8} /></span>
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`mp-mobile-nav-btn ${activeModule === "products" ? "active" : ""}`}
          onClick={() => setActiveModule("products")}
        >
          <span className="mobile-icon"><Icon name="package" size={18} strokeWidth={1.8} /></span>
          <span>Products</span>
        </button>
        <button
          type="button"
          className="mp-mobile-nav-center-ai"
          onClick={() => {
            setAiWidgetOpen(true);
            handleToggleVoiceMic();
          }}
          title="KAROBAAR AI"
        >
          <Icon name="mic" size={20} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className={`mp-mobile-nav-btn ${activeModule === "orders" ? "active" : ""}`}
          onClick={() => setActiveModule("orders")}
        >
          <span className="mobile-icon"><Icon name="bag" size={18} strokeWidth={1.8} /></span>
          <span>Orders</span>
        </button>
        <button
          type="button"
          className={`mp-mobile-nav-btn ${activeModule === "settings" ? "active" : ""}`}
          onClick={() => setActiveModule("settings")}
        >
          <span className="mobile-icon"><Icon name="settings" size={18} strokeWidth={1.8} /></span>
          <span>Settings</span>
        </button>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
         MODALS & INTERACTIVE OVERLAYS
         ───────────────────────────────────────────────────────────── */}

      {/* 1. ORDER DETAILS & TRACKING MODAL */}
      {selectedOrder && (
        <div className="mp-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <div>
                <h3 className="mp-modal-title">Order {selectedOrder.id} Details</h3>
                <small style={{ color: "#64748b" }}>Placed {selectedOrder.createdAt}</small>
              </div>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mp-modal-body">
              {/* Order Stepper */}
              <div className="order-timeline-stepper">
                {[
                  { key: "new", label: "Placed" },
                  { key: "accepted", label: "Accepted" },
                  { key: "preparing", label: "Preparing" },
                  { key: "ready", label: "Ready" },
                  { key: "dispatched", label: "Dispatched" },
                  { key: "delivered", label: "Delivered" },
                ].map((step, idx) => {
                  const stepOrder = ["new", "accepted", "preparing", "ready", "dispatched", "delivered"];
                  const currentIdx = stepOrder.indexOf(selectedOrder.status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  return (
                    <div
                      key={step.key}
                      className={`timeline-step ${isDone ? "completed" : ""} ${isCurrent ? "active" : ""}`}
                    >
                      <div className="timeline-circle">{isDone ? "✓" : idx + 1}</div>
                      <span className="timeline-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Customer Info */}
              <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 10, marginBottom: 16 }}>
                <strong>Customer: {selectedOrder.customerName}</strong>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Phone: {selectedOrder.customerPhone}<br />
                  Delivery Address: {selectedOrder.customerAddress}
                </div>
              </div>

              {/* Itemized List */}
              <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: 8 }}>Order Items</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                    }}
                  >
                    <span><Icon name={item.icon as IconName} size={14} strokeWidth={1.7} /> {item.name} × {item.qty}</span>
                    <strong>₹{item.price * item.qty}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <span>Final Total:</span>
                <span>₹{selectedOrder.totalAmount} ({selectedOrder.paymentMethod})</span>
              </div>
            </div>

            <div className="mp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => {
                  setShowInvoiceModal(selectedOrder);
                }}
              >
                <Icon name="receipt" size={15} /> Print Invoice
              </button>
              {selectedOrder.status === "new" && (
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => updateOrderStatus(selectedOrder.id, "accepted")}
                >
                  Accept Order
                </button>
              )}
              {selectedOrder.status === "accepted" && (
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => updateOrderStatus(selectedOrder.id, "preparing")}
                >
                  Start Packing
                </button>
              )}
              {selectedOrder.status === "preparing" && (
                <button
                  type="button"
                  className="mp-btn-primary"
                  onClick={() => updateOrderStatus(selectedOrder.id, "dispatched")}
                >
                  Mark Dispatched
                </button>
              )}
              {selectedOrder.status === "dispatched" && (
                <button
                  type="button"
                  className="mp-btn-primary"
                  style={{ backgroundColor: "#10b981", color: "#fff" }}
                  onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                >
                  Confirm Delivery ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD PRODUCT MODAL (Camera / Voice AI / Manual) */}
      {showAddProductModal && (
        <div className="mp-modal-backdrop" onClick={() => setShowAddProductModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">Add New Product</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowAddProductModal(false)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mp-modal-body">
              {/* Creation Method Pills */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  className={`mp-btn-${addProductMode === "manual" ? "primary" : "secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setAddProductMode("manual")}
                >
                  <Icon name="pen" size={15} /> Manual Form
                </button>
                <button
                  type="button"
                  className={`mp-btn-${addProductMode === "camera" ? "primary" : "secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => {
                    setAddProductMode("camera");
                    showToast("Barcode camera scanner activated!");
                  }}
                >
                  <Icon name="camera" size={15} /> Camera Scan
                </button>
                <button
                  type="button"
                  className={`mp-btn-${addProductMode === "voice" ? "primary" : "secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => {
                    setAddProductMode("voice");
                    showToast("Voice AI: Boliye product ka naam aur price!");
                  }}
                >
                  <Icon name="mic" size={15} /> Voice AI
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Product Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortune Kachi Ghani Mustard Oil (1L)"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Category
                    </label>
                    <select
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value)}
                      className="mp-select"
                      style={{ width: "100%" }}
                    >
                      <option value="Grocery">Grocery & Staples</option>
                      <option value="Dairy">Dairy & Eggs</option>
                      <option value="Snacks">Snacks & Biscuits</option>
                      <option value="Beverages">Beverages & Tea</option>
                      <option value="Cleaning">Household & Cleaning</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newProdQty}
                      onChange={(e) => setNewProdQty(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProdMrp}
                      onChange={(e) => setNewProdMrp(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div className="mp-modal-footer" style={{ margin: "16px -24px -24px -24px" }}>
                  <button
                    type="button"
                    className="mp-btn-secondary"
                    onClick={() => setShowAddProductModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="mp-btn-primary">
                    Publish Product ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. UPDATE STOCK MODAL */}
      {showUpdateStockModal && (
        <div className="mp-modal-backdrop" onClick={() => setShowUpdateStockModal(null)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">Update Stock: {showUpdateStockModal.name}</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowUpdateStockModal(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <form onSubmit={handleStockUpdateSubmit}>
              <div className="mp-modal-body">
                <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: 10, marginBottom: 16 }}>
                  <span>Current On-Hand Stock: </span>
                  <strong style={{ fontSize: "1.2rem" }}>{showUpdateStockModal.quantity} units</strong>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button
                    type="button"
                    className={`mp-btn-${stockAdjType === "add" ? "primary" : "secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setStockAdjType("add");
                      setStockAdjReason("Wholesale Restock");
                    }}
                  >
                    + Add Inward Stock
                  </button>
                  <button
                    type="button"
                    className={`mp-btn-${stockAdjType === "reduce" ? "primary" : "secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setStockAdjType("reduce");
                      setStockAdjReason("Manual Correction / Sales");
                    }}
                  >
                    - Reduce Stock
                  </button>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Quantity to Adjust
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={stockAdjQty}
                    onChange={(e) => setStockAdjQty(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Reason / Notes
                  </label>
                  <input
                    type="text"
                    value={stockAdjReason}
                    onChange={(e) => setStockAdjReason(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="mp-modal-footer">
                <button
                  type="button"
                  className="mp-btn-secondary"
                  onClick={() => setShowUpdateStockModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="mp-btn-primary">
                  Save Stock Adjustment ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. INVOICE PREVIEW MODAL */}
      {showInvoiceModal && (
        <div className="mp-modal-backdrop" onClick={() => setShowInvoiceModal(null)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">Tax Invoice {showInvoiceModal.id}</h3>
              <button
                type="button"
                className="mp-modal-close-btn"
                onClick={() => setShowInvoiceModal(null)}
              >
                <Icon name="x" size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="mp-modal-body" style={{ backgroundColor: "#ffffff" }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: "1.4rem" }}>{shopName}</h2>
                <small style={{ color: "#64748b" }}>{shopAddress} • GSTIN: 29ABCDE1234F1Z5</small>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: "0.85rem" }}>
                <div>
                  <strong>Billed To:</strong><br />
                  {showInvoiceModal.customerName}<br />
                  {showInvoiceModal.customerPhone}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Invoice No:</strong> INV-{showInvoiceModal.id.replace("#", "")}<br />
                  <strong>Date:</strong> {showInvoiceModal.createdAt}
                </div>
              </div>

              <table className="mp-data-table" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {showInvoiceModal.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>{it.qty}</td>
                      <td>₹{it.price}</td>
                      <td>₹{it.qty * it.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: "right", fontSize: "1.1rem", fontWeight: 800 }}>
                Grand Total: ₹{showInvoiceModal.totalAmount}
              </div>
            </div>

            <div className="mp-modal-footer">
              <button
                type="button"
                className="mp-btn-secondary"
                onClick={() => setShowInvoiceModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="mp-btn-primary"
                onClick={() => {
                  window.print();
                  showToast("Invoice ready for printing!");
                }}
              >
                <Icon name="printer" size={15} /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         GLOBAL TOAST NOTIFICATION
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
export default MerchantPortal;

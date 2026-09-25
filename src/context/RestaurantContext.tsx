import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem, Order, OrderStatus, WaiterCall } from '../types/restaurant';
import { RESTAURANT_INFO } from '../data/menuData';

interface RestaurantContextType {
  currentTable: string;
  setCurrentTable: (table: string) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Real-time Orders
  orders: Order[];
  activeOrder: Order | null;
  createOrder: (data: {
    customerName: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod: Order['paymentMethod'];
    orderType: 'dine_in' | 'takeaway';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  // Waiter calls
  waiterCalls: WaiterCall[];
  callWaiter: (reason: WaiterCall['reason']) => Promise<void>;
  resolveWaiterCall: (id: string) => Promise<void>;

  // Views & Modals
  currentView: 'menu' | 'tracking' | 'kitchen';
  setCurrentView: (view: 'menu' | 'tracking' | 'kitchen') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWaiterModalOpen: boolean;
  setIsWaiterModalOpen: (open: boolean) => void;

  // Connectivity status
  isOnline: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Web Audio notification chime
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // Audio autoplay restrictions
  }
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect table from URL parameter (?table=4)
  const [currentTable, setCurrentTableState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('table') || params.get('t');
      if (t) {
        return t.toLowerCase().startsWith('table') ? t : `Table ${t}`;
      }
      const saved = localStorage.getItem('el_maestro_table');
      if (saved) return saved;
    }
    return 'Table 1';
  });

  const setCurrentTable = (table: string) => {
    setCurrentTableState(table);
    if (typeof window !== 'undefined') {
      localStorage.setItem('el_maestro_table', table);
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('el_maestro_cart');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('el_maestro_active_order_id');
    }
    return null;
  });

  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [currentView, setCurrentView] = useState<'menu' | 'tracking' | 'kitchen'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const initialLoadRef = useRef(true);
  const previousOrdersCountRef = useRef(0);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('el_maestro_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync active order id
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('el_maestro_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('el_maestro_active_order_id');
    }
  }, [activeOrderId]);

  // Real-time Firestore sync for Orders
  useEffect(() => {
    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          setIsOnline(true);
          const fetchedOrders: Order[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            let items: CartItem[] = [];
            if (typeof data.items === 'string') {
              try {
                items = JSON.parse(data.items);
              } catch {
                items = [];
              }
            } else if (Array.isArray(data.items)) {
              items = data.items;
            }

            return {
              id: docSnap.id,
              orderNumber: data.orderNumber || docSnap.id.slice(-6).toUpperCase(),
              tableNumber: data.tableNumber || 'Table 1',
              orderType: data.orderType || 'dine_in',
              customerName: data.customerName || 'Client',
              customerPhone: data.customerPhone,
              items,
              totalAmount: Number(data.totalAmount || 0),
              status: (data.status as OrderStatus) || 'pending',
              paymentMethod: data.paymentMethod || 'cash_table',
              notes: data.notes,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || Date.now(),
            };
          });

          // Play chime if new order arrived while not initial load
          if (!initialLoadRef.current && fetchedOrders.length > previousOrdersCountRef.current) {
            playNotificationSound();
          }
          initialLoadRef.current = false;
          previousOrdersCountRef.current = fetchedOrders.length;

          setOrders(fetchedOrders);
        },
        error => {
          console.warn('Firestore orders sync failed, falling back to local storage:', error);
          setIsOnline(false);
          const saved = localStorage.getItem('el_maestro_orders');
          if (saved) {
            try {
              setOrders(JSON.parse(saved));
            } catch {
              // fallback
            }
          }
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase init error for orders:', err);
      setIsOnline(false);
    }
  }, []);

  // Real-time Firestore sync for Waiter Calls
  useEffect(() => {
    try {
      const callsCol = collection(db, 'waiterCalls');
      const qCalls = query(callsCol, orderBy('createdAt', 'desc'), limit(20));

      const unsubscribeCalls = onSnapshot(
        qCalls,
        snapshot => {
          const fetchedCalls: WaiterCall[] = snapshot.docs
            .map(docSnap => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                tableNumber: data.tableNumber,
                reason: data.reason,
                status: data.status,
                createdAt: data.createdAt,
              };
            })
            .filter(c => c.status === 'pending');

          setWaiterCalls(fetchedCalls);
        },
        error => {
          console.warn('Firestore waiterCalls sync error:', error);
        }
      );

      return () => unsubscribeCalls();
    } catch (err) {
      console.warn('Firebase init error for waiterCalls:', err);
    }
  }, []);

  // Active order object
  const activeOrder = orders.find(o => o.id === activeOrderId) || null;

  const addToCart = (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => {
    playNotificationSound();
    setCart(prev => {
      const unitTotal = item.unitPrice + (item.optionsPrice || 0);
      const existingIdx = prev.findIndex(
        i =>
          i.menuItemId === item.menuItemId &&
          i.variantName === item.variantName &&
          JSON.stringify(i.selectedOptions || []) === JSON.stringify(item.selectedOptions || []) &&
          i.specialInstructions === item.specialInstructions
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + item.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitTotal,
        };
        return updated;
      }

      const newItem: CartItem = {
        ...item,
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        totalPrice: item.quantity * unitTotal,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitTotal = item.unitPrice + (item.optionsPrice || 0);
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * unitTotal,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Helper to fallback to WhatsApp if Firestore has an issue
  const openWhatsAppFallback = (orderPayload: Order) => {
    const itemsSummary = orderPayload.items
      .map(
        i =>
          `- ${i.quantity}x ${i.name} ${i.variantName ? `(${i.variantName})` : ''} : ${(
            i.totalPrice
          ).toLocaleString()} FCFA ${i.specialInstructions ? `[${i.specialInstructions}]` : ''}`
      )
      .join('\n');

    const paymentLabel =
      orderPayload.paymentMethod === 'cash_table'
        ? 'Au serveur à table (Espèces)'
        : orderPayload.paymentMethod === 'mobile_money'
        ? 'Mobile Money (MTN / Moov)'
        : 'En caisse';

    const msg = `Bonjour El Maestro,\n\nCommande depuis la table : *${orderPayload.tableNumber}*\nClient : ${
      orderPayload.customerName
    }\n\n*Articles :*\n${itemsSummary}\n\n*Total : ${orderPayload.totalAmount.toLocaleString()} FCFA*\nRèglement : ${paymentLabel}${
      orderPayload.notes ? `\nNote : ${orderPayload.notes}` : ''
    }`;

    window.open(`https://wa.me/${RESTAURANT_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Create order: Option 2 (Firestore) with automatic fallback to Option 1 (WhatsApp)
  const createOrder = async (data: {
    customerName: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod: Order['paymentMethod'];
    orderType: 'dine_in' | 'takeaway';
  }): Promise<Order> => {
    const orderNum = `EM-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: tempId,
      orderNumber: orderNum,
      tableNumber: currentTable,
      orderType: data.orderType,
      customerName: data.customerName || `Client ${currentTable}`,
      customerPhone: data.customerPhone,
      items: [...cart],
      totalAmount: cartSubtotal,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let savedOrder = newOrder;

    try {
      // Option 2: Write to Firestore in real-time
      const docRef = await addDoc(collection(db, 'orders'), {
        orderNumber: newOrder.orderNumber,
        tableNumber: newOrder.tableNumber,
        orderType: newOrder.orderType,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone || '',
        items: JSON.stringify(newOrder.items),
        totalAmount: newOrder.totalAmount,
        status: 'pending',
        paymentMethod: newOrder.paymentMethod,
        notes: newOrder.notes || '',
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt,
      });

      savedOrder = { ...newOrder, id: docRef.id };
      setActiveOrderId(docRef.id);
    } catch (error) {
      console.warn('Firestore write failed, triggering Option 1 (WhatsApp fallback):', error);
      // Fallback: save locally
      setOrders(prev => [newOrder, ...prev]);
      setActiveOrderId(newOrder.id);
      localStorage.setItem('el_maestro_orders', JSON.stringify([newOrder, ...orders]));
      // Trigger WhatsApp directly
      openWhatsAppFallback(newOrder);
    }

    clearCart();
    setIsCartOpen(false);
    setCurrentView('tracking');
    playNotificationSound();
    return savedOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    playNotificationSound();
    // Optimistic UI update
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, updatedAt: Date.now() } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.warn('Could not update order status in Firestore:', err);
    }
  };

  const callWaiter = async (reason: WaiterCall['reason']) => {
    playNotificationSound();
    const newCall: WaiterCall = {
      id: `call-${Date.now()}`,
      tableNumber: currentTable,
      reason,
      status: 'pending',
      createdAt: Date.now(),
    };

    setWaiterCalls(prev => [newCall, ...prev]);
    setIsWaiterModalOpen(false);

    try {
      await addDoc(collection(db, 'waiterCalls'), {
        tableNumber: currentTable,
        reason,
        status: 'pending',
        createdAt: Date.now(),
      });
    } catch (err) {
      console.warn('Could not save waiter call in Firestore:', err);
    }
  };

  const resolveWaiterCall = async (id: string) => {
    setWaiterCalls(prev => prev.filter(c => c.id !== id));
    try {
      await updateDoc(doc(db, 'waiterCalls', id), {
        status: 'resolved',
      });
    } catch (err) {
      console.warn('Could not resolve waiter call in Firestore:', err);
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        currentTable,
        setCurrentTable,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        orders,
        activeOrder,
        createOrder,
        updateOrderStatus,
        waiterCalls,
        callWaiter,
        resolveWaiterCall,
        currentView,
        setCurrentView,
        isCartOpen,
        setIsCartOpen,
        isWaiterModalOpen,
        setIsWaiterModalOpen,
        isOnline,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

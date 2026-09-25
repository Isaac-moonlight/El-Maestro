export type ProductCategory =
  | 'pizzas'
  | 'chawarmas'
  | 'burgers'
  | 'sandwiches'
  | 'grillades'
  | 'plats_sauce'
  | 'pates'
  | 'salades'
  | 'omelettes'
  | 'accompagnements'
  | 'desserts'
  | 'boissons_fraiches'
  | 'cocktails'
  | 'boissons_chaudes';

export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  ingredients?: string[];
  basePrice: number;
  variants?: MenuVariant[];
  availableOptions?: MenuOption[];
  image?: string;
  isPopular?: boolean;
  isHouseSpecial?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  selectedOptions?: string[];
  optionsPrice: number;
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentMethod = 'cash_table' | 'mobile_money' | 'cashier';

export type AppView = 'menu' | 'tracking' | 'kitchen';

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: 'dine_in' | 'takeaway';
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WaiterCall {
  id: string;
  tableNumber: string;
  reason: 'addition' | 'service' | 'eau' | 'question';
  status: 'pending' | 'resolved';
  createdAt: number;
}

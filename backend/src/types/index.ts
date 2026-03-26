export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface Order {
  id: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderInput {
  items: OrderItemInput[];
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AuthPayload {
  userId: number;
  username: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

import db from './database';
import type { Order, OrderWithItems, OrderItem, OrderInput, PaginatedResult, ServiceResult } from '@/types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function getAllOrders(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): PaginatedResult<OrderWithItems> {
  const offset = (page - 1) * limit;
  
  const ordersStmt = db.prepare(`
    SELECT * FROM orders 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM orders');
  const { total } = countStmt.get() as { total: number };
  
  const orders = ordersStmt.all(limit, offset) as Order[];
  
  const ordersWithItems: OrderWithItems[] = orders.map(order => {
    const itemsStmt = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `);
    const items = itemsStmt.all(order.id) as OrderItem[];
    return { ...order, items };
  });
  
  return {
    success: true,
    data: ordersWithItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getOrderById(id: number): ServiceResult<OrderWithItems> {
  const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const order = orderStmt.get(id) as Order | undefined;
  
  if (!order) return { success: false, error: 'Order not found' };
  
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const items = itemsStmt.all(id) as OrderItem[];
  
  return { success: true, data: { ...order, items } };
}

export function createOrderWithTransaction(input: OrderInput): ServiceResult<OrderWithItems> {
  const insertOrderStmt = db.prepare(`
    INSERT INTO orders (total, status) VALUES (?, 'completed')
  `);
  
  const insertItemStmt = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);
  
  const getProductStmt = db.prepare('SELECT price FROM products WHERE id = ?');
  
  const transaction = db.transaction(() => {
    let total = 0;
    
    for (const item of input.items) {
      const product = getProductStmt.get(item.product_id) as { price: number } | undefined;
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      total += product.price * item.quantity;
    }
    
    const orderResult = insertOrderStmt.run(total);
    const orderId = orderResult.lastInsertRowid as number;
    
    for (const item of input.items) {
      const product = getProductStmt.get(item.product_id) as { price: number };
      insertItemStmt.run(orderId, item.product_id, item.quantity, product.price);
    }
    
    return orderId;
  });
  
  try {
    const orderId = transaction();
    return getOrderById(orderId);
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    };
  }
}
